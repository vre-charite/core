from flask import request
from flask_restx import Resource
from flask_jwt import jwt_required, current_identity
from resources.decorator import check_role
from models.api_response import APIResponse, EAPIResponseCode
from services.logger_services.logger_factory_service import SrvLoggerFactory
from config import ConfigClass
import json
import requests

_logger = SrvLoggerFactory('api_files_ops_v3').get_logger()

class FileInfoV3(Resource):
    @jwt_required()
    @check_role('uploader')
    def post(self, dataset_id):
        """
            Fetch file and folder info by project_id
        """
        _res = APIResponse()
        _logger.info(f'Call API for fetching file info for container: {dataset_id}')
        try:
            page_size = int(request.get_json().get('page_size', 25))
            page = int(request.get_json().get('page', 0))
            order_by = request.get_json().get('order_by', 'createTime')
            order_type = request.get_json().get('order_type', 'desc')
            query = request.get_json().get('query', '{}')
        except Exception as e:
            _logger.error(f'Failed to reterive the parameters')

        if 'labels' not in query:
            _logger.error('Missing labels in query')
            _res.set_code(EAPIResponseCode.bad_request)
            _res.set_error_msg('Missing required parameter labels')
            return _res.to_dict, _res.code
        else:
            labels = query['labels']

        if current_identity['role'] != 'admin':
            if current_identity['project_role'] == 'contributor':
                # Make sure contributor is restrict to querying there own files/folders
                for label in labels:
                    label_filter = query.get(label)
                    if not label_filter or "uploader" not in label_filter:
                        _logger.error('Non-admin user does not have access to query all user file info')
                        _res.set_code(EAPIResponseCode.forbidden)
                        _res.set_error_msg('Permission Denied')
                        return _res.to_dict, _res.code
                    if label_filter.get('uploader') != current_identity['username']:
                        _logger.error('Non-admin user can only fetch their own file info')
                        _res.set_code(EAPIResponseCode.forbidden)
                        _res.set_error_msg('Permission Denied')
                        return _res.to_dict, _res.code

                    if 'Folder' not in label:
                        if 'VRECore' in label or 'Processed' in label:
                            _logger.error('uploader cannot fetch vre core files or processed files')
                            _res.set_code(EAPIResponseCode.forbidden)
                            _res.set_error_msg('Permission Denied')
                            return _res.to_dict, _res.code
                # Disable fuzzy search for uploader
                for label in labels:
                    label_filter = query.get(label)
                    if "uploader" in label_filter.get("partial", []):
                        query[label]["partial"].remove("uploader")
            elif current_identity['project_role'] == 'collaborator':
                for label in labels:
                    label_filter = query.get(label)
                    if "Greenroom" in label:
                        if "uploader" not in label_filter:
                            _logger.error('collaborator can only fetch their own greenroom files')
                            _res.set_code(EAPIResponseCode.forbidden)
                            _res.set_error_msg('Permission Denied')
                            return _res.to_dict, _res.code
                        if label_filter["uploader"] != current_identity["username"]:
                            _logger.error('collaborator can only fetch their own greenroom files')
                            _res.set_code(EAPIResponseCode.forbidden)
                            _res.set_error_msg('Permission Denied')
                            return _res.to_dict, _res.code

                    if "Greenroom" in label:
                        # Disable fuzzy search for uploader
                        for label in labels:
                            label_filter = query.get(label)
                            if label_filter:
                                if "uploader" in label_filter.get("partial", []):
                                    query[label]["partial"].remove("uploader")

        for label in labels:
            label_filter = query.get(label)
            if 'Folder' not in label:
                if 'Processed' in label and not 'process_pipeline' in label_filter.keys():
                    print("ERROR")
                    _logger.error('Missing required information process_pipeline')
                    _res.set_code(EAPIResponseCode.bad_request)
                    _res.set_error_msg('Missing pipeline name when trying to fetch Processed data info')
                    return _res.to_dict, _res.code

        try:
            payload = {
                'page': page,
                'page_size': page_size,
                'order_by': order_by,
                'order_type': order_type,
                'query': query
            }
            url = ConfigClass.FILEINFO_HOST + f'/v2/files/{dataset_id}/query'
            response = requests.post(url, json=payload)
            _logger.info(f'Calling Neo4j service /v2/neo4j/files/{dataset_id}/query, payload is:  ' + str(payload))
            if response.status_code != 200:
                _logger.error('Failed to query data from neo4j service:   '+ response.text)
                _res.set_code(EAPIResponseCode.internal_error)
                _res.set_result("Failed to query data from neo4j service")
                return _res.to_dict, _res.code
            else:
                _logger.info('Successfully Fetched file information: {}'.format(json.dumps(response.json())))
                return response.json()
        except Exception as e:
            _logger.error('Failed to query data from neo4j service:   ' + str(e))
            _res.set_code(EAPIResponseCode.internal_error)
            _res.set_result("Failed to query data from neo4j service")
            return _res.to_dict, _res.code

class FolderInfoV3(Resource):
    @jwt_required()
    @check_role('uploader')
    def post(self, dataset_id, folder_geid):
        """
            Fetch files and folders inside folder
        """
        _res = APIResponse()
        _logger.info(f'Call API for fetching file info for container: {dataset_id}')
        try:
            page_size = int(request.get_json().get('page_size', 25))
            page = int(request.get_json().get('page', 0))
            order_by = request.get_json().get('order_by', 'createTime')
            order_type = request.get_json().get('order_type', 'desc')
            query = request.get_json().get('query', '{}')
        except Exception as e:
            _logger.error(f'Failed to reterive the parameters')

        if 'labels' not in query:
            _logger.error('Missing labels in query')
            _res.set_code(EAPIResponseCode.bad_request)
            _res.set_error_msg('Missing required parameter labels')
            return _res.to_dict, _res.code
        else:
            labels = query['labels']

        if current_identity['role'] != 'admin':
            if current_identity['project_role'] == 'contributor':
                # Make sure contributor is restrict to querying there own files/folders
                for label in labels:
                    label_filter = query.get(label)
                    if not label_filter or "uploader" not in label_filter:
                        _logger.error('Non-admin user does not have access to query all user file info')
                        _res.set_code(EAPIResponseCode.forbidden)
                        _res.set_error_msg('Permission Denied')
                        return _res.to_dict, _res.code
                    if label_filter['uploader'] != current_identity['username']:
                        _logger.error('Non-admin user can only fetch their own file info')
                        _res.set_code(EAPIResponseCode.forbidden)
                        _res.set_error_msg('Permission Denied')
                        return _res.to_dict, _res.code

                    if 'VRECore' in label or 'Processed' in label:
                        _logger.error('uploader cannot fetch vre core files or processed files')
                        _res.set_code(EAPIResponseCode.forbidden)
                        _res.set_error_msg('Permission Denied')
                        return _res.to_dict, _res.code
                    # Disable fuzzy search for uploader
                    if "uploader" in label_filter.get("partial", []):
                        query[label]["partial"].remove("uploader")
            elif current_identity['project_role'] == 'collaborator':
                for label in labels:
                    label_filter = query.get(label)
                    if "Greenroom" in label:
                        if "uploader" not in label_filter:
                            _logger.error('collaborator can only fetch their own greenroom files')
                            _res.set_code(EAPIResponseCode.forbidden)
                            _res.set_error_msg('Permission Denied')
                            return _res.to_dict, _res.code
                        if label_filter["uploader"] != current_identity["username"]:
                            _logger.error('collaborator can only fetch their own greenroom files')
                            _res.set_code(EAPIResponseCode.forbidden)
                            _res.set_error_msg('Permission Denied')
                            return _res.to_dict, _res.code

                    if "Greenroom" in label:
                        # Disable fuzzy search for uploader
                        for label in labels:
                            label_filter = query.get(label)
                            if label_filter:
                                if "uploader" in label_filter.get("partial", []):
                                    query[label]["partial"].remove("uploader")

        for label in labels:
            label_filter = query.get(label)
            if 'Processed' in label and not 'process_pipeline' in label_filter.keys():
                _logger.error('Missing required information process_pipeline')
                _res.set_code(EAPIResponseCode.bad_request)
                _res.set_error_msg('Missing pipeline name when trying to fetch Processed data info')
                return _res.to_dict, _res.code

        try:
            payload = {
                'page': page,
                'page_size': page_size,
                'order_by': order_by,
                'order_type': order_type,
                'query': query
            }
            url = ConfigClass.FILEINFO_HOST + f'/v2/files/folder/{folder_geid}/query'
            response = requests.post(url, json=payload)
            _logger.info(f'Calling Neo4j service /v2/neo4j/files/{dataset_id}/query, payload is:  ' + str(payload))
            if response.status_code != 200:
                _logger.error('Failed to query data from neo4j service:   '+ response.text)
                _res.set_code(EAPIResponseCode.internal_error)
                _res.set_result("Failed to query data from neo4j service")
                return _res.to_dict, _res.code
            else:
                _logger.info('Successfully Fetched file information: {}'.format(json.dumps(response.json())))
                return response.json()
        except Exception as e:
            _logger.error('Failed to query data from neo4j service:   ' + str(e))
            _res.set_code(EAPIResponseCode.internal_error)
            _res.set_result("Failed to query data from neo4j service")
            return _res.to_dict, _res.code
