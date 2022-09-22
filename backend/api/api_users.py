# Copyright 2022 Indoc Research
# 
# Licensed under the EUPL, Version 1.2 or – as soon they
# will be approved by the European Commission - subsequent
# versions of the EUPL (the "Licence");
# You may not use this work except in compliance with the
# Licence.
# You may obtain a copy of the Licence at:
# 
# https://joinup.ec.europa.eu/collection/eupl/eupl-text-eupl-12
# 
# Unless required by applicable law or agreed to in
# writing, software distributed under the Licence is
# distributed on an "AS IS" basis,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
# express or implied.
# See the Licence for the specific language governing
# permissions and limitations under the Licence.
# 

from flask_restx import Api, Resource, fields
from flask_jwt import jwt_required, current_identity
from flask import request
import requests

from config import ConfigClass
from models.api_meta_class import MetaAPI
from models.api_response import APIResponse, EAPIResponseCode
from api import module_api

api_ns_report = module_api.namespace('Users', description='Users API', path='/v1')


class APIUsers(metaclass=MetaAPI):
    def api_registry(self):
        api_ns_report.add_resource(self.UserRestful, '/users/<username>')

    class UserRestful(Resource):
        @jwt_required()
        def get(self, username):
            api_response = APIResponse()
            data = request.args
            if current_identity["username"] != username:
                api_response.set_error_msg("Username doesn't match current user")
                api_response.set_code(EAPIResponseCode.forbidden)
                return api_response.to_dict, api_response.code
            response = requests.get(ConfigClass.ENTITYINFO_SERVICE + f"users/{username}", params=data)
            return response.json(), response.status_code

        @jwt_required()
        def put(self, username):
            api_response = APIResponse()
            data = request.get_json()
            for key, value in data.items():
                if not "announcement" in key:
                    api_response.set_error_msg("Invalid field, must have a announcement_ prefix")
                    api_response.set_code(EAPIResponseCode.bad_request)
                    return api_response.to_dict, api_response.code
            if current_identity["username"] != username:
                api_response.set_error_msg("Username doesn't match current user")
                api_response.set_code(EAPIResponseCode.forbidden)
                return api_response.to_dict, api_response.code
            response = requests.put(ConfigClass.ENTITYINFO_SERVICE + f"users/{username}", json=data)
            return response.json(), response.status_code
