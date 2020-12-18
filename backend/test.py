from services.container_services.container_manager import SrvContainerManager
from models.api_response import APIResponse, EAPIResponseCode
import datetime
from models.api_data_manifest import DataManifest, EDataManifestType

# init resp
my_res = APIResponse()
# get request params
project_code = "generate"
# init container_mgr
container_mgr = SrvContainerManager()
if not project_code:
    my_res.set_code(EAPIResponseCode.bad_request)
    my_res.set_error_msg('Invalid request, need project_code')
project = container_mgr.get_by_project_code(project_code)
if project[0]:
    if len(project[1]) > 0:
        my_res.set_code(EAPIResponseCode.success)
        project_detail = project[1][0]
        data_manifest_list = project_detail.get('data_manifest')
        if data_manifest_list:
            my_res.set_result(data_manifest_list)
        else:
            reserved_tags_manifest = DataManifest()
            reserved_tags_manifest.manifest_id = project_code + ":" + "reserved_tags" \
                + ":" + str(round(datetime.datetime.utcnow().timestamp()))
            reserved_tags_manifest.key = "reserved_tags"
            reserved_tags_manifest.diplay_name = "Reserved Tags"
            reserved_tags_manifest.value = []
            reserved_tags_manifest.type = EDataManifestType.MULTIPLE_CHOICE.name
            reserved_tags_manifest.note = "Project-wise are tags only editable by project admins"
            manifest_list_default = [
                reserved_tags_manifest.to_dict
            ]
            my_res.set_result(manifest_list_default)
    else:
        my_res.set_code(EAPIResponseCode.not_found)
        my_res.set_error_msg('Project Not Found: ' + project_code)
else:
    my_res.set_code(EAPIResponseCode.internal_error)

print(str(my_res.to_dict))