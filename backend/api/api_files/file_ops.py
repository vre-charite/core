from config import ConfigClass
from .proxy import BaseProxyResource
from flask_jwt import jwt_required, current_identity
from resources.decorator import check_role
from models.api_response import APIResponse, EAPIResponseCode
from services.logger_services.logger_factory_service import SrvLoggerFactory
from flask_restx import Resource
import requests
from flask import request
import json

_logger = SrvLoggerFactory('api_files_ops_v1').get_logger()

class FilePreDownload(BaseProxyResource):
    methods = ["GET", "POST"]
    required_roles = {"GET": "member", "POST": "uploader"}
    url = ConfigClass.DATA_SERVICE + "containers/{dataset_id}/file"


class FileDownloadLog(BaseProxyResource):
    methods = ["GET"]
    required_roles = {"GET": "member"}
    url = ConfigClass.DATA_SERVICE + "files/download/log"


class FileInfo(BaseProxyResource):
    methods = ["GET"]
    required_roles = {"GET": "uploader"}
    url = ConfigClass.DATA_SERVICE + "containers/{dataset_id}/files/meta"

class ProcessedFile(BaseProxyResource):
    methods = ["GET"]
    required_roles = {"GET": "member"}
    url = ConfigClass.DATA_SERVICE + "files/processed"


class TotalFileCount(BaseProxyResource):
    methods = ["GET"]
    required_roles = {"GET": "admin"}
    url = ConfigClass.DATA_SERVICE + "containers/{dataset_id}/files/count/total"


class DailyFileCount(BaseProxyResource):
    methods = ["GET"]
    required_roles = {"GET": "uploader"}
    url = ConfigClass.DATA_SERVICE + "containers/{dataset_id}/files/count/daily"


class FileExistCheck(BaseProxyResource):
    methods = ["GET"]
    required_roles = {"GET": "member"}
    url = ConfigClass.DATA_SERVICE + "containers/{dataset_id}/files/exist"

class FileTransfer(BaseProxyResource):
    methods = ["POST"]
    required_roles = {"GET": "member"}
    url = ConfigClass.DATA_SERVICE + "file-transfer/queue"

class FileActionLogs(BaseProxyResource):
    methods = ["GET"]
    required_roles = {"GET": "member"}
    url = ConfigClass.DATA_SERVICE + "file/actions/logs"

class FileDeletion(Resource):
    # methods = ["DELETE"]
    # required_roles = {"GET": "member"}
    # url = ConfigClass.DATA_UTILITY_SERVICE + "filedata/"
    @jwt_required()

    def delete(self):
        '''
            Delete Files:
                Project admin can invoke this api
                Project collaborator can only delete the file belong to them 
                Project contributor can only delete the greenroom file belong to them (confirm the file is greenroom file, and has owned by current user)
        '''
        _res = APIResponse()
        
        try:
            data = request.get_json()
            operator = data.get('operator', None)
            project_code = data.get('project_code', None)
            to_delete_files = data.get('to_delete', None)

            url = ConfigClass.DATA_UTILITY_SERVICE + "filedata/"

            if current_identity['role'] == 'admin':
                response = requests.delete(url, json=data)
                if response.status_code != 200:
                    _logger.error('Failed to delete files:   '+ response.text)
                    _res.set_code(EAPIResponseCode.internal_error)
                    _res.set_result("Failed to delete files")
                    return _res.to_dict, _res.code
                
                else:
                    _logger.info('Successfully delete files: {}'.format(json.dumps(response.json())))
                    return response.json()

            else:
                payload = {
                    "start_label": "User",
                    "end_label": "Dataset",
                    "start_params": {
                        "name": current_identity['username']
                    },
                    "end_params": {
                        "code": project_code
                    }
                }
                relation_res = requests.post(ConfigClass.NEO4J_SERVICE + 'relations/query', json=payload)
                relations = relation_res.json()

                if len(relations) == 0:
                    _res.set_code(EAPIResponseCode.bad_request)
                    _res.set_result("no permission for this project")
                    return _res.to_dict, _res.code

                else:
                    relation = relations[0]
                    project_role = relation['r']['type']
                    if project_role == 'admin':
                        response = requests.delete(url, json=data)
                        if response.status_code != 200:
                            _logger.error('Failed to delete files:   '+ response.text)
                            _res.set_code(EAPIResponseCode.internal_error)
                            _res.set_result("Failed to delete files: ")
                            return _res.to_dict, _res.code
                        
                        else:
                            _logger.info('Successfully delete files: {}'.format(json.dumps(response.json())))
                            return response.json()

                    elif project_role == 'contributor':
                        failed_list = []
                        delete_files = []

                        for delete_file in to_delete_files:
                            file_name = delete_file['file_name']
                            file_path = delete_file['path']
                            namespace = delete_file['namespace']

                            full_path = file_path + '/' + file_name

                            if namespace != 'greenroom' or ConfigClass.NFS_BASE not in file_path or 'processed' in file_path:
                                failed_list.append({ "filename": file_name, "reason": "contributor only can delete their greenroom files"})

                            else:
                                file_url = ConfigClass.NEO4J_SERVICE + 'nodes/File/query'
                                
                                res = requests.post(file_url, json={"full_path": full_path})

                                result = res.json()

                                if len(result):
                                    file_info = result[0]
                                    uploader = file_info['uploader']

                                    if uploader != current_identity['username']:
                                        failed_list.append({ "filename": file_name, "reason": "contributor only can delete their own files"})
                                    else:
                                        delete_files.append(delete_file)
                                else:
                                    failed_list.append({ "filename": file_name, "reason": "file is not exist in neo4j"})
                        
                        data['to_delete_files'] = delete_files

                        if len(failed_list):
                            _logger.error('files can not be deleted:   '+ str(failed_list))
                        if len(delete_files) == 0:
                            _res.set_code(EAPIResponseCode.bad_request)
                            _res.set_result("Failed to delete files: " + str(failed_list))
                            return _res.to_dict, _res.code

                        response = requests.delete(url, json=data)
                        if response.status_code != 200:
                            _logger.error('Failed to delete files:   '+ response.text)
                            _res.set_code(EAPIResponseCode.internal_error)
                            _res.set_result("Failed to delete files")
                            return _res.to_dict, _res.code
                        
                        else:
                            _logger.info('Successfully delete files: {}'.format(json.dumps(response.json())))
                            return response.json()

                    
                    elif project_role == 'collaborator':
                        failed_list = []
                        delete_files = []

                        for delete_file in to_delete_files:
                            file_name = delete_file['file_name']
                            file_path = delete_file['path']
                            namespace = delete_file['namespace']

                            full_path = file_path + '/' + file_name

                            file_url = ConfigClass.NEO4J_SERVICE + 'nodes/File/query'
                                
                            res = requests.post(file_url, json={"full_path": full_path})

                            result = res.json()

                            if 'processed' in file_path:
                                failed_list.append({ "filename": file_name, "reason": "collaborator only can delete their raw files"})
                            elif len(result):
                                file_info = result[0]
                                uploader = file_info['uploader']

                                if uploader != current_identity['username']:
                                    failed_list.append({ "filename": file_name, "reason": "collaborator only can delete their own files"})
                                else:
                                    delete_files.append(delete_file)
                            else:
                                failed_list.append({ "filename": file_name, "reason": "file is not exist in neo4j"})
                        
                        data['to_delete_files'] = delete_files
                        if len(failed_list):
                            _logger.error('files can not be deleted:   '+ str(failed_list))
                        if len(delete_files) == 0:
                            _res.set_code(EAPIResponseCode.bad_request)
                            _res.set_result("Failed to delete files: " + str(failed_list))
                            return _res.to_dict, _res.code

                        response = requests.delete(url, json=data)
                        if response.status_code != 200:
                            _logger.error('Failed to delete files:   '+ response.text)
                            _res.set_code(EAPIResponseCode.internal_error)
                            _res.set_result("Failed to delete files")
                            return _res.to_dict, _res.code
                        
                        else:
                            _logger.info('Successfully delete files: {}'.format(json.dumps(response.json())))
                            return response.json()
                                
                    else:
                        _res.set_code(EAPIResponseCode.forbidden)
                        _res.set_result("Your permission is not allowed")
                        return _res.to_dict, _res.code 

        except Exception as e:
            print(str(e))
            _logger.error(f'Failed to reterive the request body')
    

