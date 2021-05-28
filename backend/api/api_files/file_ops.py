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
from resources.utils import http_query_node, get_files_recursive

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

class FileActionTasks(BaseProxyResource):
    @jwt_required()
    def get(self):
        request_params = request.args
        url = ConfigClass.DATA_UTILITY_SERVICE + "tasks"
        response = requests.get(url, params=request_params)
        if response.status_code == 200:
            return response.json(), response.status_code
        else:
            return response.text, 500
    
    @jwt_required()
    def delete(self):
        request_body = request.get_json()
        url = ConfigClass.DATA_UTILITY_SERVICE + "tasks"
        response = requests.delete(url, json=request_body)
        if response.status_code == 200:
            return response.json(), response.status_code
        else:
            return response.text, 500
    
class FileActions(Resource):
    @jwt_required()
    def post(self):
        data_actions_utility_url = ConfigClass.DATA_UTILITY_SERVICE + "files/actions"
        headers = request.headers
        request_body = request.get_json()
        operation = request_body.get("operation", None)
        payload = request_body.get("payload", None)
        project_geid = request_body.get("project_geid", None)
        # validate request
        session_id = headers.get("Session-ID", None)
        if not session_id:
            return "Header Session-ID required", EAPIResponseCode.bad_request.value
        if not payload:
            return "parameter 'payload' required", EAPIResponseCode.bad_request.value
        targets = payload.get("targets")
        if not targets:
            return "targets required", EAPIResponseCode.bad_request.value
        if type(targets) != list:
            return "Invalid targets, must be an object list", EAPIResponseCode.bad_request.value
        if not operation:
            return "operation required", EAPIResponseCode.bad_request.value
        if not project_geid:
            return "project_geid required", EAPIResponseCode.bad_request.value
        # validate project
        project_res = http_query_node(
            "Dataset", {"global_entity_id": project_geid})
        if project_res.status_code != 200:
            return  "Query node error: " + str(project_res.text), EAPIResponseCode.internal_error.value
        project_found = project_res.json()
        if len(project_found) == 0:
            return "Invalid project_geid, Project not found: " + project_geid, EAPIResponseCode.bad_request.value
        project_info = project_found[0]
        # validate user
        payload = {
            "start_label": "User",
            "end_label": "Dataset",
            "start_params": {
                "name": current_identity['username']
            },
            "end_params": {
                "code": project_info['code']
            }
        }
        user_platform_role = current_identity['role']
        full_access = True if user_platform_role == "admin" else False
        relation_res = requests.post(ConfigClass.NEO4J_SERVICE + 'relations/query', json=payload)
        relations = relation_res.json()
        if not full_access and len(relations) == 0:
            return "Permission denied on the project", EAPIResponseCode.forbidden.value
        # validate permission
        if not full_access and operation == "delete":
            '''
                Project admin can delete files
                Project collaborator can only delete the file belong to them 
                Project contributor can only delete the greenroom file belong to them (confirm the file is greenroom file, and has owned by current user)
            '''
            relation = relations[0]
            user_project_role = relation['r']['type']
            for target in targets:
                # get source file
                source_file_res = http_query_node(
                    "File", {"global_entity_id": target['geid']})
                if source_file_res.status_code != 200:
                    return "target query error: " + source_file_res.text, EAPIResponseCode.internal_error.value
                source_file_found = source_file_res.json()
                source = None
                if not len(source_file_found) > 0:
                    source_folder_res = http_query_node(
                        "Folder", {"global_entity_id": target['geid']})
                    source_folder_found = source_folder_res.json()
                    if not len(source_folder_found) > 0:
                        return "source  not found: " + target['geid'], EAPIResponseCode.bad_request.value
                    else:
                        source = source_folder_found[0]
                else:
                    source = source_file_found[0]
                if user_project_role == 'contributor':
                    neo4j_labels = source["labels"]
                    if source['uploader'] != current_identity['username']:
                        return "Permission denied on file: " + source['global_entity_id'], EAPIResponseCode.forbidden.value
                    if 'Greenroom' not in neo4j_labels:
                        return "Permission denied on file: " + source['global_entity_id'], EAPIResponseCode.forbidden.value
                if user_project_role == 'collaborator':
                    if source['uploader'] != current_identity['username']:
                        return "Permission denied on file: " + source['global_entity_id'], EAPIResponseCode.forbidden.value
        # request action utility API
        payload = request_body
        payload['session_id'] = session_id
        action_util_res = requests.post(data_actions_utility_url, json=payload)
        if action_util_res.status_code == 202:
            return action_util_res.json(), action_util_res.status_code
        else:
            return action_util_res.text, action_util_res.status_code


class FileValidation(Resource):
    @jwt_required()
    def post(self):
        try: 
            data_actions_utility_url = ConfigClass.DATA_UTILITY_SERVICE + "files/actions/validate"
            headers = request.headers
            request_body = request.get_json()
            operation = request_body.get("operation", None)
            operation_payload = request_body.get("payload", None)
            project_geid = request_body.get("project_geid", None)
            # validate request
            if not operation_payload:
                return "parameter 'payload' required", EAPIResponseCode.bad_request.value
            targets = operation_payload.get("targets")
            if not targets:
                return "targets required", EAPIResponseCode.bad_request.value
            if type(targets) != list:
                return "Invalid targets, must be an object list", EAPIResponseCode.bad_request.value
            if not operation:
                return "operation required", EAPIResponseCode.bad_request.value
            if not project_geid:
                return "project_geid required", EAPIResponseCode.bad_request.value
            # validate project
            _logger.info('file validation api: validate project')
            project_res = http_query_node(
                "Dataset", {"global_entity_id": project_geid})
            if project_res.status_code != 200:
                _logger.error('file validation api: Query node error')
                return  "Query node error: " + str(project_res.text), EAPIResponseCode.internal_error.value
            project_found = project_res.json()
            if len(project_found) == 0:
                return "Invalid project_geid, Project not found: " + project_geid, EAPIResponseCode.bad_request.value
            project_info = project_found[0]
            _logger.info('file validation api: project info' + str(project_info))
            # validate user
            payload = {
                "start_label": "User",
                "end_label": "Dataset",
                "start_params": {
                    "name": current_identity['username']
                },
                "end_params": {
                    "code": project_info['code']
                }
            }
            _logger.info('file validation api: get relations')
            user_platform_role = current_identity['role']
            full_access = True if user_platform_role == "admin" else False
            relation_res = requests.post(ConfigClass.NEO4J_SERVICE + 'relations/query', json=payload)
            relations = relation_res.json()
            if not full_access and len(relations) == 0:
                _logger.error('file validation api: Permission denied on the project')
                return "Permission denied on the project", EAPIResponseCode.forbidden.value
            # validate permission
            
            '''
                Project admin can delete files
                Project collaborator can only delete the file belong to them 
                Project contributor can only delete the greenroom file belong to them (confirm the file is greenroom file, and has owned by current user)
            '''
            _logger.info('file validation api: get file path')
            for target in targets:
                # get source file
                source_file_res = http_query_node(
                    "File", {"global_entity_id": target['geid']})
                if source_file_res.status_code != 200:
                    return "target query error: " + source_file_res.text, EAPIResponseCode.internal_error.value
                source_file_found = source_file_res.json()
                source = None

                # folder
                if not len(source_file_found) > 0:
                    source_folder_res = http_query_node(
                        "Folder", {"global_entity_id": target['geid']})
                    source_folder_found = source_folder_res.json()
                    if not len(source_folder_found) > 0:
                        return "target folder is not found: " + target['geid'], EAPIResponseCode.bad_request.value

                else:
                    source = source_file_found[0]

                    if not full_access and operation == "delete":
                        relation = relations[0]
                        user_project_role = relation['r']['type']
                        if user_project_role == 'contributor':
                            neo4j_labels = source["labels"]
                            if source['uploader'] != current_identity['username']:
                                return "Permission denied on file: " + source['global_entity_id'], EAPIResponseCode.forbidden.value
                            if 'Greenroom' not in neo4j_labels:
                                return "Permission denied on file: " + source['global_entity_id'], EAPIResponseCode.forbidden.value
                        if user_project_role == 'collaborator':
                            if source['uploader'] != current_identity['username']:
                                return "Permission denied on file: " + source['global_entity_id'], EAPIResponseCode.forbidden.value
                            
                
            # request action utility API
            payload = request_body
            _logger.error('file validation api call utility service: ' + str(payload))
            action_util_res = requests.post(data_actions_utility_url, json=payload)
            return action_util_res.json(), action_util_res.status_code
        
        except Exception as e:
            _logger.error('file validation error: ' + str(e))
            return "file validation error: " + str(e), EAPIResponseCode.internal_error.value 
