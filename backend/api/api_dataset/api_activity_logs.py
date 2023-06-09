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

from flask import request
from flask_restx import Resource
from flask_jwt import jwt_required, current_identity
from ..api_files.proxy import BaseProxyResource
from models.api_response import APIResponse, EAPIResponseCode
from services.logger_services.logger_factory_service import SrvLoggerFactory
from models.api_meta_class import MetaAPI
from config import ConfigClass
from resources.utils import http_query_node
import json
import requests
from api import module_api
from services.permissions_service.decorators import permissions_check

_logger = SrvLoggerFactory('api_dataset').get_logger()

api_dataset = module_api.namespace(
    'Dataset', description='Dataset API', path='/v1')


class APIDatasetActivityLogs(metaclass=MetaAPI):
    def api_registry(self):
        api_dataset.add_resource(
            self.ActivityLogs, '/activity-logs/<dataset_geid>')
        api_dataset.add_resource(
            self.ActivityLogByVersion, '/activity-logs/version/<dataset_geid>')

    class ActivityLogs(Resource):
        @jwt_required()
        def get(self, dataset_geid):
            """
                Fetch activity logs of a dataset
            """
            _res = APIResponse()
            _logger.info(
                f'Call API for fetching logs for dataset: {dataset_geid}')

            url = ConfigClass.DATASET_SERVICE + 'activity-logs'

            try:
                node_res = http_query_node(
                    'Dataset', {'global_entity_id': dataset_geid})
                node = node_res.json()
                if len(node) == 0:
                    _res.set_code(EAPIResponseCode.bad_request)
                    _res.set_result('Dataset is not exist')
                    return _res.to_dict, _res.code

                payload = {
                    'creator': current_identity["username"],
                    'id': node[0]['id'],
                }
                owner_res = http_query_node('Dataset', payload)
                nodes_owned = owner_res.json()
                if len(nodes_owned) == 0:
                    _res.set_code(EAPIResponseCode.forbidden)
                    _res.set_result("no permission for this dataset")
                    return _res.to_dict, _res.code

                query = request.args.get('query', '{}')
                page_size = int(request.args.get('page_size', 10))
                page = int(request.args.get('page', 0))
                order_by = request.args.get('order_by', 'create_timestamp')
                order_type = request.args.get('order_type', 'desc')

                query_info = json.loads(query)
                query_info["dataset_geid"] = {
                    "value": dataset_geid,
                    "condition": "equal"
                }

                params = {
                    "query": json.dumps(query_info),
                    "page_size": page_size,
                    "page": page,
                    "sort_by": order_by,
                    "sort_type": order_type,
                }
                response = requests.get(url, params=params)

                if response.status_code != 200:
                    _logger.error(
                        'Failed to query activity log from dataset service:   ' + response.text)
                    _res.set_code(EAPIResponseCode.internal_error)
                    _res.set_result(
                        'Failed to query activity log from dataset service:   ' + response.text)
                    return _res.to_dict, _res.code
                else:
                    return response.json()

            except Exception as e:
                _logger.error(
                    'Failed to query audit log from provenance service:   ' + str(e))
                _res.set_code(EAPIResponseCode.internal_error)
                _res.set_result(
                    'Failed to query audit log from provenance service:   ' + str(e))

    class ActivityLogByVersion(Resource):
        @jwt_required()
        def get(self, dataset_geid):
            """
                Fetch activity logs of a dataset by version number.
            """
            _res = APIResponse()
            _logger.info(
                f'Call API for fetching logs for dataset: {dataset_geid}')

            url = ConfigClass.DATASET_SERVICE + \
                'activity-logs/{}'.format(dataset_geid)

            try:
                node_res = http_query_node(
                    'Dataset', {'global_entity_id': dataset_geid})
                node = node_res.json()
                if len(node) == 0:
                    _res.set_code(EAPIResponseCode.bad_request)
                    _res.set_result('Dataset is not exist')
                    return _res.to_dict, _res.code

                page_size = int(request.args.get('page_size', 10))
                page = int(request.args.get('page', 0))
                order_by = request.args.get('order_by', 'create_timestamp')
                order_type = request.args.get('order_type', 'desc')
                version = request.args.get('version', '1')

                params = {
                    "page_size": page_size,
                    "page": page,
                    "sort_by": order_by,
                    "sort_type": order_type,
                    "version": version
                }
                response = requests.get(url, params=params)

                if response.status_code != 200:
                    _logger.error(
                        'Failed to query activity log from dataset service:   ' + response.text)
                    _res.set_code(EAPIResponseCode.internal_error)
                    _res.set_result(
                        'Failed to query activity log from dataset service:   ' + response.text)
                    return _res.to_dict, _res.code
                else:
                    return response.json()

            except Exception as e:
                _logger.error(
                    'Failed to query audit log from provenance service:   ' + str(e))
                _res.set_code(EAPIResponseCode.internal_error)
                _res.set_result(
                    'Failed to query audit log from provenance service:   ' + str(e))
