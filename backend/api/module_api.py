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

from flask_restx import Api
from api.api_files import nfs_entity_ns, nfs_upload_ns, nfs_vfolder_ns, nfs_entity_ns_v2, nfs_entity_ns_v4

module_api = Api(version='1.0', title='Portal API', description='BFF Portal API', doc='/v1/api-doc')

# add the namespace for APIs (for new api development, please follow the latest convention.)
module_api.add_namespace(nfs_entity_ns)
module_api.add_namespace(nfs_upload_ns)
module_api.add_namespace(nfs_vfolder_ns)
module_api.add_namespace(nfs_entity_ns_v2)
module_api.add_namespace(nfs_entity_ns_v4)
