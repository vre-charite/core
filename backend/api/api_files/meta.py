from flask import request
from flask_restx import Resource
from flask_jwt import jwt_required, current_identity
from resources.decorator import check_role
from models.api_response import APIResponse, EAPIResponseCode
from services.logger_services.logger_factory_service import SrvLoggerFactory
from services.neo4j_service.neo4j_client import Neo4jClient
from .utils import check_filemeta_permissions
from config import ConfigClass
import json
import requests

_logger = SrvLoggerFactory('api_meta').get_logger()


class FileMeta(Resource):
    @jwt_required()
    def get(self, geid):
        """
            Proxy for entity info file META API, handles permission checks
        """
        _res = APIResponse()
        _logger.info(f'Call API for fetching file info: {geid}')
        page_size = int(request.args.get('page_size', 25))
        page = int(request.args.get('page', 0))
        order_by = request.args.get('order_by', 'createTime')
        order_type = request.args.get('order_type', 'desc')
        query = request.args.get('query', '{}')
        partial = request.args.get('partial', '[]')
        zone = request.args.get('zone', '')
        source_type = request.args.get('source_type', '')

        if not zone in ['Greenroom', 'VRECore', 'All']:
            _logger.error('Missing zone')
            _res.set_code(EAPIResponseCode.bad_request)
            _res.set_error_msg('Invalid zone')
            return _res.to_dict, _res.code
        if not source_type in ['Project', 'Folder', 'TrashFile']:
            _logger.error('Missing zone')
            _res.set_code(EAPIResponseCode.bad_request)
            _res.set_error_msg('Invalid source_type')
            return _res.to_dict, _res.code

        try:
            partial = json.loads(partial)
        except Exception as e:
            _logger.error(f'Error parsing partial json {partial}')
            _res.set_code(EAPIResponseCode.bad_request)
            _res.set_error_msg('Invalid partial json')
            return _res.to_dict, _res.code

        try:
            query = json.loads(query)
        except Exception as e:
            _logger.error(f'Error parsing query json {query}')
            _res.set_code(EAPIResponseCode.bad_request)
            _res.set_error_msg('Invalid query json')
            return _res.to_dict, _res.code
        
        if current_identity['role'] != 'admin':
            neo4j_client = Neo4jClient()
            if source_type == "Folder":
                response = neo4j_client.get_dataset_from_folder(geid)
                if not response.get("result"):
                    if response.get("error_msg") == "Folder not found":
                        _res.set_code(EAPIResponseCode.not_found)
                        _res.set_error_msg("Folder not found")
                    else:
                        _res.set_code(EAPIResponseCode.internal_error)
                        _res.set_error_msg(response.get("error_msg", "Neo4j error"))
                    return _res.to_dict, _res.code
                dataset_node = response.get("result")
            else:
                response = neo4j_client.get_dataset_by_geid(geid)
                if not response.get("result"):
                    if response.get("error_msg") == "Dataset not found":
                        _res.set_code(EAPIResponseCode.not_found)
                        _res.set_error_msg("Dataset not found")
                    else:
                        _res.set_code(EAPIResponseCode.internal_error)
                        _res.set_error_msg(response.get("error_msg", "Neo4j error"))
                    return _res.to_dict, _res.code
                dataset_node = response.get("result")

            response = neo4j_client.get_relation(current_identity["user_id"], dataset_node["id"])
            if not response.get("result"):
                _logger.error('User not a member of the project')
                if response.get("error_msg"):
                    _res.set_code(EAPIResponseCode.internal_error)
                    _res.set_error_msg(response.get("error_msg"))
                else:
                    _res.set_code(EAPIResponseCode.forbidden)
                    _res.set_error_msg('Permission Denied')
                return _res.to_dict, _res.code
            project_role = response["result"][0]["r"]["type"]
            query = check_filemeta_permissions(query, zone, project_role, current_identity["username"], _logger)
            if not query:
                _res.set_code(EAPIResponseCode.forbidden)
                _res.set_error_msg('Permission Denied')
                return _res.to_dict, _res.code
            # Disable fuzzy search for uploader
            if project_role == "contributor" or project_role == "collaborator" and zone in ["Greenroom", "All"]:
                if "uploader" in partial:
                    partial.remove("uploader")
        try:
            payload = {
                'page': page,
                'page_size': page_size,
                'order_by': order_by,
                'order_type': order_type,
                'zone': zone,
                'source_type': source_type,
                'partial': json.dumps(partial),
                'query': json.dumps(query)
            }
            url = ConfigClass.FILEINFO_HOST + f'/v1/files/meta/{geid}'
            response = requests.get(url, params=payload)
            _logger.info(f'Calling Entityinfo service, payload is:  ' + str(payload))
            if response.status_code != 200:
                _logger.error('Failed to query data from entityinfo service:  ' + response.text)
                _res.set_code(EAPIResponseCode.internal_error)
                _res.set_result("Failed to query data from entityinfo service")
                return _res.to_dict, _res.code
            else:
                _logger.info('Successfully Fetched file information: {}'.format(json.dumps(response.json())))
                return response.json()
        except Exception as e:
            _logger.error('Failed to query data from entityinfo service:   ' + str(e))
            _res.set_code(EAPIResponseCode.internal_error)
            _res.set_result("Failed to query data from entityinfo service")
            return _res.to_dict, _res.code
        

