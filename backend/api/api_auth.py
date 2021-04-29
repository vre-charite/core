from flask_restx import Api, Resource, fields
from flask import request
import requests
from api import module_api
from models.api_meta_class import MetaAPI
from services.logger_services.logger_factory_service import SrvLoggerFactory
from models.api_response import APIResponse, EAPIResponseCode
from flask_jwt import jwt_required, current_identity
from resources.decorator import check_role
from config import ConfigClass
import jwt as pyjwt


api_ns_auth = module_api.namespace(
    'Auth Service Restful', description='Auth Service Restful', path='/v1')


class APIAuthService(metaclass=MetaAPI):
    def api_registry(self):
        api_ns_auth.add_resource(
            self.AdminRestful, '/datasets/<dataset_id>/users/email')
        api_ns_auth.add_resource(
            self.LastLoginRestful, '/users/lastlogin')
        api_ns_auth.add_resource(self.UserStatus, '/user/status')
        api_ns_auth.add_resource(self.UserAccount, '/user/account')

    class AdminRestful(Resource):
        @jwt_required()
        @check_role("admin")
        def get(self, dataset_id):
            '''
            This method allow to check email in keycloak. More information refers to auth service.
            '''
            try:
                arg = request.args
                payload = request.get_json()
                headers = request.headers
                res = requests.get(ConfigClass.AUTH_SERVICE+'admin/users/email',
                                   params=arg, json=payload, headers=headers)

                return res.json(), res.status_code
            except Exception as e:
                return {'result': str(e)}, 403



    class LastLoginRestful(Resource):
        @jwt_required()
        def post(self):
            '''
            This method allow to update user's last login time 
            '''

            try:
                payload = request.get_json()
                headers = request.headers
                res = requests.post(ConfigClass.AUTH_SERVICE+'users/lastlogin',
                                   json=payload, headers=headers)

                return res.json(), res.status_code
            except Exception as e:
                return {'result': str(e)}, 403

    class UserStatus(Resource):
        def get(self):
            '''
            Gets the users status given the email
            '''
            try:
                token = request.headers.get('Authorization')
                token = token.split()[-1]
                decoded = pyjwt.decode(token, verify=False)
                email = decoded["email"]
            except Exception as e:
                return {'result': "JWT user status error " + str(e)}, 500

            try:
                payload = {
                    "email": email
                }
                response = requests.get(ConfigClass.AUTH_SERVICE + "user/status", params=payload)
                return response.json(), response.status_code
            except Exception as e:
                return {'result': "Error calling auth service" + str(e)}, 500

    class UserAccount(Resource):
        @jwt_required()
        def put(self):
            '''
            User account management
            '''
            try:
                token = request.headers.get('Authorization')
                token = token.split()[-1]
                decoded = pyjwt.decode(token, verify=False)
            except Exception as e:
                return {'result': "JWT user status error " + str(e)}, 500
            try:
                req_body = request.get_json()
                operation_type = req_body.get('operation_type', None)
                user_email = req_body.get('user_email', None)
                user_geid = req_body.get('user_geid', None)
                realm = req_body.get('realm', 'vre')
                operation_payload = req_body.get('payload', {})
                # check parameters
                if not operation_type:
                    return {'result': 'operation_type required.'}, 400
                # check user identity
                if not user_email and not user_geid:
                    return {'result': 'either user_email or user_geid required.'}, 400
                # check user operation type
                if not operation_type in ['enable', 'restore', 'disable']:
                    return {'result': 'operation {} is not allowed'.format(operation_type)}, 400
                payload = {
                    "operation_type": operation_type,
                    "user_geid": user_geid,
                    "user_email": user_email,
                    "realm": realm,
                    "payload": operation_payload
                }
                headers = request.headers
                response = requests.put(ConfigClass.AUTH_SERVICE + "user/account", json=payload, headers=headers)
                return response.json(), response.status_code
            except Exception as e:
                return {'result': "Error calling user account management service" + str(e)}, 500