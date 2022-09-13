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

from .api_files.proxy import BaseProxyResource
from models.api_meta_class import MetaAPI
from config import ConfigClass
from api import module_api


api_ns_cataloguing = module_api.namespace(
    'Cataloguing Restful', description='Portal Cataloguing Restful', path='/v1')


# class APICataloguing(metaclass=MetaAPI):
#     def api_registry(self):
#         api_ns_cataloguing.add_resource(
#             self.DataLineage, '/lineage')

#     class DataLineage(BaseProxyResource):
#         url = ConfigClass.CATALOGUING_SERVICE + "lineage"
#         methods = ["GET"]
#         required_roles = {"GET": "member"}
