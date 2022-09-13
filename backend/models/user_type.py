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

from enum import Enum

class EUserRole(Enum):
    site_admin = -1
    admin = 0
    collaborator = 1
    member = 2
    contributor = 3
    visitor = 4

def map_role_front_to_sys(role: str):
    '''
    return EUserRole Type
    '''
    return {
        'site-admin': EUserRole.site_admin,
        'admin': EUserRole.admin,
        'member': EUserRole.member,
        'contributor': EUserRole.contributor,
        'uploader': EUserRole.contributor,
        'visitor': EUserRole.visitor,
        'collaborator': EUserRole.collaborator
    }.get(role, None)

def map_role_sys_to_front(role: EUserRole):
    '''
    return string
    '''
    return {
        EUserRole.site_admin: 'site-admin',
        EUserRole.admin: 'admin',
        EUserRole.member: 'member',
        EUserRole.contributor: 'contributor',
        EUserRole.visitor: 'visitor',
        EUserRole.collaborator: 'collaborator'
    }.get(role, None)

def map_role_neo4j_to_sys(role: int):
    return {
        'admin': EUserRole.admin, 
        'member': EUserRole.member,
        'uploader': EUserRole.contributor,
        'contributor': EUserRole.contributor,
        'visitor': EUserRole.visitor,
        'collaborator': EUserRole.collaborator
    }.get(role, None)

def map_neo4j_to_frontend(role: str):
    return {
        'site-admin': 'Platform Administrator', 
        'admin': 'Project Administrator', 
        'member': 'Member',
        'contributor': 'Project Contributor',
        'uploader': 'Project Contributor',
        'visitor': 'Visitor',
        'collaborator': 'Project Collaborator'
    }.get(role, 'Member')
