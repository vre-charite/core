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


class SrvUserManager(metaclass=MetaService):
    def __init__(self):
        self.url = ConfigClass.NEO4J_SERVICE

    def get_email_by_username(self, username):
        url = ConfigClass.NEO4J_SERVICE + "nodes/User/query"
        res = requests.post(
            url=url,
            json={"name": username}
        )
        users = json.loads(res.text)
        return users[0]['email']
    
    def get_user_by_email(self, email):
        url = ConfigClass.NEO4J_SERVICE + "nodes/User/query"
        res = requests.post(
            url=url,
            json={"email": email}
        )
        users = json.loads(res.text)
        return users[0]
