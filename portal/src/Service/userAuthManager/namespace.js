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

const userAuthLogout = {
  RECEIVED_LOGOUT: 'RECEIVED_LOGOUT',
  RECEIVED_LOGIN: 'RECEIVED_LOGIN',
  TOKEN_EXPIRATION: 'TOKEN_EXPIRATION',
  LOGOUT_REFRESH_MODAL:'LOGOUT_REFRESH_MODAL',
  LOGOUT_HEADER:'LOGOUT_HEADER',
  KEYCLOAK_LOGOUT:"KEYCLOAK_LOGOUT",
  LOADING_TIMEOUT:"LOADING_TIMEOUT",
};

Object.entries(userAuthLogout).forEach(([key, value]) => {
  userAuthLogout[key] = 'USER_AUTH_' + value;
});

export { userAuthLogout };
