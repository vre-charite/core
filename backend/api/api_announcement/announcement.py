from flask_restx import Api, Resource, fields
from flask_jwt import jwt_required, current_identity
from models.api_meta_class import MetaAPI
from flask import request

from models.api_response import APIResponse, EAPIResponseCode
from api import module_api
from api.api_files.proxy import BaseProxyResource
from config import ConfigClass
from resources.utils import get_project_permissions
import requests


api_ns_report = module_api.namespace(
    'Announcement', description='Announcement API', path='/v1')


class APIAnnouncement(metaclass=MetaAPI):
    def api_registry(self):
        api_ns_report.add_resource(
            self.AnnouncementRestful, '/announcements')

    class AnnouncementRestful(BaseProxyResource):
        @jwt_required()
        def get(self):
            api_response = APIResponse()
            data = request.args
            if not data.get("project_code"):
                api_response.set_error_msg("Missing project code")
                api_response.set_code(EAPIResponseCode.bad_request)
                return api_response.to_dict, api_response.code

            if current_identity["role"] != "admin":
                # Get Dataset
                response = requests.post(ConfigClass.NEO4J_SERVICE + "nodes/Dataset/query", json={"code": data["project_code"]})
                if not response.json():
                    api_response.set_error_msg("Dataset not found")
                    api_response.set_code(EAPIResponseCode.bad_request)
                    return api_response.to_dict, api_response.code
                dataset_id = response.json()[0]["id"]

                # Get relation between user and dataset
                params = {
                    "start_id": current_identity["user_id"],
                    "end_id": dataset_id
                }
                relation = requests.get(ConfigClass.NEO4J_SERVICE + "relations", params=params)
                if not relation.json():
                    api_response.set_error_msg("User not in project")
                    api_response.set_code(EAPIResponseCode.forbidden)
                    return api_response.to_dict, api_response.code

            response = requests.get(ConfigClass.NOTIFY_SERVICE + "/v1/announcements", params=data)
            if response.status_code != 200:
                api_response.set_code(EAPIResponseCode.internal_error)
                api_response.set_error_msg(response.json())
                return api_response.to_dict, api_response.code
            api_response.set_result(response.json())
            return api_response.to_dict, api_response.code

        @jwt_required()
        def post(self):
            api_response = APIResponse()
            data = request.get_json()
            if not data.get("project_code"):
                api_response.set_error_msg("Missing project code")
                api_response.set_code(EAPIResponseCode.bad_request)
                return api_response.to_dict, api_response.code

            if current_identity["role"] != "admin":
                # Get Dataset
                response = requests.post(ConfigClass.NEO4J_SERVICE + "nodes/Dataset/query", json={"code": data["project_code"]})
                if not response.json():
                    api_response.set_error_msg("Dataset not found")
                    api_response.set_code(EAPIResponseCode.bad_request)
                    return api_response.to_dict, api_response.code
                dataset_id = response.json()[0]["id"]

                # Get relation between user and dataset
                params = {
                    "start_id": current_identity["user_id"],
                    "end_id": dataset_id
                }
                relation = requests.get(ConfigClass.NEO4J_SERVICE + "relations", params=params)
                if relation.json()[0]["r"]["type"] != "admin":
                    api_response.set_error_msg("Permission denied")
                    api_response.set_code(EAPIResponseCode.forbidden)
                    return api_response.to_dict, api_response.code
            data["publisher"] = current_identity["username"]
            response = requests.post(ConfigClass.NOTIFY_SERVICE + "/v1/announcements", json=data)
            if response.status_code != 200:
                api_response.set_code(EAPIResponseCode.internal_error)
                api_response.set_error_msg(response.json())
                return api_response.to_dict, api_response.code
            api_response.set_result(response.json())
            return api_response.to_dict, api_response.code

