import { keycloakManager, keycloak } from '../Service/keycloak';
import { store } from '../Redux/store';
import { Modal } from 'antd';
import { resetReduxState } from './resetReduxState';
import { broadcastManager } from '../Service/broadcastManager';
import { namespace as serviceNamespace } from '../Service/namespace';
import _ from 'lodash';
const debouncedBroadcastLogout = _.debounce(() => {
    broadcastManager.postMessage('logout', serviceNamespace.broadCast.LOGOUT);
}, 5 * 1000, { leading: true, trailing: false })

function preLogout(shouldClearCookie = true, shouldClearUsername = true) {
    const { clearId } = store.getState();
    keycloakManager.removeListener(clearId);
    if (shouldClearCookie) keycloakManager.clearCookies();
    resetReduxState(shouldClearUsername);
    Modal.destroyAll();
    localStorage.removeItem('sessionId');
    debouncedBroadcastLogout();
}
function logout(shouldClearCookie = true, shouldClearUsername = true) {
    preLogout(shouldClearCookie, shouldClearUsername)
    keycloak.logout({redirectUri: window.location.origin +'/vre'}).then(res => {
    });
};

export { preLogout, logout };