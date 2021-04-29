from flask import request
from flask_restx import Resource
from flask_jwt import jwt_required, current_identity
from resources.decorator import check_role
from models.api_response import APIResponse, EAPIResponseCode
from services.logger_services.logger_factory_service import SrvLoggerFactory
from config import ConfigClass
import json
import requests

_logger = SrvLoggerFactory('api_files_ops_v4').get_logger()

class FileInfoV4(Resource):
    @jwt_required()
    @check_role('uploader')
    def get(self, dataset_id):
        """
            Fetch file info from Elastic Search
        """
        _res = APIResponse()

        page_size = int(request.args.get('page_size', 10))
        page = int(request.args.get('page', 0))
        order_by = request.args.get('order_by', 'time_created')
        order_type = request.args.get('order_type', 'desc')
        query = request.args.get('query', '{}')

        project_code = None

        query = json.loads(query)

        if current_identity['role'] != 'admin':
            if current_identity['project_role'] == 'contributor':
                # Make sure contributor is restrict to querying there own files/folders
                if 'uploader' not in query:
                    _logger.error('Non-admin user does not have access to query all user file info')
                    _res.set_code(EAPIResponseCode.forbidden)
                    _res.set_error_msg('Permission Deined, Non-admin user does not have access to query all user file info')
                    return _res.to_dict, _res.code
                elif query['uploader']['value'] != current_identity['username']:
                    _logger.error('Non-admin user can noly have access to their own file info')
                    _res.set_code(EAPIResponseCode.forbidden)
                    _res.set_error_msg('Permission Deined, Non-admin user can noly have access to their own file info')
                    return _res.to_dict, _res.code
                elif 'zone' not in query:
                    _logger.error('zone and file_type is required if user role is contributor')
                    _res.set_code(EAPIResponseCode.forbidden)
                    _res.set_error_msg('Permission Deined, zone and file_type is required if user role is contributor')
                    return _res.to_dict, _res.code
                elif query['zone']['value'] == 'vrecore':
                    _logger.error('contributor cannot fetch vre core files or processed files')
                    _res.set_code(EAPIResponseCode.forbidden)
                    _res.set_error_msg('Permission Deined, contributor cannot fetch vre core files or processed files')
                    return _res.to_dict, _res.code
            
            elif current_identity['project_role'] == 'collaborator':
                if query['zone']['value'] == 'greenroom' and 'uploader' not in query:
                    _logger.error('collaborator user does not have access to query all greenroom file info')
                    _res.set_code(EAPIResponseCode.forbidden)
                    _res.set_error_msg('Permission Deined')
                    return _res.to_dict, _res.code
                elif 'uploader' in query and query['uploader']['value'] != current_identity['username']:
                    _logger.error('collaborator user can noly have access to their own file info')
                    _res.set_code(EAPIResponseCode.forbidden)
                    _res.set_error_msg('Permission Deined')
                    return _res.to_dict, _res.code

        try:
            neo_url = ConfigClass.NEO4J_SERVICE + 'nodes/Dataset/node/{}'.format(dataset_id)
            response = requests.get(neo_url)
            if response.status_code != 200:
                _logger.error('Failed to query project from neo4j service:   '+ response.text)
                _res.set_code(EAPIResponseCode.internal_error)
                _res.set_result("Failed to query project from neo4j service")
                return _res.to_dict, _res.code
            else:
                data = response.json()

                if len(data) < 1:
                    _logger.error('There is no project in neo4j service:   '+ response.text)
                    _res.set_code(EAPIResponseCode.internal_error)
                    _res.set_result("There is no project in neo4j servic, which id is ".format(dataset_id))
                    return _res.to_dict, _res.code

                project_code = data[0]["code"]
        except Exception as e:
            _logger.error('Failed to query project from neo4j service:   ' + str(e))
            _res.set_code(EAPIResponseCode.internal_error)
            _res.set_result("Failed to query project from neo4j service")
            return _res.to_dict, _res.code
        
        try:
            query["project_code"] = {
                "value": project_code,
                "condition": "equal"
            }
            query = json.dumps(query)
            params = {
                "page": page,
                "page_size": page_size,
                "sort_type": order_type,
                "sort_by": order_by,
                "query": query
            }
            
            url = ConfigClass.PROVENANCE_SERVICE + 'entity/file'
            response = requests.get(url, params=params)
            _logger.info(f'Calling Provenance service /v1/entity/file, payload is:  ' + str(params))
            if response.status_code != 200:
                _logger.error('Failed to query data from Provenance service:   '+ response.text)
                _res.set_code(EAPIResponseCode.internal_error)
                _res.set_result("Failed to query data from Provenance service")
                return _res.to_dict, _res.code
            else:
                _logger.info('Successfully Fetched file information')
                return response.json()

        except Exception as e:
            _logger.error('Failed to query data from es service:   ' + str(e))
            _res.set_code(EAPIResponseCode.internal_error)
            _res.set_result("Failed to query data from es service")
            return _res.to_dict, _res.code



                