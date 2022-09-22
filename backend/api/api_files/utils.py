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

import json
from flask_jwt import current_identity


def check_folder_permissions(folder_node):
    if folder_node["folder_relative_path"]:
        root_folder = folder_node["folder_relative_path"].split("/")[0]
    else:
        root_folder = folder_node["name"]
    if root_folder != current_identity["username"]:
        return False
    return True

def parse_json(data):
    try:
        return json.loads(data) 
    except Exception as e:
        return False

