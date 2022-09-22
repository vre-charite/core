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


class TestContainerUser(unittest.TestCase):
    log = Logger(name='test_add_container_user.log')
    test = SetUpTest(log)
    app = PrepareTest().app
    headers = {}


    @classmethod
    def setUpClass(cls) -> None:
        payload = {
            "username": "admin",
            "password": "admin",
            "realm": ConfigClass.KEYCLOAK_REALM
        }
        cls.headers["Authorization"] = cls.test.auth_member(payload)
        cls.user = cls.test.get_user_by_name("amyguindoc12")
        cls.username = cls.user["username"]
        cls.project = cls.test.get_project("cli")
        cls.project_geid = cls.project["global_entity_id"]

    @classmethod
    def tearDownClass(cls) -> None:
        cls.test.remove_user_from_project(cls.user["id"], cls.project["id"])
        cls.test.remove_user_from_ad_group(cls.user["email"], cls.project["code"], cls.headers)

    def test_01_add_user_to_project(self):
        self.log.info("test case 1: add user into the project")
        payload = {"role":"admin"}
        response = self.app.post(f"v1/containers/{self.project_geid}/users/{self.username}", json=payload, headers=self.headers)
        self.log.info(f"Response payload: {response}")
        self.assertEqual(response.status_code, 200)

    def test_02_add_user_to_project_twice(self):
        self.log.info("test case 2: add user into the project twice")
        payload = {"role":"contributor"}
        response = self.app.post(f"v1/containers/{self.project_geid}/users/{self.username}", json=payload, headers=self.headers)
        self.log.info(f"Response payload: {response}")
        self.assertEqual(response.status_code, 403)
        
    
    # def test_03_add_user_to_project_fail_ad(self):
    #     self.log.info("test case 3: add user into the project without ad group")
    #     payload = {"role":"admin"}
    #     username = "amy.guindoc11"
    #     response = self.app.post(f"v1/containers/{self.project_geid}/users/{username}", json=payload, headers=self.headers)
    #     self.log.info(f"Response payload: {response}")
    #     self.assertEqual(response.status_code, 500)
