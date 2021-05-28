from .proxy import BaseProxyResource
from config import ConfigClass
from flask_jwt import jwt_required, current_identity
from resources.decorator import check_role
from models.api_response import APIResponse, EAPIResponseCode
from services.logger_services.logger_factory_service import SrvLoggerFactory
from flask_restx import Resource
import requests
from flask import request
import json

_logger = SrvLoggerFactory('api_files_ops_v1').get_logger()

class VirtualFolderFiles(BaseProxyResource):

    def post(self, folder_geid):
        _res = APIResponse()
        headers = request.headers

        try:
            # Get vfolder
            url = ConfigClass.NEO4J_SERVICE + f"nodes/VirtualFolder/query"
            payload = {
                "global_entity_id": folder_geid,
            }
            response = requests.post(url, json=payload)
            if response.status_code != 200:
                api_response.code = response.status_code
                api_response.error_msg = response.json()
                return api_response.json_response()
            vfolder = response.json()[0]

            data = request.get_json()
            payload = {
                "start_id": current_identity['user_id'],
                "end_id": vfolder["id"] 
            }
            relation_res = requests.get(ConfigClass.NEO4J_SERVICE + 'relations', params=payload)
            relations = relation_res.json()

            if current_identity["role"] != "admin":
                if len(relations) == 0:
                    _res.set_code(EAPIResponseCode.bad_request)
                    _res.set_result("no permission for this project")
                    return _res.to_dict, _res.code
                relation = relations[0]
                project_role = relation['r']['type']

                if project_role != 'owner':
                    _res.set_code(EAPIResponseCode.forbidden)
                    _res.set_result("no permission to add files to vfolder")
                    return _res.to_dict, _res.code

            url = ConfigClass.DATA_UTILITY_SERVICE + f"collections/{folder_geid}/files"
            response = requests.post(url, json=data, headers=headers)
            if response.status_code != 200:
                _logger.error('Failed to add files to vfolder:   '+ response.text)
                _res.set_code(EAPIResponseCode.internal_error)
                _res.set_result("Failed to add files to vfolder")
                return _res.to_dict, _res.code
            else:
                _logger.info('Successfully add files to vfolder: {}'.format(json.dumps(response.json())))
                return response.json()

        except Exception as e:
            print(str(e))
            _logger.error("errors in add files to vfolder: {}".format(str(e)))
            _res.set_code(EAPIResponseCode.internal_error)
            _res.set_result("Failed to add files to vfolder")
            return _res.to_dict, _res.code


    def delete(self, folder_geid):
        _res = APIResponse()
        headers = request.headers
        

        try:
            # Get vfolder
            url = ConfigClass.NEO4J_SERVICE + f"nodes/VirtualFolder/query"
            payload = {
                "global_entity_id": folder_geid,
            }
            response = requests.post(url, json=payload)
            if response.status_code != 200:
                api_response.code = response.status_code
                api_response.error_msg = response.json()
                return api_response.json_response()
            vfolder = response.json()[0]
            data = request.get_json()

            if current_identity["role"] != "admin":
                payload = {
                    "start_id": current_identity['user_id'],
                    "end_id": vfolder["id"] 
                }
                relation_res = requests.get(ConfigClass.NEO4J_SERVICE + 'relations', params=payload)
                relations = relation_res.json()

                if len(relations) == 0:
                    _res.set_code(EAPIResponseCode.bad_request)
                    _res.set_result("no permission for this project")
                    return _res.to_dict, _res.code
                relation = relations[0]
                project_role = relation['r']['type']

                if project_role != 'owner':
                    _res.set_code(EAPIResponseCode.forbidden)
                    _res.set_result("no permission to remove files from vfolder")
                    return _res.to_dict, _res.code

            url = ConfigClass.DATA_UTILITY_SERVICE + f"collections/{folder_geid}/files"
            response = requests.delete(url, json=data, headers=headers)
            if response.status_code != 200:
                _logger.error('Failed to remove files from vfolder:   '+ response.text)
                _res.set_code(EAPIResponseCode.internal_error)
                _res.set_result("Failed to remove files from vfolder")
                return _res.to_dict, _res.code
        
            else:
                _logger.info('Successfully remove files from vfolder: {}'.format(json.dumps(response.json())))
                return response.json()

        except Exception as e:
            print(str(e))
            _logger.error("errors in remove files from vfolder: {}".format(str(e)))
            _res.set_code(EAPIResponseCode.internal_error)
            _res.set_result("Failed to remove files from vfolder")
            return _res.to_dict, _res.code
    


class VirtualFolder(BaseProxyResource):
    methods = ["POST", "GET"]
    required_roles = {"GET": "member"}
    url = ConfigClass.DATA_UTILITY_SERVICE + "collections/"

class VirtualFolderInfo(BaseProxyResource):
    def get(self, folderId):
        _res = APIResponse()
        url = ConfigClass.DATA_UTILITY_SERVICE + "collections/{}".format(folderId)
        headers = request.headers

        try:
            payload = {
                "end_id": int(folderId),
                "start_id": int(current_identity['user_id'])
            }

            relation_res = requests.get(ConfigClass.NEO4J_SERVICE + 'relations', params=payload)
            relations = relation_res.json()

            if len(relations) == 0:
                    _res.set_code(EAPIResponseCode.bad_request)
                    _res.set_result("no permission for this project")
                    return _res.to_dict, _res.code
            else:
                relation = relations[0]
                project_role = relation['r']['type']
                if project_role == 'owner':
                    response = requests.get(url, params=request.args, headers=headers)
                    print(url)
                    print(response.__dict__)
                    if response.status_code != 200:
                        _logger.error('Failed to get files from vfolder:   '+ response.text)
                        _res.set_code(EAPIResponseCode.internal_error)
                        _res.set_result("Failed to get files from vfolder")
                        return _res.to_dict, _res.code
                
                    else:
                        _logger.info('Successfully get files from vfolder: {}'.format(json.dumps(response.json())))
                        return response.json()

                else:
                    _res.set_code(EAPIResponseCode.forbidden)
                    _res.set_result("no permission to get files from vfolder")
                    return _res.to_dict, _res.code


        except Exception as e:
            print(str(e))
            _logger.error("errors in get files from vfolder: {}".format(str(e)))
            _res.set_code(EAPIResponseCode.internal_error)
            _res.set_result("Failed to get files from vfolder")
            return _res.to_dict, _res.code

    
    def delete(self, folderId):
        _res = APIResponse()
        url = ConfigClass.DATA_UTILITY_SERVICE + "collections/{}".format(folderId)
        headers = request.headers

        try:
            data = request.get_json()
            payload = {
                "start_id": current_identity['user_id'],
                "end_id": folderId
            }
            relation_res = requests.get(ConfigClass.NEO4J_SERVICE + 'relations', params=payload)
            relations = relation_res.json()

            if len(relations) == 0:
                    _res.set_code(EAPIResponseCode.bad_request)
                    _res.set_result("no permission for this project")
                    return _res.to_dict, _res.code
            else:
                relation = relations[0]
                project_role = relation['r']['type']

                if project_role == 'owner':
                    response = requests.delete(url, json=data, headers=headers)
                    if response.status_code != 200:
                        _logger.error('Failed to delete vfolder:   '+ response.text)
                        _res.set_code(EAPIResponseCode.internal_error)
                        _res.set_result("Failed to delete vfolder")
                        return _res.to_dict, _res.code
                
                    else:
                        _logger.info('Successfully delete vfolder: {}'.format(json.dumps(response.json())))
                        return response.json()

                else:
                    _res.set_code(EAPIResponseCode.forbidden)
                    _res.set_result("no permission to delete vfolder")
                    return _res.to_dict, _res.code


        except Exception as e:
            print(str(e))
            _logger.error("errors in delete vfolder: {}".format(str(e)))
            _res.set_code(EAPIResponseCode.internal_error)
            _res.set_result("Failed to delete vfolder")
            return _res.to_dict, _res.code
    
