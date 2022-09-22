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

from enum import Enum
from models.api_meta_class import MetaAPI
from flask_restx import Api, Resource, fields
from flask_jwt import jwt_required, current_identity
from config import ConfigClass
from models.api_response import APIResponse, EAPIResponseCode
from models.api_meta_class import MetaAPI
from services.logger_services.logger_factory_service import SrvLoggerFactory
from services.container_services.container_manager import SrvContainerManager
from api import module_api
from flask import request
import json, datetime

api_ns_system_tags = module_api.namespace('Project Restful', description='For project feature', path ='/v1')

class ESystemTags(Enum):
    COPIED_WITH_APPROVAL = 0

class APISystemTags(metaclass=MetaAPI):
    def api_registry(self):
        api_ns_system_tags.add_resource(
            self.RestfulSystemTags, '/system-tags')
    class RestfulSystemTags(Resource):
        def get(self):
            # init resp
            my_res = APIResponse()
            # get request params
            project_code = request.args.get('project_code', None)
            # init container_mgr
            container_mgr = SrvContainerManager()
            if not project_code:
                my_res.set_code(EAPIResponseCode.bad_request)
                my_res.set_error_msg('Invalid request, need project_code')
            project = container_mgr.get_by_project_code(project_code)
            if project[0]:
                if len(project[1]) > 0:
                    project_detail = project[1][0]
                    system_tags = project_detail.get("system_tags", [])
                    my_res.set_result(system_tags)
                    my_res.set_code(EAPIResponseCode.success)
                else:
                    my_res.set_code(EAPIResponseCode.not_found)
                    my_res.set_error_msg('Project Not Found: ' + project_code)
            else:
                my_res.set_code(EAPIResponseCode.internal_error)
            return my_res.to_dict, my_res.code
        def post(self, project_code):
            '''
            update project system tags
            '''
            pass
