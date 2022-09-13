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

import requests
import json
from models.service_meta_class import MetaService
from config import ConfigClass
from services.logger_services.logger_factory_service import SrvLoggerFactory

_logger = SrvLoggerFactory('container_mgr').get_logger()

class SrvContainerManager(metaclass=MetaService):
    def __init__(self):
        self.url = ConfigClass.NEO4J_SERVICE
    def check_container_exist(self, token, label, container_id):
        my_url = self.url + "nodes/%s/node/" % label + str(container_id)
        headers = {
            'Authorization': token
        }
        res = requests.get(
            url=my_url,
            headers=headers
        )
        return json.loads(res.text)

    def list_containers(self, label, payload=None):
        url = ConfigClass.NEO4J_SERVICE + "nodes/%s/query" % label
        res = requests.post(
            url=url,
            json=payload
        )
        return json.loads(res.text)

    def get_by_project_code(self, project_code):
        url = ConfigClass.NEO4J_SERVICE + "nodes/Container/query" 
        payload = {
            "code": project_code
        }
        res = requests.post(
            url=url,
            json=payload
        )
        if res.status_code == 200:
            return True, res.json()
        else:
            error_msg = 'error when get_by_project_code: ' + str(json.loads(res.text))
            _logger.error()
            return False, error_msg

    def get_by_project_id(self, project_id):
        url = ConfigClass.NEO4J_SERVICE + "nodes/Container/query" 
        payload = {
            "id": int(project_id)
        }
        res = requests.post(
            url=url,
            json=payload
        )
        if res.status_code == 200:
            return True, res.json()
        else:
            error_msg = 'error when get_by_project_id ' + str(json.loads(res.text))
            _logger.error()
            return False, error_msg

    def get_by_project_geid(self, geid):
        url = ConfigClass.NEO4J_SERVICE + "nodes/Container/query" 
        payload = {
            "global_entity_id": geid
        }
        res = requests.post(
            url=url,
            json=payload
        )
        if res.status_code == 200:
            return True, res.json()
        else:
            error_msg = 'error when get_by_project_code: ' + str(json.loads(res.text))
            _logger.error()
            return False, error_msg