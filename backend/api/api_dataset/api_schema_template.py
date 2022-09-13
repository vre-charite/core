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

from config import ConfigClass
from flask_jwt import jwt_required, current_identity
from flask_restx import Api, Resource, fields
from flask import request
from models.api_meta_class import MetaAPI
from services.permissions_service.decorators import \
    permissions_check, dataset_permission, dataset_permission_bycode
from api import module_api
import requests

api_ns_dataset_schema_template_proxy = module_api.namespace('DatasetSchemaTemplateProxy', description='', path ='/v1')


class APIDatasetSchemaTemplateProxy(metaclass=MetaAPI):
    def api_registry(self):
        api_ns_dataset_schema_template_proxy.add_resource(self.Restful, '/dataset/<dataset_geid>/schemaTPL/<template_geid>')
        api_ns_dataset_schema_template_proxy.add_resource(self.SchemaTemplateCreate, '/dataset/<dataset_geid>/schemaTPL')
        api_ns_dataset_schema_template_proxy.add_resource(self.SchemaTemplatePostQuery, '/dataset/<dataset_geid>/schemaTPL/list')
        api_ns_dataset_schema_template_proxy.add_resource(self.SchemaTemplateDefaultQuery, '/dataset/schemaTPL/default/list')
        api_ns_dataset_schema_template_proxy.add_resource(self.SchemaTemplateDefaultGet, '/dataset/schemaTPL/default/<template_geid>')

    class Restful(Resource):
        @jwt_required()
        @dataset_permission()
        def get(self, dataset_geid, template_geid):

            url = ConfigClass.DATASET_SERVICE + "dataset/{}/schemaTPL/{}".format(dataset_geid, template_geid)
            respon = requests.get(url, params=request.args, headers=request.headers, \
                cookies=request.cookies)
            return respon.json(), respon.status_code


        @jwt_required()
        @dataset_permission()
        def put(self, dataset_geid, template_geid):
            url = ConfigClass.DATASET_SERVICE + "dataset/{}/schemaTPL/{}".format(dataset_geid, template_geid)
            payload_json = request.get_json()
            respon = requests.put(url, json=payload_json, headers=request.headers, \
                cookies=request.cookies)
            return respon.json(), respon.status_code


        @jwt_required()
        @dataset_permission()
        def delete(self, dataset_geid, template_geid):
            url = ConfigClass.DATASET_SERVICE + "dataset/{}/schemaTPL/{}".format(dataset_geid, template_geid)
            payload_json = request.get_json()
            respon = requests.delete(url, json=payload_json, headers=request.headers, \
                cookies=request.cookies)
            return respon.json(), respon.status_code


    class SchemaTemplateCreate(Resource):

        @jwt_required()
        @dataset_permission()
        def post(self, dataset_geid):
            url = ConfigClass.DATASET_SERVICE + "dataset/{}/schemaTPL".format(dataset_geid)
            payload_json = request.get_json()
            respon = requests.post(url, json=payload_json, headers=request.headers, \
                cookies=request.cookies)
            return respon.json(), respon.status_code


    class SchemaTemplatePostQuery(Resource):

        @jwt_required()
        @dataset_permission()
        def post(self, dataset_geid):
            url = ConfigClass.DATASET_SERVICE + "dataset/{}/schemaTPL/list".format(dataset_geid)
            payload_json = request.get_json()
            respon = requests.post(url, json=payload_json, headers=request.headers, \
                cookies=request.cookies)
            return respon.json(), respon.status_code

###################################################################################################

    # note this api will have different policy
    class SchemaTemplateDefaultQuery(Resource):
        @jwt_required()
        def post(self):
            url = ConfigClass.DATASET_SERVICE + "dataset/default/schemaTPL/list"
            payload_json = request.get_json()
            respon = requests.post(url, json=payload_json, headers=request.headers, \
                cookies=request.cookies)
            return respon.json(), respon.status_code

    class SchemaTemplateDefaultGet(Resource):
        @jwt_required()
        def get(self, template_geid):

            url = ConfigClass.DATASET_SERVICE + "dataset/default/schemaTPL/{}".format(template_geid)
            respon = requests.get(url, params=request.args, headers=request.headers, \
                cookies=request.cookies)
            return respon.json(), respon.status_code

