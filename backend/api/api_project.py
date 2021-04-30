from flask_restx import Api, Resource, fields
from flask_jwt import jwt_required, current_identity
from resources.decorator import check_role
from config import ConfigClass
from models.api_response import APIResponse, EAPIResponseCode
from models.api_meta_class import MetaAPI
from services.logger_services.logger_factory_service import SrvLoggerFactory
from services.container_services.container_manager import SrvContainerManager
from services.neo4j_service.neo4j_client import Neo4jClient
from api import module_api
from flask import request
import json
import requests
import ldap
import re
import ldap.modlist as modlist
from resources.utils import fetch_geid, add_admin_to_project_group, assign_project_role

api_ns_projects = module_api.namespace('Project Restful', description='For project feature', path ='/v1')
api_ns_project = module_api.namespace('Project Restful', description='For project feature', path ='/v1')

_logger = SrvLoggerFactory('api_project').get_logger()

class APIProject(metaclass=MetaAPI):
    '''
    [POST]/projects
    [GET]/projects
    [GET]/project/<project_id>
    '''
    def api_registry(self):
        api_ns_projects.add_resource(self.RestfulProjects, '/projects')
        api_ns_project.add_resource(self.RestfulProject, '/project/<project_id>')
        api_ns_project.add_resource(self.RestfulProjectByCode, '/project/code/<project_code>')
        api_ns_project.add_resource(self.VirtualFolder, '/project/<geid>/vfolders')

    class RestfulProjects(Resource):
        def get(self):
            # init resp
            my_res = APIResponse()
            return my_res.to_dict, my_res.code

        @jwt_required()
        @check_role("admin", True)
        def post(self):
            '''
            This method allow to create a new project in platform.
            Notice that top-level container could only be created by site admin.
            '''

            # get the payload
            post_data = request.get_json()
            _logger.info('Calling API for creating project: {}'.format(post_data))

            metadatas = post_data.pop("metadatas", {})
            container_type = post_data.get("type", None)
            description = post_data.get("description", None)
            project_roles =  post_data.get("roles", None)

            # check the dict type neo4j dont support the dict type
            for x in post_data:
                if type(post_data[x]) == dict:
                    post_data.update({x: json.dumps(post_data[x])})

            name = post_data.get("name", None)
            code = post_data.get("code", None)
            if not name or not code:
                _logger.error('Field name and code field is required.')
                return {'result': "Error the name and code field is required"}, 400

            project_code_pattern = re.compile(ConfigClass.PROJECT_CODE_REGEX)
            is_match = re.search(project_code_pattern, code)

            if not is_match:
                _logger.error('Project code does not match the pattern.')
                return {'result': "Project code does not match the pattern."}, 400

            auth_result = None

            try:
                # Duplicate check 
                url = ConfigClass.NEO4J_SERVICE + "nodes/Dataset/query"
                res = requests.post(url=url, json={"code": code})
                datasets = res.json()
                if datasets:
                    return {'result': 'Error duplicate project code'}, 409


                ## let the hdfs create a dataset
                post_data.update({'path': code})
                post_data['system_tags'] = ['copied-to-core']

                # if we have the parent_id then update relationship label as PARENT
                if post_data.get('parent_id', None):
                    post_data.update({'parent_relation': 'PARENT'})

                # pop the metadatas one layer out
                for x in metadatas:
                    post_data.update({'_%s' % x: metadatas[x]})

                if post_data.get("icon"):
                    # check if icon is bigger then limit
                    if len(post_data.get("icon")) > ConfigClass.ICON_SIZE_LIMIT:
                        return {'result': 'icon too large'}, 413

                post_data["global_entity_id"] = fetch_geid("project")

                result = requests.post(ConfigClass.NEO4J_SERVICE+"nodes/Dataset",
                                    json=post_data)

                # if we get the error in the result as 403
                if result.status_code == 403:
                    raise Exception(json.loads(result.text))
                result = json.loads(result.text)[0]

                # Add admins to dataset
                dataset_id = result.get("id")
                admins = result.get("admin", None)
                error = []
                if(admins is not None):
                    error = bulk_add_user(headers, dataset_id, admins, "admin")
                    if len(error) != 0:
                        return {"result": str(error)}

                # Create folder (project) in Green Room
                url = ConfigClass.DATA_SERVICE + "folders"
                root = result['path']
                if container_type == "Usecase":
                    path = [root, root+"/raw", root+"/processed", root +
                            "/workdir", root+"/trash", root+'/logs']  # Top-level folders
                    vre_path = [root, root + "/raw"]
                else:
                    path = [root]
                    vre_path = [root]

                for p in path:
                    payload = {
                        "path": p
                    }
                    res = requests.post(
                        url=url,
                        json=payload
                    )
                    if(res.status_code != 200):
                        return {'result': json.loads(res.text)}, res.status_code

                # Create folder in VRE Core
                for p in vre_path:
                    res = requests.post(url=url, json={
                        'path': p,
                        'service': 'VRE'
                    })
                    if(res.status_code != 200):
                        return {'result': json.loads(res.text)}, res.status_code

                container_mgr = SrvContainerManager()
                res = container_mgr.list_containers('Dataset', {'type': 'Usecase'})

                access_token = request.headers.get("Authorization", None)
                headers = {
                    'Authorization': access_token
                }

                # Create Project User Group in ldap
                ldap.set_option(ldap.OPT_REFERRALS, ldap.OPT_OFF)
                conn = ldap.initialize(ConfigClass.LDAP_URL)
                conn.simple_bind_s(ConfigClass.LDAP_ADMIN_DN, ConfigClass.LDAP_ADMIN_SECRET)

                dn = "cn=vre-{},ou=Gruppen,ou={},dc={},dc={}".format(code, ConfigClass.LDAP_OU, ConfigClass.LDAP_DC1, ConfigClass.LDAP_DC2)

                objectclass = []
                objectclass.append(ConfigClass.LDAP_objectclass.encode('utf-8'))

                attrs = {}
                attrs['objectclass'] = objectclass

                if description:
                    attrs['description'] = description.encode('utf-8')
                
                ldif = modlist.addModlist(attrs)
                conn.add_s(dn,ldif)

                # Add platform admins to group
                platform_admin_list = []
                url = ConfigClass.NEO4J_SERVICE + "nodes/User/query"
                users_res = requests.post(
                    url=url,
                    headers=headers,
                    json={"role": "admin", "status": "active"}
                )
                users = users_res.json()

                for user in users:
                    email = user["email"]
                    user_query = f'(&(objectClass=user)(mail={email}))'
                    ad_users = conn.search_s(
                        "dc={},dc={}".format(ConfigClass.LDAP_DC1, ConfigClass.LDAP_DC2), 
                        ldap.SCOPE_SUBTREE, 
                        user_query
                    )
                    for user_dn, entry in ad_users:
                        platform_admin_list.append((ldap.MOD_ADD, 'member', [user_dn.encode('utf-8')]))

                conn.modify_s(
                    dn,
                    platform_admin_list
                )

                conn.unbind_s()

                # Sync group info to keycloak
                keycloak_url = ConfigClass.AUTH_SERVICE + 'admin/users/group/sync'
                keycloak_res = requests.post(url=keycloak_url, headers=headers, json={"realm": "vre"})

                if (keycloak_res.status_code != 200):
                    return {'result': json.loads(keycloak_res.text)}, keycloak_res.status_code

                # Create roles
                payload = {
                    "realm": "vre",
                    "project_roles": project_roles,
                    "project_code": code
                }
                keycloak_roles_url = ConfigClass.AUTH_SERVICE + 'admin/users/realm-roles'
                keycloak_roles_res = requests.post(url=keycloak_roles_url, headers=headers, json=payload)
                if keycloak_roles_res.status_code != 200:
                    return {'result': json.loads(keycloak_roles_res.text)}, keycloak_roles_res.status_code

                # Add admin to new group in keycloak and assign project-admin role
                for user in users:
                    add_admin_to_project_group("vre-{}".format(code), user["name"], _logger)
                    _logger.info('user email: {}'.format(user["email"]))
                    if 'email' in user:
                        assign_project_role(user["email"], "{}-admin".format(code), _logger)


            except Exception as e:
                _logger.error('Error in creating project: {}'.format(str(e)))
                return {'result': 'Error %s' % str(e)}, 403

            return {'result': res, 'auth_result': 'create user group successfully'}, 200

    class RestfulProject(Resource):
        def get(self, project_id):
            # init resp
            my_res = APIResponse()
            # init container_mgr
            container_mgr = SrvContainerManager()
            if not project_id:
                my_res.set_code(EAPIResponseCode.bad_request)
                my_res.set_error_msg('Invalid request, need project_id')
            project_info = container_mgr.get_by_project_id(project_id)
            if project_info[0]:
                if len(project_info[1]) > 0:
                    my_res.set_code(EAPIResponseCode.success)
                    my_res.set_result(project_info[1][0])
                else:
                    my_res.set_code(EAPIResponseCode.not_found)
                    my_res.set_error_msg('Project Not Found: ' + project_id)
            else:
                my_res.set_code(EAPIResponseCode.internal_error)
            return my_res.to_dict, my_res.code

    class RestfulProjectByCode(Resource):
        def get(self, project_code):
            # init resp
            my_res = APIResponse()
            # init container_mgr
            container_mgr = SrvContainerManager()
            if not project_code:
                my_res.set_code(EAPIResponseCode.bad_request)
                my_res.set_error_msg('Invalid request, need project_code')
            project_info = container_mgr.get_by_project_code(project_code)
            if project_info[0]:
                if len(project_info[1]) > 0:
                    my_res.set_code(EAPIResponseCode.success)
                    my_res.set_result(project_info[1][0])
                else:
                    my_res.set_code(EAPIResponseCode.not_found)
                    my_res.set_error_msg('Project Not Found: ' + project_code)
            else:
                my_res.set_code(EAPIResponseCode.internal_error)
            return my_res.to_dict, my_res.code

    class VirtualFolder(Resource):
        @jwt_required()
        def put(self, geid):
            my_res = APIResponse()
            if current_identity["role"] != "admin":
                neo4j_client = Neo4jClient()
                response = neo4j_client.get_dataset_role(geid, current_identity["user_id"])
                if response.get("code") == 404:
                    my_res.set_code(EAPIResponseCode.forbidden)
                    my_res.set_error_msg("Permission Denied")
                    return my_res.to_dict, my_res.code
                elif response.get("code") != 200:
                    return response

                project_role = response["result"]
                if not project_role:
                    my_res.set_code(EAPIResponseCode.forbidden)
                    my_res.set_error_msg("Permission Denied")
                    return my_res.to_dict, my_res.code

            url = ConfigClass.DATA_UTILITY_SERVICE + "vfolders/"
            headers = request.headers
            payload = request.get_json()
            response = requests.put(url, json=payload, headers=headers) 
            return response.json()


