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
from flask_jwt import current_identity
import requests
from config import ConfigClass
from .utils import has_permission, get_project_code_from_request
from services.logger_services.logger_factory_service import SrvLoggerFactory
from services.neo4j_service.neo4j_client import Neo4jClient

_logger = SrvLoggerFactory('permissions').get_logger()

def permissions_check(resource, zone, operation):
    def inner(function):
        def wrapper(*args, **kwargs):
            project_code = get_project_code_from_request(kwargs)
            if not project_code:
                _logger.error("Couldn't get project_code in permissions_check decorator")
            if has_permission(project_code, resource, zone, operation):
                return function(*args, **kwargs)
            _logger.info(f"Permission denied for {project_code} - {resource} - {zone} - {operation}")
            return {'result': 'Permission Denied', 'error_msg': 'Permission Denied'}, 403
        return wrapper
    return inner

# this is temperory function to check the operation
# on the dataset. Any post/put action will ONLY require the owner
def dataset_permission():
    def inner(function):
        def wrapper(*args, **kwargs):
            dateset_geid = kwargs.get("dataset_geid")

            # here we have to find the parent node and delete the relationship
            query_url = ConfigClass.NEO4J_SERVICE + "nodes/Dataset/query"
            query_payload = {
                "global_entity_id": dateset_geid,
                "creator": current_identity.get("username"),
            }
            response = requests.post(query_url, json=query_payload)

            # if not the owner and not the platform admin
            if len(response.json()) == 0:
                return {'result': 'Permission Denied', 'error_msg': 'Permission Denied'}, 403

            return function(*args, **kwargs)
        return wrapper
    return inner

# this is temperory function to check the operation
# on the dataset. Any post/put action will ONLY require the owner
def dataset_permission_bycode():
    def inner(function):
        def wrapper(*args, **kwargs):
            dataset_code = kwargs.get("dataset_code")

            # here we have to find the parent node and delete the relationship
            query_url = ConfigClass.NEO4J_SERVICE + "nodes/Dataset/query"
            query_payload = {
                "code": dataset_code,
                "creator": current_identity.get("username"),
            }
            response = requests.post(query_url, json=query_payload)
            # print(response.json())

            # if not the owner and not the platform admin
            if len(response.json()) == 0:
                return {'result': 'Permission Denied', 'error_msg': 'Permission Denied'}, 403

            return function(*args, **kwargs)
            
        return wrapper
    return inner

