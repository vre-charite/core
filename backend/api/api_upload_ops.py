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

# # from config import ConfigClass
# # from .proxy import BaseProxyResource


# # class CheckUploadStateRestful(BaseProxyResource):
# #     methods = ["DELETE"]
# #     required_roles = {"DELETE": "uploader"}
# #     url = ConfigClass.DATA_UTILITY_SERVICE + "files/upload-state"


from email import header
from config import ConfigClass
from flask_jwt import jwt_required, current_identity
from flask_restx import Api, Resource, fields
from flask import request
from models.api_meta_class import MetaAPI
from api import module_api
import requests

api_uplaod = module_api.namespace('UploadStatusProxy', description='', path ='/v1')


class APIFileUploadStatus(metaclass=MetaAPI):
    def api_registry(self):
        api_uplaod.add_resource(self.FileUploadStatus, '/upload/containers/<project_geid>/upload-state')
        
    class FileUploadStatus(Resource):
        @jwt_required()
        def delete(self, project_geid):
            url = ConfigClass.DATA_UTILITY_SERVICE + "files/upload-state"
            respon = requests.delete(url, params=request.args, headers=request.headers, \
                cookies=request.cookies)
            return respon.json(), respon.status_code


