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

from config import ConfigClass
from flask_jwt import jwt_required, current_identity
from models.api_response import APIResponse, EAPIResponseCode
from services.logger_services.logger_factory_service import SrvLoggerFactory
from services.permissions_service.decorators import permissions_check
from services.permissions_service.utils import has_permission 
from services.neo4j_service.neo4j_client import Neo4jClient
from flask_restx import Resource
import requests
from flask import request
import json

_logger = SrvLoggerFactory('api_files_ops_v1').get_logger()

class VirtualFolderFiles(Resource):

    @jwt_required()
    def post(self, collection_geid):
        """
            Add files to vfolder
        """
        _res = APIResponse()
        headers = request.headers

        try:
            # Get vfolder
            url = ConfigClass.NEO4J_SERVICE + f"nodes/VirtualFolder/query"
            payload = {
                "global_entity_id": collection_geid,
            }
            response = requests.post(url, json=payload)
            if response.status_code != 200:
                _res.code = response.status_code
                _res.error_msg = response.json()
                return response.json(), response.status_code
            if not response.json():
                _res.set_code(EAPIResponseCode.not_found)
                _res.set_error_msg("VirtualFolder not found")
                return _res.to_dict, _res.code
            vfolder = response.json()[0]

            data = request.get_json()

            if current_identity["role"] != "admin":
                if vfolder["owner"] != current_identity["username"]:
                    _res.set_code(EAPIResponseCode.bad_request)
                    _res.set_result("no permission for this project")
                    return _res.to_dict, _res.code

            url = ConfigClass.DATA_UTILITY_SERVICE + f"collections/{collection_geid}/files"
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
            _logger.error("errors in add files to vfolder: {}".format(str(e)))
            _res.set_code(EAPIResponseCode.internal_error)
            _res.set_result("Failed to add files to vfolder")
            return _res.to_dict, _res.code


    @jwt_required()
    def delete(self, collection_geid):
        _res = APIResponse()
        headers = request.headers

        try:
            # Get vfolder
            url = ConfigClass.NEO4J_SERVICE + f"nodes/VirtualFolder/query"
            payload = {
                "global_entity_id": collection_geid,
            }
            response = requests.post(url, json=payload)
            if response.status_code != 200:
                api_response.code = response.status_code
                api_response.error_msg = response.json()
                return api_response.json_response()
            vfolder = response.json()[0]
            data = request.get_json()

            if current_identity["role"] != "admin":
                if vfolder["owner"] != current_identity["username"]:
                    _res.set_code(EAPIResponseCode.bad_request)
                    _res.set_result("no permission for this project")
                    return _res.to_dict, _res.code

            url = ConfigClass.DATA_UTILITY_SERVICE + f"collections/{collection_geid}/files"
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
            _logger.error("errors in remove files from vfolder: {}".format(str(e)))
            _res.set_code(EAPIResponseCode.internal_error)
            _res.set_result("Failed to remove files from vfolder")
            return _res.to_dict, _res.code
    


class VirtualFolder(Resource):
    url = ConfigClass.DATA_UTILITY_SERVICE + "collections/"

    @jwt_required()
    @permissions_check('collections', 'core', 'view')
    def get(self):
        payload = {
            "username": current_identity['username'],
            **request.args
        }
        response = requests.get(self.url, params=payload, headers=request.headers)
        return response.json(), response.status_code

    @jwt_required()
    @permissions_check('collections', 'core', 'create')
    def post(self):
        payload = {
            "username": current_identity['username'],
            **request.get_json()
        }
        response = requests.post(self.url, json=payload, headers=request.headers)
        return response.json(), response.status_code


class VirtualFolderInfo(Resource):
    @jwt_required()
    def delete(self, collection_geid):
        _res = APIResponse()
        headers = request.headers

        neo4j_client = Neo4jClient()
        response = neo4j_client.node_query("VirtualFolder", {"global_entity_id": collection_geid})
        if not response.get("result"):
            _res.set_code(EAPIResponseCode.not_found)
            _res.set_error_msg("Virtual Folder not found")
            return _res.to_dict, _res.code
        if response.get("code") != 200:
            _res.set_code(response.get("code", 500))
            _res.set_error_msg(response.get("error_msg", "Error calling neo4j"))
            return _res.to_dict, _res.code
        vfolder_node = response.get("result")[0]

        neo4j_client = Neo4jClient()
        response = neo4j_client.node_get("Container", vfolder_node["container_id"])
        if not response.get("result"):
            _res.set_code(response.get("code", 500))
            _res.set_error_msg(response.get("error_msg"))
            return _res.to_dict, _res.code
        dataset_node = response.get("result")
        if not has_permission(dataset_node["code"], "collections", "core", "view"):
            _res.set_code(EAPIResponseCode.forbidden)
            _res.set_error_msg("Permission Denied")
            return _res.to_dict, _res.code

        try:
            if current_identity["role"] != "admin":
                if vfolder_node["owner"] != current_identity["username"]:
                    _res.set_code(EAPIResponseCode.bad_request)
                    _res.set_result("no permission for this project")
                    return _res.to_dict, _res.code

            url = ConfigClass.DATA_UTILITY_SERVICE + "collections/{}".format(collection_geid)
            data = request.get_json()
            response = requests.delete(url, json=data, headers=headers)
            if response.status_code != 200:
                _logger.error('Failed to delete vfolder:   '+ response.text)
                _res.set_code(EAPIResponseCode.internal_error)
                _res.set_result("Failed to delete vfolder")
                return _res.to_dict, _res.code
            else:
                _logger.info('Successfully delete vfolder: {}'.format(json.dumps(response.json())))
                return response.json()
        except Exception as e:
            _logger.error("errors in delete vfolder: {}".format(str(e)))
            _res.set_code(EAPIResponseCode.internal_error)
            _res.set_result("Failed to delete vfolder")
            return _res.to_dict, _res.code

