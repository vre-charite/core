from .proxy import BaseProxyResource
from config import ConfigClass
from flask_jwt import jwt_required, current_identity
from flask import request
from services.permissions_service.decorators import permissions_check
from services.permissions_service.utils import has_permission, get_project_code_from_request
import requests


class Folders(BaseProxyResource):
    url = ConfigClass.DATA_SERVICE + "folders"
    @jwt_required()
    @permissions_check('file', '*', 'view')
    def get(self):
        response = requests.get(self.url, params=request.args, headers=request.headers)
        return response.json(), response.status_code

    @jwt_required()
    def post(self):
        if request.get_json().get("service") == "VRE":
            zone = "vrecore"
        else:
            zone = "greenroom"

        project_code = get_project_code_from_request({})
        if not has_permission(project_code, 'file', zone, 'upload'):
            return {"result": "Permission Denied"}, 401
        response = requests.post(self.url, params=request.get_json(), headers=request.headers)
        return response.json(), response.status_code
