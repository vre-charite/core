from flask import request
from flask_restx import Resource
from flask_jwt import jwt_required, current_identity
from resources.decorator import check_role
from models.api_response import APIResponse, EAPIResponseCode
from services.logger_services.logger_factory_service import SrvLoggerFactory
from config import ConfigClass
import json
import requests

_logger = SrvLoggerFactory('api_files_ops_v2').get_logger()

class FileInfoV2(Resource):
    @jwt_required()
    @check_role('uploader')
    def get(self, dataset_id):

        """
            Fetch file info by project_id
        """
        _res = APIResponse()
        _logger.info(f'Call API for fetching file info for container: {dataset_id}')
        try:
            page_size = int(request.args.get('page_size', 25))
            page = int(request.args.get('page', 0))
            partial = request.args.get('partial', True)
            order_by = request.args.get('order_by', 'createTime')
            order_type = request.args.get('order_type', 'desc')
            query = request.args.get('query', '{}')
        except Exception as e:
            _logger.error(f'Failed to reterive the parameters')

        try:
            query = json.loads(query)
        except Exception as e:
            _logger.warning(
                'Failed to convert query into json.')
            query = {}

        if 'labels' not in query:
            _logger.error('Missing labels in query')
            _res.set_code(EAPIResponseCode.bad_request)
            _res.set_error_msg('Missing required parameter labels')
            return _res.to_dict, _res.code
        else:
            labels = query['labels']

        if current_identity['role'] != 'admin':
            if current_identity['project_role'] == 'contributor':
                if 'uploader' not in query:
                    _logger.error('Non-admin user does not have access to query all user file info')
                    _res.set_code(EAPIResponseCode.forbidden)
                    _res.set_error_msg('Permission Deined')
                    return _res.to_dict, _res.code

                if query['uploader'] != current_identity['username']:
                    _logger.error('Non-admin user can only fetch their own file info')
                    _res.set_code(EAPIResponseCode.forbidden)
                    _res.set_error_msg('Permission Deined')
                    return _res.to_dict, _res.code

                if 'VRECore' in labels or 'Processed' in labels:
                    _logger.error('uploader cannot fetch vre core files or processed files')
                    _res.set_code(EAPIResponseCode.forbidden)
                    _res.set_error_msg('Permission Deined')
                    return _res.to_dict, _res.code
                # Disable fuzzy search for uploader
                query['uploader'] = "==" + query['uploader']
            elif current_identity['project_role'] == 'collaborator':
                if 'uploader' not in query:
                    if "Greenroom" in labels:
                        _logger.error('collaborator can only fetch their own greenroom files')
                        _res.set_code(EAPIResponseCode.forbidden)
                        _res.set_error_msg('Permission Deined')
                        return _res.to_dict, _res.code
                else:
                    if query['uploader'] != current_identity['username']:
                        if "Greenroom" in labels:
                            _logger.error('collaborator can only fetch their own greenroom files')
                            _res.set_code(EAPIResponseCode.forbidden)
                            _res.set_error_msg('Permission Deined')
                            return _res.to_dict, _res.code

                    if "Greenroom" in labels:
                        # Disable fuzzy search for uploader
                        query['uploader'] = "==" + query['uploader']

        if 'Processed' in labels and 'process_pipeline' not in query:
            _logger.error('Missing required information process_pipeline')
            _res.set_code(EAPIResponseCode.bad_request)
            _res.set_error_msg('Missing pipeline name when trying to fetch Processed data info')
            return _res.to_dict, _res.code

        try:
            payload = {
                'page': page,
                'page_size': page_size,
                'partial': bool(partial),
                'order_by': order_by,
                'order_type': order_type,
                'query': query
            }
            url = ConfigClass.FILEINFO_SERVICE + f'files/{dataset_id}/query'
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
            
        

class FileTags(Resource):
    @jwt_required()

    def post(self, dataset_id):
        _res = APIResponse()
        _logger.info(f'Call API for attaching tag to file info for container: {dataset_id}')

        try:
            data = request.get_json()
            geid = data.get('geid')

            url = ConfigClass.DATA_SERVICE_V2 + 'containers/{}/tags'.format(dataset_id)

            file_url = ConfigClass.NEO4J_SERVICE + 'nodes/File/query'
            file_res = requests.post(file_url, json={"global_entity_id": geid})

            result = file_res.json()

            if len(result) == 0:
                _res.set_code(EAPIResponseCode.bad_request)
                _res.set_error_msg("File is not exist")

                return _res.to_dict, _res.code

            elif current_identity['role'] == 'admin':
                response = requests.post(url, json=data)
                if response.status_code != 200:
                    _logger.error('Failed to attach tags to file:   '+ str(response.text))
                    _res.set_code(EAPIResponseCode.internal_error)
                    _res.set_result("Failed to attach tags to file: " + str(response.text))
                    return _res.to_dict, _res.code
                
                else:
                    _logger.info('Successfully attach tags to file: {}'.format(json.dumps(response.json())))
                    return response.json()

            else:
                file_info = result[0]
                uploader = file_info['uploader']
                file_path = file_info['path']
                file_labels = file_info['labels']

                payload = {
                    "start_label": "User",
                    "end_label": "Dataset",
                    "start_params": {
                        "name": current_identity['username']
                    },
                    "end_params": {
                        "id": int(dataset_id)
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
                        response = requests.post(url, json=data)
                        if response.status_code != 200:
                            _logger.error('Failed to attach tags to file:   '+ str(response.text))
                            _res.set_code(EAPIResponseCode.internal_error)
                            _res.set_result("Failed to attach tags to file: " + str(response.text))
                            return _res.to_dict, _res.code
                        
                        else:
                            _logger.info('Successfully attach tags to file: {}'.format(json.dumps(response.json())))
                            return response.json()
                    
                    elif project_role == 'contributor':
                        if 'Raw' in file_labels and 'Greenroom' in file_labels and uploader == current_identity['username']:
                            response = requests.post(url, json=data)
                            if response.status_code != 200:
                                _logger.error('Failed to attach tags to file:   '+ str(response.text))
                                _res.set_code(EAPIResponseCode.internal_error)
                                _res.set_result("Failed to attach tags to file: " + str(response.text))
                                return _res.to_dict, _res.code
                            
                            else:
                                _logger.info('Successfully attach tags to file: {}'.format(json.dumps(response.json())))
                                return response.json()
                        else:
                            _logger.error('Failed to attach tags to file:  contributors can only attach their own greenroom raw file')
                            _res.set_code(EAPIResponseCode.forbidden)
                            _res.set_result("Failed to attach tags to file:  contributors can only attach their own greenroom raw file")
                            return _res.to_dict, _res.code

                    elif project_role == 'collaborator':
                        if 'Raw' in file_labels and uploader == current_identity['username']:
                            response = requests.post(url, json=data)
                            if response.status_code != 200:
                                _logger.error('Failed to attach tags to file:   '+ str(response.text))
                                _res.set_code(EAPIResponseCode.internal_error)
                                _res.set_result("Failed to attach tags to file: " + str(response.text))
                                return _res.to_dict, _res.code
                            
                            else:
                                _logger.info('Successfully attach tags to file: {}'.format(json.dumps(response.json())))
                                return response.json()
                        else:
                            _logger.error('Failed to attach tags to file:  collaborator can only attach their own raw file')
                            _res.set_code(EAPIResponseCode.forbidden)
                            _res.set_result("Failed to attach tags to file:  collaborator can only attach their own raw file")
                            return _res.to_dict, _res.code

        except Exception as e:
            _logger.error(
                'Failed to convert query into json.' + str(e))
            _res.set_code(EAPIResponseCode.internal_error)
            _res.set_error_msg(str(e))

            return _res.to_dict, _res.code


    def delete(self, dataset_id):
        _res = APIResponse()
        _logger.info(f'Call API for deleting tag to file info for container: {dataset_id}')

        try:
            data = request.get_json()
            geid = data.get('geid')

            url = ConfigClass.DATA_SERVICE_V2 + 'containers/{}/tags'.format(dataset_id)

            file_url = ConfigClass.NEO4J_SERVICE + 'nodes/File/query'
            file_res = requests.post(file_url, json={"global_entity_id": geid})

            result = file_res.json()

            if len(result) == 0:
                _res.set_code(EAPIResponseCode.bad_request)
                _res.set_error_msg("File is not exist")

                return _res.to_dict, _res.code

            elif current_identity['role'] == 'admin':
                response = requests.post(url, json=data)
                if response.status_code != 200:
                    _logger.error('Failed to delete tags from file:   '+ str(response.text))
                    _res.set_code(EAPIResponseCode.internal_error)
                    _res.set_result("Failed to delete tags from file: " + str(response.text))
                    return _res.to_dict, _res.code
                
                else:
                    _logger.info('Successfully delete tags from file: {}'.format(json.dumps(response.json())))
                    return response.json()

            else:
                file_info = result[0]
                uploader = file_info['uploader']
                file_path = file_info['path']
                file_labels = file_info['labels']

                payload = {
                    "start_label": "User",
                    "end_label": "Dataset",
                    "start_params": {
                        "name": current_identity['username']
                    },
                    "end_params": {
                        "id": int(dataset_id)
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
                            _logger.error('Failed to delete tags from file:   '+ str(response.text))
                            _res.set_code(EAPIResponseCode.internal_error)
                            _res.set_result("Failed to delete tags from file: " + str(response.text))
                            return _res.to_dict, _res.code
                        
                        else:
                            _logger.info('Successfully attach tags to file: {}'.format(json.dumps(response.json())))
                            return response.json()
                    
                    elif project_role == 'contributor':
                        if 'Raw' in file_labels and 'Greenroom' in file_labels and uploader == current_identity['username']:
                            response = requests.delete(url, json=data)
                            if response.status_code != 200:
                                _logger.error('Failed to delete tags from file:   '+ str(response.text))
                                _res.set_code(EAPIResponseCode.internal_error)
                                _res.set_result("Failed to delete tags from file: " + str(response.text))
                                return _res.to_dict, _res.code
                            
                            else:
                                _logger.info('Successfully delete tags from file: {}'.format(json.dumps(response.json())))
                                return response.json()
                        else:
                            _logger.error('Failed to delete tags from file:  contributors can only delete their own greenroom raw file')
                            _res.set_code(EAPIResponseCode.forbidden)
                            _res.set_result("Failed to delete tags from file:  contributors can only delete their own greenroom raw file")
                            return _res.to_dict, _res.code

                    elif project_role == 'collaborator':
                        if 'Raw' in file_labels and uploader == current_identity['username']:
                            response = requests.delete(url, json=data)
                            if response.status_code != 200:
                                _logger.error('Failed to delete tags from file:   '+ str(response.text))
                                _res.set_code(EAPIResponseCode.internal_error)
                                _res.set_result("Failed to delete tags from file: " + str(response.text))
                                return _res.to_dict, _res.code
                            
                            else:
                                _logger.info('Successfully delete tags to file: {}'.format(json.dumps(response.json())))
                                return response.json()
                        else:
                            _logger.error('Failed to delete tags from file:  collaborator can only delete their own raw file')
                            _res.set_code(EAPIResponseCode.forbidden)
                            _res.set_result("Failed to delete tags from file:  collaborator can only delete their own raw file")
                            return _res.to_dict, _res.code

        except Exception as e:
            _logger.error(
                'Failed to convert query into json.' + str(e))
            _res.set_code(EAPIResponseCode.internal_error)
            _res.set_error_msg(str(e))

            return _res.to_dict, _res.code