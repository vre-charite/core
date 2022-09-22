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

from models.user_type import EUserRole, map_role_front_to_sys, map_role_neo4j_to_sys
from services.user_services.user_authorization import user_accessible
from services.container_services.container_manager import SrvContainerManager
from config import ConfigClass
import requests
import json

def boolean_validate_role(required_role, user_role, user_id , project_geid):
    '''
    return Tuple(boolean_is_validated, project_role/error_msg)
    user_role => current_identity["role"]
    '''
    mgr_container = SrvContainerManager()
    required_role_mapped = map_role_front_to_sys(required_role)
    project_info = mgr_container.get_by_project_geid(project_geid)
    if project_info[0]:
        project_info = project_info[1][0]
    else:
        raise project_info[1]
    # validate, if site-admin, full access
    if user_role == EUserRole.site_admin.name:
        return True, "admin"
    if user_role == EUserRole.admin.name:
        return True, "admin"
    try:
        url = ConfigClass.NEO4J_SERVICE + "relations"
        url += "?start_id=%d" % int(user_id)
        url += "&end_id=%d" % int(project_info['id'])
        res = requests.get(url=url)
        if(res.status_code != 200):
            raise Exception("Unauthorized: " +
                            json.loads(res.text))
        relations = json.loads(res.text)
        if(len(relations) == 0):
            raise Exception(
                "Unauthorized: User does not have access to the project.")
        if relations[0]["r"].get("status") in ["disable", "hibernate"]:
            raise Exception(
                "Unauthorized: User's permission to the project disabled")
    except Exception as e:
        return False, str(e)

    for item in relations:
        # validate project_role
        project_role = item["r"]["type"]
        role_neo4j_mapped = map_role_neo4j_to_sys(project_role)
        if(user_accessible(required_role_mapped, role_neo4j_mapped)):
            # if user accessible pass authorization and continue function
            return True, project_role

    # if not pass the authorization
    return False, 'Permission Denied'