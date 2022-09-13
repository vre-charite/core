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

from models.user_type import EUserRole, map_role_front_to_sys

def get_security_lvl(user_role: EUserRole):
    '''
    return security level in int type, possible to be changed in the future
    '''
    max_lvl = 999999
    return max_lvl - user_role.value

def user_accessible(required_role: EUserRole, user_role: EUserRole):
    '''
    check user security level and access.
    return True Or False
    '''
    return get_security_lvl(user_role) >= get_security_lvl(required_role)