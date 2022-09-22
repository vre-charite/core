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

from services.logger_services.logger_factory_service import SrvLoggerFactory
from models.api_meta_class import MetaAPI
from api import module_api
from config import ConfigClass
from models.api_response import APIResponse, EAPIResponseCode
import requests
from .utils import check_dataset_permissions

api_resource = module_api.namespace('DatasetProxy', description='Versions API', path='/v1/dataset/')

_logger = SrvLoggerFactory('api_schema').get_logger()


class APISchema(metaclass=MetaAPI):
    def api_registry(self):
        api_resource.add_resource(self.SchemaCreate, '/<dataset_geid>/schema')
        api_resource.add_resource(self.Schema, '/<dataset_geid>/schema/<schema_geid>')
        api_resource.add_resource(self.SchemaList, '/<dataset_geid>/schema/list')

    class SchemaCreate(Resource):
        @jwt_required()
        def post(self, dataset_geid):
            api_response = APIResponse()
            valid, response = check_dataset_permissions(dataset_geid)
            if not valid:
                return response.to_dict, response.code

            try:
                response = requests.post(ConfigClass.DATASET_SERVICE + f"schema", json=request.get_json())
            except Exception as e:
                _logger.info(f"Error calling dataset service: {str(e)}")
                api_response.set_code(EAPIResponseCode.internal_error)
                api_response.set_result(f"Error calling dataset service: {str(e)}")
                return api_response.to_dict, api_response.code
            return response.json(), response.status_code

    class Schema(Resource):
        @jwt_required()
        def put(self, dataset_geid, schema_geid):
            api_response = APIResponse()
            valid, response = check_dataset_permissions(dataset_geid)
            if not valid:
                return response.to_dict, response.code

            payload = request.get_json()
            payload["username"] = current_identity["username"]
            try:
                response = requests.put(ConfigClass.DATASET_SERVICE + f"schema/{schema_geid}", json=payload)
            except Exception as e:
                _logger.info(f"Error calling dataset service: {str(e)}")
                api_response.set_code(EAPIResponseCode.internal_error)
                api_response.set_result(f"Error calling dataset service: {str(e)}")
                return api_response.to_dict, api_response.code
            return response.json(), response.status_code

        @jwt_required()
        def get(self, dataset_geid, schema_geid):
            api_response = APIResponse()
            valid, response = check_dataset_permissions(dataset_geid)
            if not valid:
                return response.to_dict, response.code

            try:
                response = requests.get(ConfigClass.DATASET_SERVICE + f"schema/{schema_geid}")
            except Exception as e:
                _logger.info(f"Error calling dataset service: {str(e)}")
                api_response.set_code(EAPIResponseCode.internal_error)
                api_response.set_result(f"Error calling dataset service: {str(e)}")
                return api_response.to_dict, api_response.code
            return response.json(), response.status_code

        @jwt_required()
        def delete(self, dataset_geid, schema_geid):
            api_response = APIResponse()
            valid, response = check_dataset_permissions(dataset_geid)
            if not valid:
                return response.to_dict, response.code

            payload = request.get_json()
            payload["username"] = current_identity["username"]
            payload["dataset_geid"] = dataset_geid
            try:
                response = requests.delete(ConfigClass.DATASET_SERVICE + f"schema/{schema_geid}", json=payload)
            except Exception as e:
                _logger.info(f"Error calling dataset service: {str(e)}")
                api_response.set_code(EAPIResponseCode.internal_error)
                api_response.set_result(f"Error calling dataset service: {str(e)}")
                return api_response.to_dict, api_response.code
            return response.json(), response.status_code

    class SchemaList(Resource):
        @jwt_required()
        def post(self, dataset_geid):
            api_response = APIResponse()
            valid, response = check_dataset_permissions(dataset_geid)
            if not valid:
                return response.to_dict, response.code
            payload = request.get_json()
            payload["creator"] = current_identity["username"]
            payload["dataset_geid"] = dataset_geid
            try:
                response = requests.post(ConfigClass.DATASET_SERVICE + f"schema/list", json=payload)
            except Exception as e:
                _logger.info(f"Error calling dataset service: {str(e)}")
                api_response.set_code(EAPIResponseCode.internal_error)
                api_response.set_result(f"Error calling dataset service: {str(e)}")
                return api_response.to_dict, api_response.code
            return response.json(), response.status_code