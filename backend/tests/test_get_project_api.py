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

import unittest
from tests.prepare_test import SetUpTest, PrepareTest
from tests.logger import Logger
from config import ConfigClass


class TestGetProject(unittest.TestCase):
    log = Logger(name='test_get_project_api.log')
    test = SetUpTest(log)
    app = PrepareTest().app
    admin_headers = {}
    member_headers = {}
    not_member_headers = {}


    @classmethod
    def setUpClass(cls) -> None:
        admin_payload = {
            "username": "admin",
            "password": "admin",
            "realm": ConfigClass.KEYCLOAK_REALM,
        }
        member_payload = {
            "username": "amyguindoc13",
            "password": "indoc2021!",
            "realm": ConfigClass.KEYCLOAK_REALM,
        }
        not_member_payload = {
            "username": "amyguindoc1120",
            "password": "indoc2021!",
            "realm": ConfigClass.KEYCLOAK_REALM,
        }
        cls.admin_headers["Authorization"] = cls.test.auth_member(admin_payload)
        cls.member_headers["Authorization"] = cls.test.auth_member(member_payload)
        cls.not_member_headers["Authorization"] = cls.test.auth_member(not_member_payload)
        cls.project = cls.test.get_project("cli")
        cls.project_geid = cls.project["global_entity_id"]

    def test_01_get_project_detail(self):
        self.log.info("test case 1: Project User get project detail for platform admin")
        response = self.app.get(f"v1/project/{self.project_geid}", headers=self.admin_headers)
        self.log.info(f"Response payload: {response}")
        self.assertEqual(response.status_code, 200)

    def test_02_get_project_detail(self):
        self.log.info("test case 2: Project User get project detail for user in the project")
        response = self.app.get(f"v1/project/{self.project_geid}", headers=self.member_headers)
        self.log.info(f"Response payload: {response}")
        self.assertEqual(response.status_code, 200)
        
    def test_03_get_project_detail(self):
        self.log.info("test case 3: Project User get project detail for user not in the project")
        response = self.app.get(f"v1/project/{self.project_geid}", headers=self.not_member_headers)
        self.log.info(f"Response payload: {response}")
        self.assertEqual(response.status_code, 403)
    
    def test_04_get_project_detail(self):
        self.log.info("test case 4: Project User get project detail without headers")
        response = self.app.get(f"v1/project/{self.project_geid}")
        self.log.info(f"Response payload: {response}")
        self.assertEqual(response.status_code, 401)
