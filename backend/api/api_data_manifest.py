from flask_restx import Api, Resource, fields
from flask_jwt import jwt_required, current_identity
from resources.decorator import check_role
from config import ConfigClass
from models.api_response import APIResponse, EAPIResponseCode
from models.api_meta_class import MetaAPI
from services.logger_services.logger_factory_service import SrvLoggerFactory
from services.container_services.container_manager import SrvContainerManager
from models.api_data_manifest import DataManifest, EDataManifestType
from api import module_api
from flask import request
import json, datetime

api_ns_data_manifests = module_api.namespace('Data Manifests Restful', description='For data manifest feature', path ='/v1')
api_ns_data_manifest = module_api.namespace('Data Manifest Restful', description='For data manifest feature', path ='/v1')

_logger = SrvLoggerFactory('api_data_manifest').get_logger()

class APIDataManifest(metaclass=MetaAPI):
    '''
    [POST]/data/manifests
    [GET]/data/manifests?project_code=generate
    [GET]/data/manifests?project_code=generate&key=banana
    [GET]/data/manifest/manifest_id
    '''
    def api_registry(self):
        api_ns_data_manifests.add_resource(self.RestfulManifests, '/data/manifests')
        api_ns_data_manifest.add_resource(self.RestfulManifest, '/data/manifest/<manifest_id>')

    class RestfulManifests(Resource):
        def get(self):
            # init resp
            my_res = APIResponse()
            # get request params
            project_code = request.args.get('project_code', None)
            key = request.args.get('key', None)
            # init container_mgr
            container_mgr = SrvContainerManager()
            if not project_code:
                my_res.set_code(EAPIResponseCode.bad_request)
                my_res.set_error_msg('Invalid request, need project_code')
            project = container_mgr.get_by_project_code(project_code)
            if project[0]:
                if len(project[1]) > 0:
                    my_res.set_code(EAPIResponseCode.success)
                    project_detail = project[1][0]
                    data_manifest_list = project_detail.get('data_manifest')
                    if data_manifest_list:
                        json_loaded = [json.loads(manifest) for manifest in data_manifest_list]
                        if key:
                            json_loaded = [obj for obj in json_loaded if obj['key'] == key]
                        my_res.set_result(json_loaded)
                    else:
                        reserved_tags_manifest = DataManifest()
                        reserved_tags_manifest.manifest_id = project_code + ":" + "reserved_tags" \
                            + ":" + datetime.datetime.utcnow().timestamp
                        reserved_tags_manifest.key = "reserved_tags"
                        reserved_tags_manifest.diplay_name = "Reserved Tags"
                        reserved_tags_manifest.value = []
                        reserved_tags_manifest.type = EDataManifestType.MULTIPLE_CHOICE.name
                        reserved_tags_manifest.note = "Project-wise tags only editable by project admins"
                        manifest_list_default = [
                            reserved_tags_manifest.to_dict
                        ]
                        my_res.set_result(manifest_list_default)
                else:
                    my_res.set_code(EAPIResponseCode.not_found)
                    my_res.set_error_msg('Project Not Found: ' + project_code)
            else:
                my_res.set_code(EAPIResponseCode.internal_error)
            return my_res.to_dict, my_res.code

        def post(self):
            # init resp
            my_res = APIResponse()
            return my_res.to_dict, my_res.code

    class RestfulManifest(Resource):
        def get(self, manifest_id):
            # init resp
            my_res = APIResponse()
            # get request params
            project_code = manifest_id.split(':')[0]
            # init container_mgr
            container_mgr = SrvContainerManager()
            if not project_code:
                my_res.set_code(EAPIResponseCode.bad_request)
                my_res.set_error_msg('Invalid request, need project_code')
            project = container_mgr.get_by_project_code(project_code)
            if project[0]:
                if len(project[1]) > 0:
                    my_res.set_code(EAPIResponseCode.success)
                    project_detail = project[1][0]
                    data_manifest_list = project_detail.get('data_manifest')
                    if data_manifest_list:
                        json_loaded = [json.loads(manifest) for manifest in data_manifest_list]
                        my_res.set_result(json_loaded)
                    else:
                        my_res.set_code(EAPIResponseCode.not_found)
                        my_res.set_result('Data Manifest Not Found: ' + manifest_id)
                else:
                    my_res.set_code(EAPIResponseCode.not_found)
                    my_res.set_error_msg('Project Not Found: ' + project_code)
            else:
                my_res.set_code(EAPIResponseCode.internal_error)
            return my_res.to_dict, my_res.code