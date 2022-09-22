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

from api.module_api import module_api
from models.api_meta_class import MetaAPI
from .container_operation_neo4j import *
from .user_operation import *
from .api_aduser_update import ADUserUpdate
from .namespace import datasets_entity_ns, users_entity_ns
from .api_container_user import ContainerUser

from flask_restx import Api, Resource, fields
from config import ConfigClass


class APIContainer(metaclass=MetaAPI):
    def api_registry(self):
        datasets_entity_ns.add_resource(Containers, '/')

        # Actions on specific dataset
        datasets_entity_ns.add_resource(Container, '/<project_geid>')

        # Actions on multiple users
        datasets_entity_ns.add_resource(ContainerUsers, '/<project_geid>/users')
        datasets_entity_ns.add_resource(ContainerUsersQuery, '/<project_geid>/users/query')
        datasets_entity_ns.add_resource(ContainerAdmins, '/<project_geid>/admins')

        # Actions on the specific user

        datasets_entity_ns.add_resource(ContainerUser, '/<project_geid>/users/<username>')
        # Actions on users
        users_entity_ns.add_resource(Users, '/platform')
        users_entity_ns.add_resource(
            UserContainerQuery, '/<username>/containers')
        users_entity_ns.add_resource(
            UserDefaultContainer, '/<username>/default')
        users_entity_ns.add_resource(ADUserUpdate, '')
