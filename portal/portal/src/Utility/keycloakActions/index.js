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
