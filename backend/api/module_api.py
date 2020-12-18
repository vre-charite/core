from flask_restx import Api
from api.api_files import nfs_entity_ns, nfs_upload_ns

module_api = Api(version='1.0', title='Portal API', 
    description='BFF Portal API for VRE', doc='/v1/api-doc')

# add the namespace for APIs (for new api development, please follow the latest convention.)
module_api.add_namespace(nfs_entity_ns)
module_api.add_namespace(nfs_upload_ns)
