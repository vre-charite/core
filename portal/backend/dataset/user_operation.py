from flask import request
import requests
import os
import json
from flask_jwt import jwt_required, current_identity
from resources.decorator import check_role, check_user
from resources.utils import *
from flask_restx import Resource
from dataset import users_entity_ns, datasets_entity_ns
from resources.swagger_modules import user_module, new_user_module, user_sample_return, users_sample_return
from resources.swagger_modules import permission_return, success_return
from resources.swagger_modules import dataset_sample_return, datasets_sample_return
from config import ConfigClass
from services.invitation_services.invitation_manager import SrvInvitationManager
from services.notifier_services.email_service import SrvEmail
from services.logger_services.logger_factory_service import SrvLoggerFactory
from services.user_services.user_email_template import update_role_email_body_generator, invite_user_email_body_generator


# init logger
_logger = SrvLoggerFactory('api_user_ops').get_logger()


class users(Resource):
    @users_entity_ns.expect(user_module)
    @users_entity_ns.response(200, user_sample_return)
    @jwt_required()
    @check_role("site-admin")
    def post(self):
        '''
        This method allow site admin to invite a user.
        '''
        try:
            # Fetch payload
            post_data = request.get_json()
            _logger.info(
                'Call API for inviting a user to platform: {}'.format(post_data))

            username = post_data.get("name", None)
            password = post_data.get("password", None)
            first_name = post_data.get("first_name", None)
            last_name = post_data.get("last_name", None)
            email = post_data.get("email", None)
            role = post_data.get("role", None)
            access_token = request.headers.get("Authorization", None)

            if not username or not password or not first_name or not last_name:
                _logger.error(
                    'Field username/password/first_name/last_name  is required.')
                return {'result': 'missing username, password, first name or last name'}, 400

            if not access_token:
                _logger.error('Valid token is required')
                return {'result': 'missing valid token'}, 400

            # since keycloak will change the uppercase into lower so enforce lowercase here
            if any([x.isupper() for x in username]):
                _logger.error('Username must be all lowercase')
                return {'result': 'username must be all lowercase'}, 403

            # Create a user in keycloak
            # TODO: remove admin password in the payload
            url = ConfigClass.KONG_BASE+"portal/admin/users"
            print(url)
            headers = {
                'Authorization': access_token
            }
            payload = {
                "admin_username": "admin",
                "admin_password": "amenamen",
                "realm": "vre",
                "username": username,
                "password": password,
                "email": email,
                "firstname": first_name,
                "lastname": last_name
            }

            res = requests.post(
                url=url,
                headers=headers,
                json=payload
            )

            if res.status_code == 401:
                return {'result': 'Permission Denied'}, 401
            elif res.status_code >= 400:
                _logger.error('Failed to add user to keycloak')
                return {'result': 'fail to add user to keycloak.'}

            # Create user node and default dataset node in neo4j
            post_data.pop("password", None)
            post_data['path'] = "users"
            if(role is None):
                post_data['role'] = "member"
            url = ConfigClass.NEO4J_SERVICE + "nodes/User"
            headers = {
                'Authorization': access_token
            }
            res = requests.post(
                url=url,
                headers=headers,
                json=post_data
            )
            if(res.status_code != 200):
                _logger.error('Failed to add user node to neo4j: {}'.format(
                    json.loads(res.text)))
                return {'result': json.loads(res.text)}, res.status_code

        except Exception as e:
            _logger.error(
                'Error in inviting user to platform: {}'.format(str(e)))
            return {'result': str(e)}, 403

        return {'result': json.loads(res.text)}, 200

    # not used
    @users_entity_ns.response(200, users_sample_return)
    @jwt_required()
    @check_role("site-admin")
    def get(self):
        '''
        This method allow user to fetch all registered users in the platform.
        '''
        _logger.info(
            'Call API for to admin fetching all users in the platform')
        try:
            # Get token from reuqest's header
            access_token = request.headers.get("Authorization", None)

            # Fetch all user nodes from neo4j
            url = ConfigClass.NEO4J_SERVICE + "nodes/User/query"
            headers = {
                'Authorization': access_token
            }
            res = requests.post(
                url=url,
                headers=headers
            )

            if(res.status_code != 200):
                _logger.error('Failed to fetch info in neo4j: {}'.format(
                    json.loads(res.text)))
                return {'result': json.loads(res.text)}, res.status_code

        except Exception as e:
            _logger.error('Error in fetching all users: {}'.format(str(e)))
            return {'Error': str(e)}, 403

        return {"result": json.loads(res.text)}


class user_registry(Resource):
    @users_entity_ns.expect(new_user_module)
    @users_entity_ns.response(200, user_sample_return)
    def post(self):
        '''
        This method allow user to register by invitation link.
        '''
        try:
            # Check if hash string is valid and decode info(email, container_id, role) @Ma
            post_data = request.get_json()
            _logger.info(
                'Calling API for registering user: {}'.format(post_data))

            hashId = post_data.get("token", None)
            srv_invitation_manager = SrvInvitationManager()
            if not hashId or not srv_invitation_manager.validate_invitation_code(hashId):
                _logger.error('Error: invitation link is not valid')
                return {'result': 'Invalid HashID.'}, 400

            # Check if payload is sufficient
            email = post_data.get('email', None)
            container_id = post_data.get("project_id", None)
            role = post_data.get("role", None)
            username = post_data.get("username", None)
            password = post_data.get("password", None)
            first_name = post_data.get("first_name", None)
            last_name = post_data.get("last_name", None)
            if not username or not password or not first_name or not last_name \
                    or not email or not container_id or not role:
                _logger.error(
                    'Require field email/container_id/role/username/password/first_name/last_name.')
                return {'result': 'Required information is not sufficient.'}, 400

            # since keycloak will change the uppercase into lower so enforce lowercase here
            if any([x.isupper() for x in username]):
                _logger.error('Username must be all lowercase.')
                return {'result': 'username must be all lowercase'}, 403

            # convert email to lowercase
            email = email.lower()

            # Add user in keycloak
            payload = {
                "realm": "vre",
                "username": username,
                "password": password,
                "email": email,
                "firstname": first_name,
                "lastname": last_name
            }
            res = requests.post(
                url=ConfigClass.AUTH_SERVICE+"admin/users",
                json=payload
            )
            if(res.status_code != 200):
                _logger.error('Error: calling auth service keycloak.')
                return {'result': json.loads(res.content)}, res.status_code

            _logger.info('Done with adding user to keycloak')

            # Add user in neo4j
            payload = {
                "name": username,
                "email": email,
                "first_name": first_name,
                "last_name": last_name,
                "path": "users",
                "role": "member"
            }
            res = requests.post(
                url=ConfigClass.NEO4J_SERVICE + "nodes/User",
                json=payload
            )
            if(res.status_code != 200):
                _logger.error(
                    'Calling neo4j service add user to neo4j.')
                return {'result': 'neo add user '+json.loads(res.text)}, res.status_code
            user = json.loads(res.text)[0]
            uid = user['id']
            _logger.info('Done with adding user node to neo4j')

            # Add relationship in neo4j
            url = ConfigClass.NEO4J_SERVICE + "relations/"+role
            res = requests.post(
                url=url,
                json={
                    "start_id": int(uid),
                    "end_id": int(container_id)
                }
            )
            if(res.status_code != 200):
                _logger.error(
                    'Calling neo4j service add relationship between user and container.')
                return {'result': 'neo add relation'+json.loads(res.text)}, res.status_code
            _logger.info(
                'Done with adding relationship between user node and container in neo4j')

        except Exception as e:
            _logger.error(
                'Error in registering user with inviation link: {}'.format(str(e)))
            return {'result': str(e)}, 403

        return {"result": user}


class dataset_users(Resource):

    @datasets_entity_ns.response(200, users_sample_return)
    @jwt_required()
    @check_role("uploader")
    def get(self, dataset_id):
        '''
        This method allow user to fetch all users under a specific dataset with permissions.
        '''
        _logger.info(
            'Calling API for fetching all users under dataset {}'.format(str(dataset_id)))

        try:
            # Get token from reuqest's header
            access_token = request.headers.get('Authorization', None)
            headers = {
                'Authorization': access_token
            }

            # Check if dataset exist
            url = ConfigClass.NEO4J_SERVICE + 'nodes/Dataset/node/' + dataset_id
            res = requests.get(
                url=url,
                headers=headers
            )
            datasets = json.loads(res.text)
            if(len(datasets) == 0):
                _logger.error(
                    'Dataset %s is not available.' % dataset_id)
                return {'result': 'Dataset %s is not available.' % dataset_id}, 404

            # Fetch all users under the dataset
            url = ConfigClass.NEO4J_SERVICE + 'relations/query'
            payload = {
                'start_label': 'User',
                'end_label': 'Dataset',
                'end_params': {'code': datasets[0]['code']}
            }
            res = requests.post(
                url=url,
                headers=headers,
                json=payload
            )

            if(res.status_code != 200):
                _logger.error(
                    'Calling neo4j service %s.' % str(res.text))
                return {'result': json.loads(res.text)}, res.status_code

            # Format response
            result = []
            for x in json.loads(res.text):
                temp = x['start_node']
                temp["permission"] = x['r']['type']
                result.append(temp)

        except Exception as e:
            _logger.error(
                'Error in fetching all users under a specific dataset: {}'.format(str(e)))
            return {'result': str(e)}, 403

        return {"result": result}

    # deprecate?
    @datasets_entity_ns.response(200, success_return)
    @jwt_required()
    @check_role("admin")
    def post(self, dataset_id):
        '''
        This method allow user to bulk add users to a specific dataset with permissions.
        '''
        _logger.info(
            'Calling API for bulk adding users to dataset {}'.format(str(dataset_id)))

        try:
            # Get token from reuqest's header
            access_token = request.headers.get("Authorization", None)
            headers = {
                'Authorization': access_token
            }

            # Check if dataset exist
            url = ConfigClass.NEO4J_SERVICE + "nodes/Dataset/node/" + dataset_id
            res = requests.get(
                url=url,
                headers=headers
            )
            datasets = json.loads(res.text)
            if(len(datasets) == 0):
                _logger.error(
                    'Dataset %s is not available.' % dataset_id)
                return {'result': "Dataset %s is not available." % dataset_id}, 404

            if('type' in datasets[0] and datasets[0]['type'] == "default"):
                _logger.error(
                    'Dataset %s is default.' % dataset_id)
                return {'result': 'Dataset %s is default.' % dataset_id}, 403

            # then start to get the added user
            post_data = request.get_json()
            users = post_data.get("users", [])
            role = post_data.get("role", "member")
            error = bulk_add_user(headers, dataset_id, users, role)
            if len(error) != 0:
                return {"result": str(error)}

        except Exception as e:
            _logger.error('Error in bulk adding user: {}'.format(str(e)))
            return {'result': str(e)}, 403

        return {"result": "success"}, 200


class dataset_user(Resource):
    @datasets_entity_ns.response(200, success_return)
    @jwt_required()
    @check_role("admin")
    def post(self, username, dataset_id):
        '''
        This method allow container admin to add single user to a specific dataset with permission.
        '''
        _logger.info('Call API for adding user {} to dataset {}'.format(
            username, str(dataset_id)))
        try:
            # Get token from reuqest's header
            access_token = request.headers.get("Authorization", None)
            headers = {
                'Authorization': access_token
            }

            # Check if permission is provided
            role = request.get_json().get("role", None)
            if(role is None):
                _logger.error('Error: user\'s role is required.')
                return {'result': "User's role is required."}, 403

            # Check if dataset exist
            url = ConfigClass.NEO4J_SERVICE + "nodes/Dataset/node/" + dataset_id
            res = requests.get(
                url=url,
                headers=headers
            )
            datasets = json.loads(res.text)
            if(len(datasets) == 0):
                _logger.error('User\'s role is required.')
                return {'result': "Dataset %s is not available." % dataset_id}, 404

            if('type' in datasets[0] and datasets[0]['type'] == "default"):
                _logger.error('Dataset %s is default.' % dataset_id)
                return {'result': "Dataset %s is default." % dataset_id}, 403
            dataset_name = datasets[0]['name']

            # Check if user is existed
            url = ConfigClass.NEO4J_SERVICE + "nodes/User/query"
            res = requests.post(
                url=url,
                headers=headers,
                json={"name": username}
            )
            users = json.loads(res.text)
            if(len(users) == 0):
                _logger.error('User %s does not exist.' % username)
                return {'result': "User %s does not exist." % username}, 403
            user_id = users[0]['id']

            # also check if they alreay have the relationsihp
            url = ConfigClass.NEO4J_SERVICE + "relations/query"
            res = requests.post(
                url=url,
                headers=headers,
                json={
                    'start_label': 'User',
                    'start_params': {'id': user_id},
                    'end_label': 'Dataset',
                    'end_params': {'id': int(dataset_id)},
                }
            )
            if res.status_code != 200:
                return {'result': res.text}, res.status_code

            user_dataset_relation = res.json()
            if len(user_dataset_relation) > 0:
                _logger.error(
                    'User %s already in the project please check.' % username)
                return {'result': 'User %s already in the project please check.' % username}, 403

            # Add relation between user and container
            url = ConfigClass.NEO4J_SERVICE + "relations/"+role
            res = requests.post(
                url=url,
                headers=headers,
                json={
                    "start_id": int(user_id),
                    "end_id": int(dataset_id)
                }
            )
            if(res.status_code != 200):
                _logger.error('neo4j service: {}'.format(json.loads(res.text)))
                return {'result': json.loads(res.text)}, res.status_code

            # Send email to inform user
            try:
                email = users[0]['email']
                admin_name = current_identity["username"]
                admin_email = current_identity["email"]
                title = "Project %s Notification: New Invitation" % (
                    str(dataset_name))
                content = invite_user_email_body_generator(
                    username, admin_name, dataset_name, role, ConfigClass.INVITATION_URL_LOGIN, admin_email)
                SrvEmail().send(title, content, [email], "html")

            except Exception as e:
                _logger.error('email service: {}'.format(str(e)))
                return {'result': "Failed to send email," + str(e)}, 403

        except Exception as e:
            return {'result': str(e)}, 403

        return {'result': json.loads(res.text)}, 200

    @datasets_entity_ns.response(200, success_return)
    @jwt_required()
    @check_role("admin")
    def put(self, username, dataset_id):
        '''
        This method allow user to update user's permission to a specific dataset.
        '''

        _logger.info('Call API for changing user {} role in project {}'.format(
            username, dataset_id))

        try:
            # Get token from reuqest's header
            access_token = request.headers.get("Authorization", None)
            headers = {
                'Authorization': access_token
            }

            # Check if permission is provided
            old_role = request.get_json().get("old_role", None)
            new_role = request.get_json().get("new_role", None)
            if(old_role is None or new_role is None):
                _logger.error("User's old and new role is required.")
                return {'result': "User's old and new role is required."}, 403

            # Check if user is themself
            current_user = current_identity["username"]
            if current_user == username:
                _logger.error("User cannot change their own role.")
                return {'result': "User cannot change their own role."}, 403

            # Check if dataset exist
            url = ConfigClass.NEO4J_SERVICE + "nodes/Dataset/node/" + dataset_id
            res = requests.get(
                url=url,
                headers=headers
            )
            datasets = json.loads(res.text)
            if(len(datasets) == 0):
                _logger.error("Dataset %s is not available." % dataset_id)
                return {'result': "Dataset %s is not available." % dataset_id}, 404

            if('type' in datasets[0] and datasets[0]['type'] == "default"):
                _logger.error("Dataset %s is default." % dataset_id)
                return {'result': "Dataset %s is default." % dataset_id}, 403
            dataset_name = datasets[0]['name']

            # Check if user is existed
            url = ConfigClass.NEO4J_SERVICE + "nodes/User/query"
            res = requests.post(
                url=url,
                headers=headers,
                json={"name": username}
            )
            users = json.loads(res.text)
            if(len(users) == 0):
                _logger.error("User %s does not exist." % username)
                return {'result': "User %s does not exist." % username}, 404
            user_id = users[0]['id']

            # # also check if user in the project
            url = ConfigClass.NEO4J_SERVICE + "relations/query"
            res = requests.post(
                url=url,
                headers=headers,
                json={
                    'start_label': 'User',
                    'start_params': {'id': user_id},
                    'end_label': 'Dataset',
                    'end_params': {'id': int(dataset_id)},
                }
            )
            if res.status_code != 200:
                return {'result': res.text}, res.status_code
            else:
                result = json.loads(res.text)
                if (len(result) == 0):
                    _logger.error(
                        "User %s does not exist in project." % username)
                    return {'result': "User %s does not exist in project." % username}, 404

            # Update relation between user and container
            url = ConfigClass.NEO4J_SERVICE + "relations/"+old_role
            res = requests.put(
                url=url,
                headers=headers,
                json={
                    "start_id": int(user_id),
                    "end_id": int(dataset_id),
                    "new_label": new_role
                }
            )
            # TODO:if old role is not true, no error response
            if(res.status_code != 200):
                _logger.error("neo4j service: {}".format(json.loads(res.text)))
                return {'result': json.loads(res.text)}, res.status_code

            # Send email to inform user
            try:
                email = users[0]['email']
                admin_name = current_identity["username"]
                admin_email = current_identity["email"]
                title = "Project %s Notification: Role Modified" % (
                    str(dataset_name))
                content = update_role_email_body_generator(
                    username, admin_name, dataset_name, new_role, ConfigClass.INVITATION_URL_LOGIN, admin_email)
                SrvEmail().send(title, content, [email], "html")

            except Exception as e:
                _logger.error("email service: {}".format(str(e)))
                return {'result': "Failed to send email," + str(e)}, 403

        except Exception as e:
            _logger.error(
                'Error in updating user\'s role info: {}'.format(str(e)))
            return {'result': str(e)}, 403

        return {'result': 'success'}, 200

    @datasets_entity_ns.response(200, success_return)
    @jwt_required()
    @check_role("admin")
    def delete(self, username, dataset_id):
        '''
        This method allow user to remove user's permission to a specific dataset.
        '''
        _logger.info('Call API for removing user {} from project {}:'.format(
            username, dataset_id))
        try:
            # Get token from reuqest's header
            access_token = request.headers.get("Authorization", None)
            headers = {
                'Authorization': access_token
            }

            # Check if user is existed
            url = ConfigClass.NEO4J_SERVICE + "nodes/User/query"
            res = requests.post(
                url=url,
                headers=headers,
                json={"name": username}
            )
            users = json.loads(res.text)
            if(len(users) == 0):
                _logger.error("User %s does not exist." % username)
                return {'result': "User %s does not exist." % username}, 404
            user_id = users[0]['id']

            # # also check if user in the project
            url = ConfigClass.NEO4J_SERVICE + "relations/query"
            res = requests.post(
                url=url,
                headers=headers,
                json={
                    'start_label': 'User',
                    'start_params': {'id': user_id},
                    'end_label': 'Dataset',
                    'end_params': {'id': int(dataset_id)},
                }
            )
            if res.status_code != 200:
                return {'result': res.text}, res.status_code
            else:
                result = json.loads(res.text)
                if (len(result) == 0):
                    _logger.error(
                        "User %s does not exist in project." % username)
                    return {'result': "User %s does not exist in project." % username}, 404

            # Get relation between user and container
            url = ConfigClass.NEO4J_SERVICE + "relations"
            url += "?start_id=%d" % int(user_id)
            url += "&end_id=%d" % int(dataset_id)
            res = requests.get(url=url)
            if(res.status_code != 200 or len(json.loads(res.text)) == 0):
                raise Exception("No relation found.")

            # Delete relation between user and container
            url = ConfigClass.NEO4J_SERVICE + "relations"
            url += "?start_id=%d" % int(user_id)
            url += "&end_id=%d" % int(dataset_id)
            res = requests.delete(url=url)
            if(res.status_code != 200):
                _logger.error('neo4j service: {}'.format(json.loads(res.text)))
                return {'result': json.loads(res.text)}, res.status_code

        except Exception as e:
            _logger.error(
                'Error in removing user: {}'.format(str(e)))
            return {'result': str(e)}, 403

        return {'result': 'success'}, 200

# Deprecate


class user_dataset_query(Resource):

    @ users_entity_ns.response(200, permission_return)
    @ jwt_required()
    @ check_user()
    def get(self, username):
        '''
        This method allow user to get the user's permission towards all containers (except default).
        '''
        _logger.info('Call API for fetching user {} role towards all projects'.format(
            username))
        try:
            # Get token from reuqest's header
            access_token = request.headers.get("Authorization", None)
            headers = {
                'Authorization': access_token
            }

            # Check if user is admin
            url = ConfigClass.NEO4J_SERVICE + "nodes/User/query"
            res = requests.post(
                url=url,
                headers=headers,
                json={"name": username}
            )
            users = json.loads(res.text)
            if(len(users) == 0):
                _logger.error("User %s does not exist." % username)
                return {'result': "User %s does not exist." % username}, 404
            user_role = users[0]['role']

            if user_role == "admin":
                # Fetch all container
                datasets = list_containers(access_token, "Dataset")

                # Format response and filter out default
                result = []
                for x in datasets:
                    dataset_type = x.get("type", None)
                    if dataset_type and dataset_type != "default":
                        temp = {
                            "container_id": x['id'],
                            "container_name": x['name'],
                            "code": x['code'],
                            "permission": "admin"
                        }
                        result.append(temp)
                return {'result': {
                    "role": user_role,
                    "permission": result
                }}, 200

            # Fetch all datasets that connected to the user
            url = ConfigClass.NEO4J_SERVICE + "relations/query"
            payload = {
                "start_label": "User",
                "end_label": "Dataset",
                "start_params": {"name": username}
            }
            res = requests.post(
                url=url,
                headers=headers,
                json=payload
            )

            if(res.status_code != 200):
                _logger.error("neo4j service: {}".format(json.loads(res.text)))
                return {'result': json.loads(res.text)}, res.status_code

            # Format response
            result = []
            for x in json.loads(res.text):
                temp = {
                    "container_id": x['end_node']['id'],
                    "container_name": x['end_node']['name'],
                    "code": x['end_node']['code'],
                    "permission": x['r']['type']
                }
                result.append(temp)

        except Exception as e:
            _logger.error(
                'Error in fetching user\'s role towards all projects: {}'.format(str(e)))
            return {'result': str(e)}, 500

        return {'result': {
            "role": user_role,
            "permission": result
        }}, 200


# Deprecate
class user_default_dataset(Resource):
    @ users_entity_ns.response(200, datasets_sample_return)
    @ jwt_required()
    @ check_user()
    def get(self, username):
        '''
        This method allow user to get the user's default dataset.
        '''
        try:
            # Get token from reuqest's header
            access_token = request.headers.get("Authorization", None)
            headers = {
                'Authorization': access_token
            }

            # Fetch default dataset that connected to the user
            url = ConfigClass.NEO4J_SERVICE + "relations/query"
            payload = {
                "label": "admin",
                "start_label": "User",
                "end_label": "Dataset",
                "start_params": {"name": username},
                "end_params": {"type": "default"}
            }
            res = requests.post(
                url=url,
                headers=headers,
                json=payload
            )
            result = json.loads(res.text)
            if(len(result) == 0):
                return {'result': []}, 200

            # Format response
            result = [x['end_node'] for x in json.loads(res.text)]

        except Exception as e:
            return {'result': str(e)}, 403

        return {'result': result}, 200

    @ users_entity_ns.response(200, dataset_sample_return)
    @ jwt_required()
    @ check_user()
    def post(self, username):
        '''
        This method allow user to create the default dataset.
        '''
        try:
            # Get token from reuqest's header
            access_token = request.headers.get("Authorization", None)
            headers = {
                'Authorization': access_token
            }

            # Check if user is existed
            url = ConfigClass.NEO4J_SERVICE + "nodes/User/query"
            res = requests.post(
                url=url,
                headers=headers,
                json={"name": username}
            )
            users = json.loads(res.text)
            if(len(users) == 0):
                return {'result': "User %s does not exist." % username}, 404
            user_id = users[0]['id']

            # create a default dataset node
            url = ConfigClass.NEO4J_SERVICE + "nodes/Dataset"
            default_name = username+"_default"
            payload = {
                "name": default_name,
                "type": "default",
                "parent_id": user_id,
                "parent_relation": "admin",
                "path": default_name
            }
            neo_res = requests.post(
                url=url,
                headers=headers,
                json=payload
            )
            if(neo_res.status_code != 200):
                return {'result': json.loads(neo_res.text)}, res.status_code

            # Create folder in NFS
            url = ConfigClass.DATA_SERVICE + "folders"
            payload = {
                "path": os.path.join("users", default_name)
            }
            res = requests.post(
                url=url,
                json=payload
            )
            if(res.status_code != 200):
                return {'result': json.loads(res.text)}, res.status_code

        except Exception as e:
            return {'Error': str(e)}, 403

        return {'result': json.loads(neo_res.text)}, 200
