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

import { tokenTimer } from '../../Service/keycloak';
import { store } from '../../Redux/store';
import { Modal } from 'antd';
import _ from 'lodash';
import { keycloak } from '../../Service/keycloak';
import { namespace as serviceNamespace } from '../../Service/namespace';
import { broadcastManager } from '../../Service/broadcastManager';
import { tokenManager } from '../../Service/tokenManager';
import { BRANDING_PREFIX } from '../../config';

const debouncedBroadcastLogout = _.debounce(
  () => {
    broadcastManager.postMessage('logout', serviceNamespace.broadCast.LOGOUT);
  },
  5 * 1000,
  { leading: true, trailing: false },
);

// for logging out keycloak only
function logout() {
  // const { clearId } = store.getState();
  // tokenTimer.removeListener(clearId);
  Modal.destroyAll();
  tokenManager.clearCookies();
  debouncedBroadcastLogout();
  return keycloak
    .logout({ redirectUri: window.location.origin + BRANDING_PREFIX })
    .then((res) => {});
}

function refresh() {
  return keycloak.updateToken(-1);
}
function login() {
  return keycloak.login();
}

export { logout, refresh, login };
