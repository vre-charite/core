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

from .proxy import BaseProxyResource
from config import ConfigClass
from flask_restx import Resource
from flask_jwt import jwt_required
from services.permissions_service.decorators import permissions_check
import requests


class FoldersEntity(Resource):
    url = ConfigClass.ENTITYINFO_SERVICE + "folders"
    @jwt_required()
    @permissions_check("file", "*", "view")
    def get(self):
        response = requests.get(self.url, params=request.args)
        return response.json(), response.status_code

    @jwt_required()
    @permissions_check("file", "*", "create")
    def post(self):
        response = requests.post(self.url, json=request.get_json())
        return response.json(), response.status_code
    

# depracated
class FolderEntity(BaseProxyResource):
    methods = ["GET", "POST"]
    required_roles = {"GET": "member", "POST": "member"}
    url = ConfigClass.ENTITYINFO_SERVICE + "folder/{geid}"
