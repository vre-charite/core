from flask_restx import Api, Resource, fields
from flask_jwt import jwt_required, current_identity
from resources.decorator import check_role
from config import ConfigClass
from models.api_response import APIResponse, EAPIResponseCode
from models.api_meta_class import MetaAPI
from services.logger_services.logger_factory_service import SrvLoggerFactory
from services.container_services.container_manager import SrvContainerManager
from api import module_api
from flask import request
import json

api_ns_projects = module_api.namespace('Project Restful', description='For project feature', path ='/v1')
api_ns_project = module_api.namespace('Project Restful', description='For project feature', path ='/v1')

_logger = SrvLoggerFactory('api_project').get_logger()

class APIProject(metaclass=MetaAPI):
    '''
    [POST]/projects
    [GET]/projects
    [GET]/project/<project_code>
    '''
    def api_registry(self):
        api_ns_projects.add_resource(self.RestfulProjects, '/projects')
        api_ns_project.add_resource(self.RestfulProject, '/project/<project_code>')

    class RestfulProjects(Resource):
        def get(self):
            # init resp
            my_res = APIResponse()
            return my_res.to_dict, my_res.code

        def post(self):
            # init resp
            my_res = APIResponse()
            return my_res.to_dict, my_res.code

    class RestfulProject(Resource):
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