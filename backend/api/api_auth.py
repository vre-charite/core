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


api_ns_auth = module_api.namespace(
    'Auth Service Restful', description='Auth Service Restful', path='/v1')


class APIAuthService(metaclass=MetaAPI):
    def api_registry(self):
        api_ns_auth.add_resource(
            self.AdminRestful, '/datasets/<dataset_id>/users/email')
        api_ns_auth.add_resource(
            self.LastLoginRestful, '/users/lastlogin')

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

