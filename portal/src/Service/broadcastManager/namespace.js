// Copyright 2022 Indoc Research
// 
// Licensed under the EUPL, Version 1.2 or – as soon they
// will be approved by the European Commission - subsequent
// versions of the EUPL (the "Licence");
// You may not use this work except in compliance with the
// Licence.
// You may obtain a copy of the Licence at:
// 
// https://joinup.ec.europa.eu/collection/eupl/eupl-text-eupl-12
// 
// Unless required by applicable law or agreed to in
// writing, software distributed under the Licence is
// distributed on an "AS IS" basis,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
// express or implied.
// See the Licence for the specific language governing
// permissions and limitations under the Licence.
// 

const broadCast = {
    "USER_CLICK_LOGIN": "USER_CLICK_LOGIN",
    "CLICK_HEADER_LOGOUT": "CLICK_HEADER_LOGOUT",
    'CLICK_REFRESH_MODAL': 'CLICK_REFRESH_MODAL',
    "AUTO_REFRESH": 'AUTO_REFRESH',
    "REFRESH_MODAL_LOGOUT": "REFRESH_MODAL_LOGOUT",
    "ONACTION": "ONACTION",
    "LOGOUT": "LOGOUT"
}

Object.entries(broadCast).forEach(([key, value]) => {
    broadCast[key] = "BROADCAST_" + value;
});

export { broadCast };