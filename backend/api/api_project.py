from flask_restx import Api, Resource, fields
from flask_jwt import jwt_required, current_identity
from config import ConfigClass
from models.api_response import APIResponse, EAPIResponseCode
from models.api_meta_class import MetaAPI
from services.logger_services.logger_factory_service import SrvLoggerFactory
from services.container_services.container_manager import SrvContainerManager
from services.neo4j_service.neo4j_client import Neo4jClient
from services.permissions_service.decorators import permissions_check
from api import module_api
from flask import request
import json
import requests
import ldap
import re
import ldap.modlist as modlist
from resources.utils import fetch_geid, add_admin_to_project_group, assign_project_role, add_user_to_ad_group

api_ns_projects = module_api.namespace(
    'Project Restful', description='For project feature', path='/v1')
api_ns_project = module_api.namespace(
    'Project Restful', description='For project feature', path='/v1')

_logger = SrvLoggerFactory('api_project').get_logger()


class APIProject(metaclass=MetaAPI):
    '''
    [POST]/projects
    [GET]/projects
    [GET]/project/<project_id>
    '''

    def api_registry(self):
        # api_ns_projects.add_resource(self.RestfulProjects, '/projects')
        api_ns_project.add_resource(
            self.RestfulProject, '/project/<project_geid>')
        api_ns_project.add_resource(
            self.RestfulProjectByCode, '/project/code/<project_code>')
        api_ns_project.add_resource(
            self.VirtualFolder, '/project/<project_geid>/collections')

    class RestfulProjects(Resource):
        def get(self):
            # init resp
            my_res = APIResponse()
            return my_res.to_dict, my_res.code

        @jwt_required()
        @permissions_check('project', '*', 'create')
        def post(self):
            '''
            This method allow to create a new project in platform.
            Notice that top-level container could only be created by site admin.
            '''

            # get the payload
            post_data = request.get_json()
            _logger.info(
                'Calling API for creating project: {}'.format(post_data))

            container_type = post_data.get("type", None)
            description = post_data.get("description", None)

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
                url = ConfigClass.NEO4J_SERVICE + "nodes/Container/query"
                res = requests.post(url=url, json={"code": code})
                datasets = res.json()
                if datasets:
                    return {'result': 'Error duplicate project code'}, 409

                # let the hdfs create a dataset
                post_data.update({'path': code})
                post_data['system_tags'] = ['copied-to-core']

                # if we have the parent_id then update relationship label as PARENT
                if post_data.get('parent_id', None):
                    post_data.update({'parent_relation': 'PARENT'})

                if post_data.get("icon"):
                    # check if icon is bigger then limit
                    if len(post_data.get("icon")) > ConfigClass.ICON_SIZE_LIMIT:
                        return {'result': 'icon too large'}, 413

                post_data["global_entity_id"] = fetch_geid("project")

                container_result = requests.post(
                    ConfigClass.NEO4J_SERVICE + "nodes/Container",
                    json=post_data
                )
                if container_result.status_code != 200:
                    return container_result.json(), container_result.status_code
                result = container_result.json()[0]

                # Add admins to dataset
                dataset_id = result.get("id")
                admins = result.get("admin", None)
                error = []
                if admins is not None:
                    error = bulk_add_user(headers, dataset_id, admins, "admin")
                    if len(error) != 0:
                        return {"result": str(error)}

                # # Create folder (project) in Green Room
                url = ConfigClass.DATA_SERVICE + "folders"
                root = result['path']
                if container_type == "Usecase":
                    path = [root,  root+"/processed"]  # Top-level folders
                    vre_path = [root]
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
                    if res.status_code != 200:
                        return {'result': json.loads(res.text)}, res.status_code

                # Create folder in VRE Core
                for p in vre_path:
                    res = requests.post(url=url, json={
                        'path': p,
                        'service': 'VRE'
                    })
                    if res.status_code != 200:
                        return {'result': json.loads(res.text)}, res.status_code

                # Create Project User Group in ldap
                ldap.set_option(ldap.OPT_REFERRALS, ldap.OPT_OFF)
                conn = ldap.initialize(ConfigClass.LDAP_URL)
                conn.simple_bind_s(ConfigClass.LDAP_ADMIN_DN,
                                   ConfigClass.LDAP_ADMIN_SECRET)

                dn = "cn=vre-{},ou=Gruppen,ou={},dc={},dc={}".format(code, ConfigClass.LDAP_OU, ConfigClass.LDAP_DC1,
                                                                     ConfigClass.LDAP_DC2)

                objectclass = []
                objectclass.append(
                    ConfigClass.LDAP_objectclass.encode('utf-8'))

                attrs = {}
                attrs['objectclass'] = objectclass

                if description:
                    attrs['description'] = description.encode('utf-8')

                ldif = modlist.addModlist(attrs)
                conn.add_s(dn, ldif)

                # Add platform admins to group
                platform_admin_list = []
                url = ConfigClass.NEO4J_SERVICE + "nodes/User/query"
                users_res = requests.post(
                    url=url,
                    json={"role": "admin", "status": "active"}
                )
                users = users_res.json()

                # exclude the admin user
                origin_users = users
                users = [user for user in users if user['name'] != 'admin']

                access_token = request.headers.get("Authorization", None)
                for user in users:
                    add_user_to_ad_group(
                        user["email"], code, _logger, access_token)

                # Create roles
                payload = {
                    "realm": "vre",
                    "project_roles": ["admin", "collaborator", "contributor"],
                    "project_code": code
                }
                keycloak_roles_url = ConfigClass.AUTH_SERVICE + 'admin/users/realm-roles'
                keycloak_roles_res = requests.post(
                    url=keycloak_roles_url, json=payload)
                if keycloak_roles_res.status_code != 200:
                    return {'result': 'create realm role: ' + json.loads(
                        keycloak_roles_res.text)}, keycloak_roles_res.status_code

                # Add admin to new group in keycloak and assign project-admin role
                for user in origin_users:
                    add_admin_to_project_group(
                        "vre-{}".format(code), user["name"], _logger)
                    _logger.info('user email: {}'.format(user["email"]))

                # create username namespace folder for all platform admin
                _logger.info(
                    f"Creating namespace folder for list of users in platfomr_admin_users : {origin_users}")
                print(origin_users)
                bulk_create_folder_usernamespace(
                    users=origin_users, project_code=code)

            except Exception as e:
                _logger.error('Error in creating project: {}'.format(str(e)))
                return {'result': 'Error %s' % str(e)}, 403

            return {'result': container_result.json(), 'auth_result': 'create user group successfully'}, 200

    class RestfulProject(Resource):
        @jwt_required()
        @permissions_check('project', '*', 'view')
        def get(self, project_geid):
            # init resp
            my_res = APIResponse()
            # init container_mgr
            container_mgr = SrvContainerManager()
            if not project_geid:
                my_res.set_code(EAPIResponseCode.bad_request)
                my_res.set_error_msg('Invalid request, need project_geid')

            project_info = container_mgr.get_by_project_geid(project_geid)
            if project_info[0]:
                if len(project_info[1]) > 0:
                    my_res.set_code(EAPIResponseCode.success)
                    my_res.set_result(project_info[1][0])
                else:
                    my_res.set_code(EAPIResponseCode.not_found)
                    my_res.set_error_msg('Project Not Found: ' + project_geid)
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
        @permissions_check('collections', '*', 'update')
        def put(self, project_geid):
            my_res = APIResponse()
            url = ConfigClass.DATA_UTILITY_SERVICE + "collections/"
            payload = request.get_json()
            payload["username"] = current_identity["username"]
            response = requests.put(url, json=payload)
            return response.json()


def create_folder_usernamespace(users, project_code):
    for user in users:
        try:
            _logger.info(
                f"creating namespace folder in greenroom and vrecore for user : {user['name']}")
            zone_list = ["greenroom", "vrecore"]
            for zone in zone_list:
                payload = {
                    "folder_name": user["name"],
                    "project_code": project_code,
                    "zone": zone,
                    "uploader": user["name"],
                    "tags": []
                }
                folder_creation_url = ConfigClass.DATA_UPLOAD_SERVICE_GREENROOM+'/folder'
                res = requests.post(
                    url=folder_creation_url,
                    json=payload
                )
                if res.status_code == 200:
                    _logger.info(
                        f"Namespace folder created successfully for user : {user['name']}")
        except Exception as error:
            _logger.error(
                f"Error while trying to create namespace folder for user : {user['name']} : {error}")


def bulk_create_folder_usernamespace(users, project_code):
    try:
        folders = []
        zone_list = ["greenroom", "vrecore"]
        for zone in zone_list:
            for user in users:
                folders.append({
                    "name": user["name"],
                    "project_code": project_code,
                    "uploader": user["name"],
                })

            folder_creation_url = ConfigClass.DATA_UPLOAD_SERVICE_GREENROOM+'/folder/bulk'
            payload = {
                "folders": folders,
                "zone": zone,
            }
            res = requests.post(
                url=folder_creation_url,
                json=payload
            )
            if res.status_code == 200:
                _logger.info(
                    f"Namespace folder created successfully for users")

    except Exception as error:
        _logger.error(
            f"Error while trying to bulk create namespace folder, error: {error}")
