import unittest
from tests.prepare_test import SetUpTest, PrepareTest
from tests.logger import Logger
from unittest import mock
from services.notifier_services.email_service import SrvEmail
import json


class TestFileMetaProxy(unittest.TestCase):
    log = Logger(name='test_api_file_v3_proxy.log')
    test = SetUpTest(log)
    app = PrepareTest().app
    headers = {}
    resource_requests = []

    @classmethod
    def setUpClass(cls) -> None:
        cls.headers["Authorization"] = cls.test.auth_member()
        cls.user = cls.test.get_user()
        cls.project = cls.test.create_project("file_meta_proxy_testproject")
        cls.project2 = cls.test.create_project("file_meta_proxy_testproject2")
        cls.project3 = cls.test.create_project("file_meta_proxy_testproject3")
        cls.project4 = cls.test.create_project("file_meta_proxy_testproject4")
        cls.test.add_user_to_project(cls.user["id"], cls.project["id"], "admin")
        cls.test.add_user_to_project(cls.user["id"], cls.project2["id"], "collaborator")
        cls.test.add_user_to_project(cls.user["id"], cls.project3["id"], "contributor")

    @classmethod
    def tearDownClass(cls) -> None:
        cls.test.delete_project(cls.project["id"])
        cls.test.delete_project(cls.project2["id"])
        cls.test.delete_project(cls.project3["id"])
        cls.test.delete_project(cls.project4["id"])

    def test_01_dataset_file_query(self):
        payload = {
            'page': 0,
            'page_size': 10,
            'order_by': 'name',
            'order_type': 'desc',
            'query': '{"uploader": "jzhang10"}',
            'source_type': 'Project',
            'zone': 'Greenroom',
        }
        geid = self.project["global_entity_id"]
        response = self.app.get(f"/v1/files/entity/meta/{geid}", query_string=payload, headers=self.headers)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.get_json()["result"]["data"], [])

    def test_02_dataset_file_query_bad_zone(self):
        payload = {
            'page': 0,
            'page_size': 10,
            'order_by': 'name',
            'order_type': 'desc',
            'query': '{"uploader": "jzhang10"}',
            'source_type': 'Project',
        }
        geid = self.project["global_entity_id"]
        response = self.app.get(f"/v1/files/entity/meta/{geid}", query_string=payload, headers=self.headers)
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.get_json()["error_msg"], "Invalid zone")

    def test_03_dataset_file_query_collaborator(self):
        payload = {
            'page': 0,
            'page_size': 10,
            'order_by': 'name',
            'order_type': 'desc',
            'query': '{"uploader": "jzhang10"}',
            'source_type': 'Project',
            'zone': 'Greenroom',
        }
        geid = self.project2["global_entity_id"]
        response = self.app.get(f"/v1/files/entity/meta/{geid}", query_string=payload, headers=self.headers)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.get_json()["result"]["data"], [])

    def test_04_dataset_file_query_collaborator(self):
        payload = {
            'page': 0,
            'page_size': 10,
            'order_by': 'name',
            'order_type': 'desc',
            'source_type': 'Project',
            'zone': 'Greenroom',
        }
        geid = self.project2["global_entity_id"]
        response = self.app.get(f"/v1/files/entity/meta/{geid}", query_string=payload, headers=self.headers)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.get_json()["result"]["data"], [])

    def test_05_dataset_file_query_contributor(self):
        payload = {
            'page': 0,
            'page_size': 10,
            'order_by': 'name',
            'order_type': 'desc',
            'query': '{"uploader": "jzhang10"}',
            'source_type': 'Project',
            'zone': 'Greenroom',
        }
        geid = self.project3["global_entity_id"]
        response = self.app.get(f"/v1/files/entity/meta/{geid}", query_string=payload, headers=self.headers)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.get_json()["result"]["data"], [])

    def test_06_dataset_file_query_contributor(self):
        payload = {
            'page': 0,
            'page_size': 10,
            'order_by': 'name',
            'order_type': 'desc',
            'source_type': 'Project',
            'zone': 'Greenroom',
        }
        geid = self.project3["global_entity_id"]
        response = self.app.get(f"/v1/files/entity/meta/{geid}", query_string=payload, headers=self.headers)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.get_json()["result"]["data"], [])

    def test_07_dataset_file_query_contributor_core(self):
        payload = {
            'page': 0,
            'page_size': 10,
            'order_by': 'name',
            'order_type': 'desc',
            'query': '{"uploader": "jzhang10"}',
            'source_type': 'Project',
            'zone': 'VRECore',
        }
        geid = self.project3["global_entity_id"]
        response = self.app.get(f"/v1/files/entity/meta/{geid}", query_string=payload, headers=self.headers)
        self.assertEqual(response.status_code, 403)
        self.assertEqual(response.get_json()["error_msg"], "Permission Denied")

    def test_08_dataset_file_query_contributor_wrong_user(self):
        payload = {
            'page': 0,
            'page_size': 10,
            'order_by': 'name',
            'order_type': 'desc',
            'query': '{"uploader": "jzhang11"}',
            'source_type': 'Project',
            'zone': 'Greenroom',
        }
        geid = self.project3["global_entity_id"]
        response = self.app.get(f"/v1/files/entity/meta/{geid}", query_string=payload, headers=self.headers)
        self.assertEqual(response.status_code, 403)
        self.assertEqual(response.get_json()["error_msg"], "Permission Denied")

    def test_09_dataset_file_query_contributor_disable_fuzzy(self):
        payload = {
            'page': 0,
            'page_size': 10,
            'order_by': 'name',
            'order_type': 'desc',
            'query': '{"uploader": "jzhang10"}',
            'partial': '["uploader"]',
            'source_type': 'Project',
            'zone': 'Greenroom',
        }
        geid = self.project3["global_entity_id"]
        response = self.app.get(f"/v1/files/entity/meta/{geid}", query_string=payload, headers=self.headers)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.get_json()["result"]["data"], [])

    def test_10_dataset_file_query_collaborator_greenroom(self):
        payload = {
            'page': 0,
            'page_size': 10,
            'order_by': 'name',
            'order_type': 'desc',
            'source_type': 'Project',
            'zone': 'Greenroom',
        }
        geid = self.project3["global_entity_id"]
        response = self.app.get(f"/v1/files/entity/meta/{geid}", query_string=payload, headers=self.headers)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.get_json()["result"]["data"], [])

    def test_11_dataset_file_query_collaborator_greenroom_wrong_user(self):
        payload = {
            'page': 0,
            'page_size': 10,
            'order_by': 'name',
            'order_type': 'desc',
            'query': '{"uploader": "jzhang11"}',
            'source_type': 'Project',
            'zone': 'Greenroom',
        }
        geid = self.project2["global_entity_id"]
        response = self.app.get(f"/v1/files/entity/meta/{geid}", query_string=payload, headers=self.headers)
        self.assertEqual(response.status_code, 403)
        self.assertEqual(response.get_json()["error_msg"], "Permission Denied")

    def test_12_dataset_file_query_collaborator_greenroom_fuzzy_user(self):
        payload = {
            'page': 0,
            'page_size': 10,
            'order_by': 'name',
            'order_type': 'desc',
            'query': '{"uploader": "jzhang10"}',
            'partial': '["name"]',
            'source_type': 'Project',
            'zone': 'Greenroom',
        }
        geid = self.project2["global_entity_id"]
        response = self.app.get(f"/v1/files/entity/meta/{geid}", query_string=payload, headers=self.headers)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.get_json()["result"]["data"], [])

    def test_13_dataset_file_query_bad_geid(self):
        payload = {
            'page': 0,
            'page_size': 10,
            'order_by': 'name',
            'order_type': 'desc',
            'query': '{"uploader": "jzhang10"}',
            'source_type': 'Project',
            'zone': 'Greenroom',
        }
        response = self.app.get("/v1/files/entity/meta/bad", query_string=payload, headers=self.headers)
        self.assertEqual(response.status_code, 404)
        self.assertEqual(response.get_json()["error_msg"], "Dataset not found")

    def test_14_dataset_file_query_not_memeber(self):
        payload = {
            'page': 0,
            'page_size': 10,
            'order_by': 'name',
            'order_type': 'desc',
            'query': '{"uploader": "jzhang10"}',
            'source_type': 'Project',
            'zone': 'Greenroom',
        }
        geid = self.project4["global_entity_id"]
        response = self.app.get(f"/v1/files/entity/meta/{geid}", query_string=payload, headers=self.headers)
        self.assertEqual(response.status_code, 403)
        self.assertEqual(response.get_json()["error_msg"], "Permission Denied")


class TestFolderFileProxy(unittest.TestCase):
    log = Logger(name='test_api_file_meta_proxy.log')
    test = SetUpTest(log)
    app = PrepareTest().app
    headers = {}
    resource_requests = []

    @classmethod
    def setUpClass(cls) -> None:
        cls.headers["Authorization"] = cls.test.auth_member()
        cls.user = cls.test.get_user()
        cls.project = cls.test.create_project("file_meta_testproject")
        cls.project2 = cls.test.create_project("file_meta_testproject2")
        cls.project3 = cls.test.create_project("file_meta_testproject3")
        cls.test.add_user_to_project(cls.user["id"], cls.project["id"], "admin")
        cls.test.add_user_to_project(cls.user["id"], cls.project2["id"], "collaborator")
        cls.test.add_user_to_project(cls.user["id"], cls.project3["id"], "contributor")
        cls.folder_1 = cls.test.create_folder("unit_test_folder_1", cls.project["code"])
        cls.folder_2 = cls.test.create_folder("unit_test_folder_2", cls.project2["code"])
        cls.folder_3 = cls.test.create_folder("unit_test_folder_3", cls.project3["code"])

    @classmethod
    def tearDownClass(cls) -> None:
        cls.test.delete_project(cls.project["id"])
        cls.test.delete_project(cls.project2["id"])
        cls.test.delete_project(cls.project3["id"])

        cls.test.delete_folder_node(cls.folder_1["id"])
        cls.test.delete_folder_node(cls.folder_2["id"])
        cls.test.delete_folder_node(cls.folder_3["id"])

    def test_01_dataset_file_query(self):
        payload = {
            'page': 0,
            'page_size': 10,
            'order_by': 'name',
            'order_type': 'desc',
            'query': '{"uploader": "jzhang10"}',
            'source_type': 'Folder',
            'zone': 'All',
        }
        geid = self.folder_1["global_entity_id"]
        response = self.app.get(f"/v1/files/entity/meta/{geid}", query_string=payload, headers=self.headers)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.get_json()["result"]["data"], [])

    def test_02_dataset_file_query_missing_zone(self):
        payload = {
            'page': 0,
            'page_size': 10,
            'order_by': 'name',
            'order_type': 'desc',
            'query': '{"uploader": "jzhang10"}',
            'source_type': 'Folder',
        }
        geid = self.folder_1["global_entity_id"]
        response = self.app.get(f"/v1/files/entity/meta/{geid}", query_string=payload, headers=self.headers)
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.get_json()["error_msg"], "Invalid zone")

    def test_03_dataset_file_query(self):
        payload = {
            'page': 0,
            'page_size': 10,
            'order_by': 'name',
            'order_type': 'desc',
            'source_type': 'Folder',
            'zone': 'All',
        }
        geid = self.folder_1["global_entity_id"]
        response = self.app.get(f"/v1/files/entity/meta/{geid}", query_string=payload, headers=self.headers)
        self.assertEqual(response.status_code, 403)
        self.assertEqual(response.get_json()["error_msg"], "Permission Denied")

    def test_04_dataset_file_query_contributor(self):
        payload = {
            'page': 0,
            'page_size': 10,
            'order_by': 'name',
            'order_type': 'desc',
            'query': '{"uploader": "jzhang10"}',
            'source_type': 'Folder',
            'zone': 'Greenroom',
        }
        geid = self.folder_3["global_entity_id"]
        response = self.app.get(f"/v1/files/entity/meta/{geid}", query_string=payload, headers=self.headers)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.get_json()["result"]["data"], [])

    def test_05_dataset_file_query_contributor_missing_uploader(self):
        payload = {
            'page': 0,
            'page_size': 10,
            'order_by': 'name',
            'order_type': 'desc',
            'source_type': 'Folder',
            'zone': 'All',
        }
        geid = self.folder_3["global_entity_id"]
        response = self.app.get(f"/v1/files/entity/meta/{geid}", query_string=payload, headers=self.headers)
        self.assertEqual(response.status_code, 403)
        self.assertEqual(response.get_json()["error_msg"], "Permission Denied")

    def test_06_dataset_file_query_contributor_wrong_user(self):
        payload = {
            'page': 0,
            'page_size': 10,
            'order_by': 'name',
            'order_type': 'desc',
            'query': '{"uploader": "jzhang11"}',
            'source_type': 'Folder',
            'zone': 'All',
        }
        geid = self.folder_3["global_entity_id"]
        response = self.app.get(f"/v1/files/entity/meta/{geid}", query_string=payload, headers=self.headers)
        self.assertEqual(response.status_code, 403)
        self.assertEqual(response.get_json()["error_msg"], "Permission Denied")

    def test_07_dataset_file_query_contributor_core(self):
        payload = {
            'page': 0,
            'page_size': 10,
            'order_by': 'name',
            'order_type': 'desc',
            'query': '{"uploader": "jzhang10"}',
            'source_type': 'Folder',
            'zone': 'VRECore',
        }
        geid = self.folder_3["global_entity_id"]
        response = self.app.get(f"/v1/files/entity/meta/{geid}", query_string=payload, headers=self.headers)
        self.assertEqual(response.status_code, 403)
        self.assertEqual(response.get_json()["error_msg"], "Permission Denied")

    def test_08_dataset_file_query_contributor_uploader(self):
        payload = {
            'page': 0,
            'page_size': 10,
            'order_by': 'name',
            'order_type': 'desc',
            'query': '{"uploader": "jzhang10"}',
            'partial': '["name"]',
            'source_type': 'Folder',
            'zone': 'Greenroom',
        }
        geid = self.folder_3["global_entity_id"]
        response = self.app.get(f"/v1/files/entity/meta/{geid}", query_string=payload, headers=self.headers)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.get_json()["result"]["data"], [])

    def test_09_dataset_file_query_collaboratorr_uploader(self):
        payload = {
            'page': 0,
            'page_size': 10,
            'order_by': 'name',
            'order_type': 'desc',
            'query': '{"uploader": "jzhang10"}',
            'partial': '["name"]',
            'source_type': 'Folder',
            'zone': 'All',
        }
        geid = self.folder_2["global_entity_id"]
        response = self.app.get(f"/v1/files/entity/meta/{geid}", query_string=payload, headers=self.headers)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.get_json()["result"]["data"], [])

    def test_09_dataset_file_query_collaborator_uploader_missing(self):
        payload = {
            'page': 0,
            'page_size': 10,
            'order_by': 'name',
            'order_type': 'desc',
            'source_type': 'Folder',
            'zone': 'All',
        }
        geid = self.folder_2["global_entity_id"]
        response = self.app.get(f"/v1/files/entity/meta/{geid}", query_string=payload, headers=self.headers)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.get_json()["result"]["data"], [])

    def test_10_dataset_file_query_collaboratorr_uploader_wrong(self):
        payload = {
            'page': 0,
            'page_size': 10,
            'order_by': 'name',
            'order_type': 'desc',
            'query': '{"uploader": "jzhang11"}',
            'source_type': 'Folder',
            'zone': 'All',
        }
        geid = self.folder_2["global_entity_id"]
        response = self.app.get(f"/v1/files/entity/meta/{geid}", query_string=payload, headers=self.headers)
        self.assertEqual(response.status_code, 403)
        self.assertEqual(response.get_json()["error_msg"], "Permission Denied")

    def test_11_dataset_file_query_collaboratorr_uploader_fuzzy(self):
        payload = {
            'page': 0,
            'page_size': 10,
            'order_by': 'name',
            'order_type': 'desc',
            'query': '{"uploader": "jzhang10"}',
            'partial': '["name"]',
            'source_type': 'Folder',
            'zone': 'Greenroom',
        }
        geid = self.folder_2["global_entity_id"]
        response = self.app.get(f"/v1/files/entity/meta/{geid}", query_string=payload, headers=self.headers)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.get_json()["result"]["data"], [])

    def test_12_dataset_file_query_missing_source(self):
        payload = {
            'page': 0,
            'page_size': 10,
            'order_by': 'name',
            'order_type': 'desc',
            'query': '{"uploader": "jzhang10"}',
            'partial': '["name"]',
            'zone': 'Greenroom',
        }
        geid = self.folder_2["global_entity_id"]
        response = self.app.get(f"/v1/files/entity/meta/{geid}", query_string=payload, headers=self.headers)
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.get_json()["error_msg"], "Invalid source_type")

    def test_13_dataset_file_query_missing_source(self):
        payload = {
            'page': 0,
            'page_size': 10,
            'order_by': 'name',
            'order_type': 'desc',
            'query': 'bad json',
            'partial': '["name"]',
            'source_type': 'Folder',
            'zone': 'Greenroom',
        }
        geid = self.folder_2["global_entity_id"]
        response = self.app.get(f"/v1/files/entity/meta/{geid}", query_string=payload, headers=self.headers)
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.get_json()["error_msg"], "Invalid query json")

    def test_14_dataset_file_query_missing_source(self):
        payload = {
            'page': 0,
            'page_size': 10,
            'order_by': 'name',
            'order_type': 'desc',
            'query': '{"uploader": "jzhang10"}',
            'partial': 'bad json',
            'source_type': 'Folder',
            'zone': 'Greenroom',
        }
        geid = self.folder_2["global_entity_id"]
        response = self.app.get(f"/v1/files/entity/meta/{geid}", query_string=payload, headers=self.headers)
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.get_json()["error_msg"], "Invalid partial json")

    def test_15_dataset_file_query_bad_geid(self):
        payload = {
            'page': 0,
            'page_size': 10,
            'order_by': 'name',
            'order_type': 'desc',
            'query': '{"uploader": "jzhang10"}',
            'source_type': 'Folder',
            'zone': 'Greenroom',
        }
        response = self.app.get("/v1/files/entity/meta/bad", query_string=payload, headers=self.headers)
        self.assertEqual(response.status_code, 404)
        self.assertEqual(response.get_json()["error_msg"], "Folder not found")
