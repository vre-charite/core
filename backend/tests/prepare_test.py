from app import create_app, create_db
from tests.logger import Logger
from config import ConfigClass
import requests
from resources.utils import fetch_geid
from models.api_resource_request import ResourceRequest, db


class SetUpTest:

    def __init__(self, log):
        self.log = log

    def auth(self, payload=None):
        if not payload:
            payload = {
                "username": "admin",
                "password": "admin",
                "realm": "vre"
            }
        response = requests.post(ConfigClass.AUTH_SERVICE + "users/auth", json=payload)
        data = response.json()
        self.log.info(data)
        return data["result"].get("access_token")

    def auth_member(self, payload=None):
        if not payload:
            payload = {
                "username": "jzhang10",
                "password": "CMDvrecli2021!",
                "realm": "vre"
            }
        response = requests.post(ConfigClass.AUTH_SERVICE + "users/auth", json=payload)
        data = response.json()
        self.log.info(data)
        return data["result"].get("access_token")

    def get_user(self):
        payload = {
            "name": "jzhang10",
        }
        response = requests.post(ConfigClass.NEO4J_SERVICE + "nodes/User/query", json=payload)
        self.log.info(response.json())
        return response.json()[0]

    def create_folder(self, geid, project_code):
        self.log.info("\n")
        self.log.info("Creating testing folder".ljust(80, '-'))
        payload = {
            "global_entity_id": geid,
            "folder_name": "bff_proxy_unittest_folder",
            "folder_level": 0,
            "uploader": "BFFUnittest",
            "folder_relative_path": "",
            "zone": "greenroom",
            "project_code": project_code,
            "folder_tags": [],
            "folder_parent_geid": "",
            "folder_parent_name": "",
        }
        testing_api = '/v1/folders'
        try:
            res = requests.post(ConfigClass.FILEINFO_HOST + testing_api, json=payload)
            self.log.info(f"RESPONSE DATA: {res.text}")
            self.log.info(f"RESPONSE STATUS: {res.status_code}")
            assert res.status_code == 200
            result = res.json().get('result')
            return result
        except Exception as e:
            self.log.info(f"ERROR CREATING FOLDER: {e}")
            raise e

    def create_project(self, code, discoverable='true'):
        self.log.info("\n")
        self.log.info("Preparing testing project".ljust(80, '-'))
        testing_api = ConfigClass.NEO4J_SERVICE+ "nodes/Dataset"
        params = {"name": "BFFProxyUnitTest",
                  "path": code,
                  "code": code,
                  "description": "Project created by unit test, will be deleted soon...",
                  "discoverable": discoverable,
                  "type": "Usecase",
                  "tags": ['test'],
                  "global_entity_id": fetch_geid("dataset") 
                  }
        self.log.info(f"POST API: {testing_api}")
        self.log.info(f"POST params: {params}")
        try:
            res = requests.post(testing_api, json=params)
            self.log.info(f"RESPONSE DATA: {res.text}")
            self.log.info(f"RESPONSE STATUS: {res.status_code}")
            assert res.status_code == 200
            return res.json() [0]
        except Exception as e:
            self.log.info(f"ERROR CREATING PROJECT: {e}")
            raise e

    def delete_project(self, node_id):
        self.log.info("\n")
        self.log.info("Preparing delete project".ljust(80, '-'))
        delete_api = ConfigClass.NEO4J_SERVICE + "nodes/Dataset/node/%s" % str(node_id)
        try:
            delete_res = requests.delete(delete_api)
            self.log.info(f"DELETE STATUS: {delete_res.status_code}")
            self.log.info(f"DELETE RESPONSE: {delete_res.text}")
        except Exception as e:
            self.log.info(f"ERROR DELETING PROJECT: {e}")
            self.log.info(f"PLEASE DELETE THE PROJECT MANUALLY WITH ID: {node_id}")
            raise e

    def add_user_to_project(self, user_id, project_id, role):
        payload = {
            "start_id": user_id,
            "end_id": project_id,
        }
        response = requests.post(ConfigClass.NEO4J_SERVICE + f"relations/{role}", json=payload)
        if response.status_code != 200:
            raise Exception(f"Error adding user to project: {response.json()}")


    def remove_user_from_project(self, user_id, project_id):
        payload = {
            "start_id": user_id,
            "end_id": project_id,
        }
        response = requests.delete(ConfigClass.NEO4J_SERVICE + "relations", params=payload)
        if response.status_code != 200:
            raise Exception(f"Error removing user from project: {response.json()}")

    def get_projects(self):
        all_project_url = ConfigClass.NEO4J_SERVICE + 'nodes/Dataset/properties'
        try:
            response = requests.get(all_project_url)
            if response.status_code == 200:
                res = response.json()
                projects = res.get('code')
                return projects
            else:
                self.log.error(f"RESPONSE ERROR: {response.text}")
                return None
        except Exception as e:
            raise e

    def delete_resource_requests(self, app, id):
        if id:
            app.delete(f"/v1/resource-requests/{id}/")
            
    def delete_folder_node(self, node_id):
        self.log.info("\n")
        self.log.info("Preparing delete folder node".ljust(80, '-'))
        delete_api = ConfigClass.NEO4J_SERVICE+ "nodes/Folder/node/%s" % str(node_id)
        try:
            delete_res = requests.delete(delete_api)
            self.log.info(f"DELETE STATUS: {delete_res.status_code}")
            self.log.info(f"DELETE RESPONSE: {delete_res.text}")
        except Exception as e:
            self.log.info(f"ERROR DELETING FILE: {e}")
            self.log.info(f"PLEASE DELETE THE FILE MANUALLY WITH ID: {node_id}")
            raise e


class Singleton(type):
    _instances = {}
    def __call__(cls, *args, **kwargs):
        if cls not in cls._instances:
            cls._instances[cls] = super(Singleton, cls).__call__(*args, **kwargs)
        return cls._instances[cls]


class PrepareTest(metaclass=Singleton):

    def __init__(self):
        self.app = self.create_test_client()

    def create_test_client(self):
        app = create_app()
        app.config['TESTING'] = True
        app.config['DEBUG'] = True
        test_client = app.test_client(self)
        return test_client
