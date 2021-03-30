import unittest
from tests.prepare_test import SetUpTest, PrepareTest
from tests.logger import Logger
from unittest import mock
from services.notifier_services.email_service import SrvEmail
import json


class TestFileV3Proxy(unittest.TestCase):
    log = Logger(name='test_api_file_v3_proxy.log')
    test = SetUpTest(log)
    app = PrepareTest().app
    headers = {}
    resource_requests = []

    @classmethod
    def setUpClass(cls) -> None:
        cls.headers["Authorization"] = cls.test.auth_member()
        cls.user = cls.test.get_user()
        cls.project = cls.test.create_project("file_v3_proxy_testproject")
        cls.project2 = cls.test.create_project("file_v3_proxy_testproject2")
        cls.project3 = cls.test.create_project("file_v3_proxy_testproject3")
        cls.test.add_user_to_project(cls.user["id"], cls.project["id"], "admin")
        cls.test.add_user_to_project(cls.user["id"], cls.project2["id"], "collaborator")
        cls.test.add_user_to_project(cls.user["id"], cls.project3["id"], "contributor")

    @classmethod
    def tearDownClass(cls) -> None:
        cls.test.delete_project(cls.project["id"])
        cls.test.delete_project(cls.project2["id"])
        cls.test.delete_project(cls.project3["id"])

    def test_01_dataset_file_query(self):
        payload = {
            'page': 0,
            'page_size': 10,
            'order_by': 'name',
            'order_type': 'desc',
            'query': {
                'labels': ['Greenroom', 'Raw'],
                'File': {
                    "uploader": "jzhang10",
                },
                'Folder': {
                    "uploader": "jzhang10",
                },
            }
        }
        dataset_id = self.project["id"]
        response = self.app.post(f"/v3/files/containers/{dataset_id}/files/meta", json=payload, headers=self.headers)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.get_json()["result"], [])

    def test_02_dataset_file_query_missing_labels(self):
        payload = {
            'page': 0,
            'page_size': 10,
            'order_by': 'name',
            'order_type': 'desc',
            'query': {
                'File': {
                    "uploader": "jzhang10",
                },
                'Folder': {
                    "uploader": "jzhang10",
                },
            }
        }
        dataset_id = self.project["id"]
        response = self.app.post(f"/v3/files/containers/{dataset_id}/files/meta", json=payload, headers=self.headers)
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.get_json()["error_msg"], "Missing required parameter labels")


    def test_03_dataset_file_query_processed(self):
        payload = {
            'page': 0,
            'page_size': 10,
            'order_by': 'name',
            'order_type': 'desc',
            'query': {
                'labels': ['Greenroom', 'Processed:File'],
                'Processed:File': {
                },
                'Greenroom': {
                },
            }
        }
        dataset_id = self.project["id"]
        response = self.app.post(f"/v3/files/containers/{dataset_id}/files/meta", json=payload, headers=self.headers)
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.get_json()["error_msg"], "Missing pipeline name when trying to fetch Processed data info")

    def test_04_dataset_file_query_collaborator(self):
        payload = {
            'page': 0,
            'page_size': 10,
            'order_by': 'name',
            'order_type': 'desc',
            'query': {
                'labels': ['Greenroom', 'Raw'],
                'Greenroom': {
                    "uploader": "jzhang10",
                },
                'Raw': {
                    "uploader": "jzhang10",
                },
            }
        }
        dataset_id = self.project2["id"]
        response = self.app.post(f"/v3/files/containers/{dataset_id}/files/meta", json=payload, headers=self.headers)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.get_json()["result"], [])

    def test_05_dataset_file_query_collaborator(self):
        payload = {
            'page': 0,
            'page_size': 10,
            'order_by': 'name',
            'order_type': 'desc',
            'query': {
                'labels': ['Greenroom', 'Raw'],
                'Greenroom': {
                },
                'Raw': {
                },
            }
        }
        dataset_id = self.project2["id"]
        response = self.app.post(f"/v3/files/containers/{dataset_id}/files/meta", json=payload, headers=self.headers)
        self.assertEqual(response.status_code, 403)
        self.assertEqual(response.get_json()["error_msg"], "Permission Denied")

    def test_06_dataset_file_query_contributor(self):
        payload = {
            'page': 0,
            'page_size': 10,
            'order_by': 'name',
            'order_type': 'desc',
            'query': {
                'labels': ['Greenroom', 'Raw'],
                'Greenroom': {
                    "uploader": "jzhang10",
                },
                'Raw': {
                    "uploader": "jzhang10",
                },
            }
        }
        dataset_id = self.project3["id"]
        response = self.app.post(f"/v3/files/containers/{dataset_id}/files/meta", json=payload, headers=self.headers)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.get_json()["result"], [])

    def test_07_dataset_file_query_contributor(self):
        payload = {
            'page': 0,
            'page_size': 10,
            'order_by': 'name',
            'order_type': 'desc',
            'query': {
                'labels': ['Greenroom', 'Raw'],
                'Greenroom': {
                },
                'Raw': {
                },
            }
        }
        dataset_id = self.project3["id"]
        response = self.app.post(f"/v3/files/containers/{dataset_id}/files/meta", json=payload, headers=self.headers)
        self.assertEqual(response.status_code, 403)
        self.assertEqual(response.get_json()["error_msg"], "Permission Denied")

    def test_08_dataset_file_query_contributor_core(self):
        payload = {
            'page': 0,
            'page_size': 10,
            'order_by': 'name',
            'order_type': 'desc',
            'query': {
                'labels': ['VRECore', 'Raw'],
                'VRECore': {
                    'uploader': 'jzhang10'
                },
                'Raw': {
                    'uploader': 'jzhang10'
                },
            }
        }
        dataset_id = self.project3["id"]
        response = self.app.post(f"/v3/files/containers/{dataset_id}/files/meta", json=payload, headers=self.headers)
        self.assertEqual(response.status_code, 403)
        self.assertEqual(response.get_json()["error_msg"], "Permission Denied")

    def test_09_dataset_file_query_contributor_wrong_user(self):
        payload = {
            'page': 0,
            'page_size': 10,
            'order_by': 'name',
            'order_type': 'desc',
            'query': {
                'labels': ['Greenroom', 'Raw'],
                'Greenroom': {
                    'uploader': 'jzhang11'
                },
                'Raw': {
                    'uploader': 'jzhang11'
                },
            }
        }
        dataset_id = self.project3["id"]
        response = self.app.post(f"/v3/files/containers/{dataset_id}/files/meta", json=payload, headers=self.headers)
        self.assertEqual(response.status_code, 403)
        self.assertEqual(response.get_json()["error_msg"], "Permission Denied")

    def test_10_dataset_file_query_contributor_disable_fuzzy(self):
        payload = {
            'page': 0,
            'page_size': 10,
            'order_by': 'name',
            'order_type': 'desc',
            'query': {
                'labels': ['Greenroom', 'Raw'],
                'Greenroom': {
                    'uploader': 'jzhang10',
                    'partial': ['uploader']
                },
                'Raw': {
                    'uploader': 'jzhang10',
                    'partial': ['uploader']
                },
            }
        }
        dataset_id = self.project3["id"]
        response = self.app.post(f"/v3/files/containers/{dataset_id}/files/meta", json=payload, headers=self.headers)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.get_json()["result"], [])

    def test_11_dataset_file_query_collaborator_greenroom(self):
        payload = {
            'page': 0,
            'page_size': 10,
            'order_by': 'name',
            'order_type': 'desc',
            'query': {
                'labels': ['Greenroom', 'Raw'],
                'Greenroom': {
                },
                'Raw': {
                },
            }
        }
        dataset_id = self.project2["id"]
        response = self.app.post(f"/v3/files/containers/{dataset_id}/files/meta", json=payload, headers=self.headers)
        self.assertEqual(response.status_code, 403)
        self.assertEqual(response.get_json()["error_msg"], "Permission Denied")

    def test_12_dataset_file_query_collaborator_greenroom_wrong_user(self):
        payload = {
            'page': 0,
            'page_size': 10,
            'order_by': 'name',
            'order_type': 'desc',
            'query': {
                'labels': ['Greenroom', 'Raw'],
                'Greenroom': {
                    'uploader': 'jzhang11',
                },
                'Raw': {
                    'uploader': 'jzhang11',
                },
            }
        }
        dataset_id = self.project2["id"]
        response = self.app.post(f"/v3/files/containers/{dataset_id}/files/meta", json=payload, headers=self.headers)
        self.assertEqual(response.status_code, 403)
        self.assertEqual(response.get_json()["error_msg"], "Permission Denied")

    def test_13_dataset_file_query_collaborator_greenroom_fuzzy_user(self):
        payload = {
            'page': 0,
            'page_size': 10,
            'order_by': 'name',
            'order_type': 'desc',
            'query': {
                'labels': ['Greenroom', 'Raw'],
                'Greenroom': {
                    'uploader': 'jzhang10',
                    'partial': ['uploader']
                },
                'Raw': {
                    'uploader': 'jzhang10',
                    'partial': ['uploader']
                },
            }
        }
        dataset_id = self.project2["id"]
        response = self.app.post(f"/v3/files/containers/{dataset_id}/files/meta", json=payload, headers=self.headers)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.get_json()["result"], [])

    def test_14_dataset_file_query_collaborator_multi_label(self):
        payload = {
            'page': 0,
            'page_size': 10,
            'order_by': 'name',
            'order_type': 'desc',
            'query': {
                'labels': ['Greenroom:File:Raw', 'Procesed:File:VRECore'],
                'Greenroom:File:Raw': {
                    'uploader': 'jzhang10',
                    'partial': ['uploader']
                },
                'Processed:File:VRECore': {
                    'process_pipeline': 'test'
                },
            }
        }
        dataset_id = self.project2["id"]
        response = self.app.post(f"/v3/files/containers/{dataset_id}/files/meta", json=payload, headers=self.headers)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.get_json()["result"], [])

    def test_14_dataset_file_query_collaborator_multi_label_permission(self):
        payload = {
            'page': 0,
            'page_size': 10,
            'order_by': 'name',
            'order_type': 'desc',
            'query': {
                'labels': ['Greenroom:File:Processed', 'Procesed:File:VRECore'],
                'Greenroom:File:Processed': {
                },
                'Processed:File:VRECore': {
                },
            }
        }
        dataset_id = self.project2["id"]
        response = self.app.post(f"/v3/files/containers/{dataset_id}/files/meta", json=payload, headers=self.headers)
        self.assertEqual(response.status_code, 403)
        self.assertEqual(response.get_json()["error_msg"], "Permission Denied")


class TestFileFolderV3Proxy(unittest.TestCase):
    log = Logger(name='test_api_file_folder_v3_proxy.log')
    test = SetUpTest(log)
    app = PrepareTest().app
    headers = {}
    resource_requests = []

    @classmethod
    def setUpClass(cls) -> None:
        cls.headers["Authorization"] = cls.test.auth_member()
        cls.user = cls.test.get_user()
        cls.project = cls.test.create_project("file_v3_proxy_testproject")
        cls.project2 = cls.test.create_project("file_v3_proxy_testproject2")
        cls.project3 = cls.test.create_project("file_v3_proxy_testproject3")
        cls.test.add_user_to_project(cls.user["id"], cls.project["id"], "admin")
        cls.test.add_user_to_project(cls.user["id"], cls.project2["id"], "collaborator")
        cls.test.add_user_to_project(cls.user["id"], cls.project3["id"], "contributor")
        cls.folder_1 = cls.test.create_folder("test_folder_1", cls.project["code"])
        cls.folder_2 = cls.test.create_folder("test_folder_2", cls.project2["code"])
        cls.folder_3 = cls.test.create_folder("test_folder_3", cls.project3["code"])

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
            'query': {
                'labels': ['Greenroom', 'Raw'],
                'File': {
                    "uploader": "jzhang10",
                },
                'Folder': {
                    "uploader": "jzhang10",
                },
            }
        }
        dataset_id = self.project["id"]
        folder_geid = self.folder_1["global_entity_id"]
        response = self.app.post(f"/v3/files/containers/{dataset_id}/folder/{folder_geid}/meta", json=payload, headers=self.headers)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.get_json()["result"], [])

    def test_02_dataset_file_query_no_label(self):
        payload = {
            'page': 0,
            'page_size': 10,
            'order_by': 'name',
            'order_type': 'desc',
            'query': {
                'File': {
                    "uploader": "jzhang10",
                },
                'Folder': {
                    "uploader": "jzhang10",
                },
            }
        }
        dataset_id = self.project["id"]
        folder_geid = self.folder_1["global_entity_id"]
        response = self.app.post(f"/v3/files/containers/{dataset_id}/folder/{folder_geid}/meta", json=payload, headers=self.headers)
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.get_json()["error_msg"], "Missing required parameter labels")

    def test_03_dataset_file_query(self):
        payload = {
            'page': 0,
            'page_size': 10,
            'order_by': 'name',
            'order_type': 'desc',
            'query': {
                'labels': ['Processed:File', 'Processed:Folder'],
                'Processed:File': {
                },
                'Processed:Folder': {
                },
            }
        }
        dataset_id = self.project["id"]
        folder_geid = self.folder_1["global_entity_id"]
        response = self.app.post(f"/v3/files/containers/{dataset_id}/folder/{folder_geid}/meta", json=payload, headers=self.headers)
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.get_json()["error_msg"], "Missing pipeline name when trying to fetch Processed data info")

    def test_04_dataset_file_query_contributor(self):
        payload = {
            'page': 0,
            'page_size': 10,
            'order_by': 'name',
            'order_type': 'desc',
            'query': {
                'labels': ['Raw:File', 'Raw:Folder'],
                'Raw:File': {
                    'uploader': 'jzhang10',
                },
                'Raw:Folder': {
                    'uploader': 'jzhang10',
                },
            }
        }
        dataset_id = self.project3["id"]
        folder_geid = self.folder_3["global_entity_id"]
        response = self.app.post(f"/v3/files/containers/{dataset_id}/folder/{folder_geid}/meta", json=payload, headers=self.headers)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.get_json()["result"], [])

    def test_05_dataset_file_query_contributor_missing_uploader(self):
        payload = {
            'page': 0,
            'page_size': 10,
            'order_by': 'name',
            'order_type': 'desc',
            'query': {
                'labels': ['Processed:File', 'Processed:Folder'],
                'Processed:File': {
                },
                'Processed:Folder': {
                },
            }
        }
        dataset_id = self.project3["id"]
        folder_geid = self.folder_3["global_entity_id"]
        response = self.app.post(f"/v3/files/containers/{dataset_id}/folder/{folder_geid}/meta", json=payload, headers=self.headers)
        self.assertEqual(response.status_code, 403)
        self.assertEqual(response.get_json()["error_msg"], "Permission Denied")

    def test_06_dataset_file_query_contributor_wrong_user(self):
        payload = {
            'page': 0,
            'page_size': 10,
            'order_by': 'name',
            'order_type': 'desc',
            'query': {
                'labels': ['Raw:File', 'Raw:Folder'],
                'Raw:File': {
                    'uploader': 'jzhang11',
                },
                'Raw:Folder': {
                    'uploader': 'jzhang11',
                },
            }
        }
        dataset_id = self.project3["id"]
        folder_geid = self.folder_3["global_entity_id"]
        response = self.app.post(f"/v3/files/containers/{dataset_id}/folder/{folder_geid}/meta", json=payload, headers=self.headers)
        self.assertEqual(response.status_code, 403)
        self.assertEqual(response.get_json()["error_msg"], "Permission Denied")

    def test_07_dataset_file_query_contributor_core(self):
        payload = {
            'page': 0,
            'page_size': 10,
            'order_by': 'name',
            'order_type': 'desc',
            'query': {
                'labels': ['Raw:File:VRECore', 'Raw:Folder'],
                'Raw:File:VRECore': {
                    'uploader': 'jzhang10',
                },
                'Raw:Folder': {
                    'uploader': 'jzhang10',
                },
            }
        }
        dataset_id = self.project3["id"]
        folder_geid = self.folder_3["global_entity_id"]
        response = self.app.post(f"/v3/files/containers/{dataset_id}/folder/{folder_geid}/meta", json=payload, headers=self.headers)
        self.assertEqual(response.status_code, 403)
        self.assertEqual(response.get_json()["error_msg"], "Permission Denied")

    def test_08_dataset_file_query_contributor_uploader(self):
        payload = {
            'page': 0,
            'page_size': 10,
            'order_by': 'name',
            'order_type': 'desc',
            'query': {
                'labels': ['Raw:File', 'Raw:Folder'],
                'Raw:File': {
                    'uploader': 'jzhang10',
                    'partial': ['uploader'],
                },
                'Raw:Folder': {
                    'uploader': 'jzhang10',
                    'partial': ['uploader'],
                },
            }
        }
        dataset_id = self.project3["id"]
        folder_geid = self.folder_3["global_entity_id"]
        response = self.app.post(f"/v3/files/containers/{dataset_id}/folder/{folder_geid}/meta", json=payload, headers=self.headers)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.get_json()["result"], [])

    def test_08_dataset_file_query_collaboratorr_uploader(self):
        payload = {
            'page': 0,
            'page_size': 10,
            'order_by': 'name',
            'order_type': 'desc',
            'query': {
                'labels': ['Raw:File', 'Raw:Folder'],
                'Raw:File': {
                    'uploader': 'jzhang10',
                    'partial': ['uploader'],
                },
                'Raw:Folder': {
                    'uploader': 'jzhang10',
                    'partial': ['uploader'],
                },
            }
        }
        dataset_id = self.project2["id"]
        folder_geid = self.folder_2["global_entity_id"]
        response = self.app.post(f"/v3/files/containers/{dataset_id}/folder/{folder_geid}/meta", json=payload, headers=self.headers)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.get_json()["result"], [])

    def test_09_dataset_file_query_collaborator_uploader_missing(self):
        payload = {
            'page': 0,
            'page_size': 10,
            'order_by': 'name',
            'order_type': 'desc',
            'query': {
                'labels': ['Raw:Greenroom:File', 'Raw:Folder'],
                'Raw:Greenroom:File': {
                },
                'Raw:Folder': {
                    'uploader': 'jzhang10',
                    'partial': ['uploader'],
                },
            }
        }
        dataset_id = self.project2["id"]
        folder_geid = self.folder_2["global_entity_id"]
        response = self.app.post(f"/v3/files/containers/{dataset_id}/folder/{folder_geid}/meta", json=payload, headers=self.headers)
        self.assertEqual(response.status_code, 403)
        self.assertEqual(response.get_json()["error_msg"], "Permission Denied")

    def test_10_dataset_file_query_collaboratorr_uploader_wrong(self):
        payload = {
            'page': 0,
            'page_size': 10,
            'order_by': 'name',
            'order_type': 'desc',
            'query': {
                'labels': ['Raw:Greenroom:File', 'Raw:Folder'],
                'Raw:Greenroom:File': {
                    'uploader': 'jzhang11'
                },
                'Raw:Folder': {
                    'uploader': 'jzhang10',
                    'partial': ['uploader'],
                },
            }
        }
        dataset_id = self.project2["id"]
        folder_geid = self.folder_2["global_entity_id"]
        response = self.app.post(f"/v3/files/containers/{dataset_id}/folder/{folder_geid}/meta", json=payload, headers=self.headers)
        self.assertEqual(response.status_code, 403)
        self.assertEqual(response.get_json()["error_msg"], "Permission Denied")

    def test_11_dataset_file_query_collaboratorr_uploader_fuzzy(self):
        payload = {
            'page': 0,
            'page_size': 10,
            'order_by': 'name',
            'order_type': 'desc',
            'query': {
                'labels': ['Raw:Greenroom:File', 'Raw:Folder'],
                'Raw:Greenroom:File': {
                    'uploader': 'jzhang10',
                    'partial': ['uploader'],
                },
                'Raw:Folder': {
                    'uploader': 'jzhang10',
                    'partial': ['uploader'],
                },
            }
        }
        dataset_id = self.project2["id"]
        folder_geid = self.folder_2["global_entity_id"]
        response = self.app.post(f"/v3/files/containers/{dataset_id}/folder/{folder_geid}/meta", json=payload, headers=self.headers)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.get_json()["result"], [])
