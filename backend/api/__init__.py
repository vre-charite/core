from .module_api import module_api
from .api_hello_world import APIHelloWorld
from .api_invitation import APIInvitation
from .api_report import APIReport
from .api_auth import APIAuthService
from .api_contact_us import APIContactUs
from .api_cataloguing import APICataloguing
from .api_time import APITimestamp
from .api_notification import APINotification
from .api_dataset.route_registry import APIDateSet
from .api_data_manifest.data_manifest import APIDataManifest
from .api_project import APIProject
from .api_system_tags import APISystemTags
from .api_announcement.announcement import APIAnnouncement
from .api_users import APIUsers
from .api_provenance import APIProvenance
from .api_scripts.neo_to_es import APINeo4j2ESScript
from .api_resource_request.resource_request import APIResourceRequest
from .api_workbench import APIWorkbench
from .api_folder_creation.api_folder_ops_v1 import APIFolderCreation
from .api_data_ops_utility.api_tags import APITagsV2

apis = [
    APIHelloWorld(),
    APIInvitation(),
    APIDateSet(),
    APIReport(),
    APIAuthService(),
    APIContactUs(),
    APICataloguing(),
    APITimestamp(),
    APINotification(),
    APIDataManifest(),
    APIProject(),
    APISystemTags(),
    APIAnnouncement(),
    APIUsers(),
    APIProvenance(),
    APINeo4j2ESScript(),
    APIResourceRequest(),
    APIWorkbench(),
    APIFolderCreation(),
    # APITagsV2(),
]


def api_registry(apis):
    if len(apis) > 0:
        for api_sub_module in apis:
            api_sub_module.api_registry()
    else:
        print('[Fatal]', 'No API registered.')


api_registry(apis)
