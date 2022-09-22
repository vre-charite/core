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

from services.neo4j_service.neo4j_client import Neo4jClient
from models.api_response import APIResponse, EAPIResponseCode
from config import ConfigClass
from flask_jwt import current_identity


def check_dataset_permissions(dataset_geid):
    api_response = APIResponse()
    neo4j_client = Neo4jClient()
    response = neo4j_client.node_query("Dataset", {"global_entity_id": dataset_geid}) 
    if not response.get("result"):
        api_response.set_code(EAPIResponseCode.not_found)
        api_response.set_result("Dataset not found")
        return False, api_response
    dataset_node = response.get("result")[0]

    if dataset_node["creator"] != current_identity["username"]:
        api_response.set_code(EAPIResponseCode.forbidden)
        api_response.set_result("Permission Denied")
        return False, api_response
    return True, None


