import { userLogoutCreator, setRefreshModal, setUploadListCreator, setIsLoginCreator, setUsernameCreator } from '../../Redux/actions'
import { store } from '../../Redux/store'
import { q } from '../../Context';
import { history } from '../../Routes';
import { tokenManager } from '../tokenManager';
import { keycloakManager } from '../keycloak'
import { activeManager } from '../activeManager'
import { reduxActionWrapper, resetReduxState } from '../../Utility';
import { broadcastManager } from '../broadcastManager';
import { namespace } from '../namespace';
import { refreshTokenAPI } from '../../APIs'
import { namespace as serviceNamespace } from '../namespace';
import { keycloak } from '../keycloak'
import { message, Modal } from 'antd';
const [userLogoutDispatcher, setRefreshModalDispatcher, setUploadListDispatcher, setIsLoginDispatcher, setUsernameDispatcher] = reduxActionWrapper([userLogoutCreator, setRefreshModal, setUploadListCreator, setIsLoginCreator, setUsernameCreator]);
const modalTime = 60;
class UserAuthManager {
    openRefreshModalId;
    closeRefreshModalId;
    expirationId
    constructor() {
        keycloak.onAuthRefreshSuccess = () => {

        }
    };
    /**
     * init refresh modal listener, broadcast listener, token expiration, autoRefreshMonitor to monitor the uploading process.
     * @returns {boolean} if the token is valid or not
     */
    init() {
        this.initRefreshModal();
        this.initExpirationLogout();
        this.listenToBroadcast();
        this.autoRefreshMonitor();
        tokenManager.refreshToken();
    }

    initRefreshModal() {
        const time = modalTime; // the time to show the refresh modal
        this.openRefreshModalId = tokenManager.addListener({ time, func: () => { const { isLogin } = store.getState(); if (isLogin) setRefreshModalDispatcher(true); }, condition: (timeRemain, time) => { return (timeRemain < time && tokenManager.checkTokenUnExpiration()) } });
        this.closeRefreshModalId = tokenManager.addListener({ time, func: () => { const { refreshTokenModal } = store.getState(); if (refreshTokenModal) setRefreshModalDispatcher(false) }, condition: (timeRemain, time) => timeRemain > time || !tokenManager.checkTokenUnExpiration() });
    }
    /**
     * if remain time is 0, logout
     */
    initExpirationLogout() {
        const time = 0;
        const condition = (timeRemain, time) => (timeRemain < time);
        const func = () => { const { isLogin } = store.getState(); if (isLogin) this.logout(namespace.userAuthLogout.TOKEN_EXPIRATION) };
        this.expirationId = tokenManager.addListener({ time, func, condition });
    }

    /**
     * push to interval, if the time remained is less than 2 mins and the queue has upload task, auto refresh, and broadcast
     */
    autoRefreshMonitor() {
        const time = 60 //refresh every 60 seconds 
        const func = () => {
            let { downloadList } = store.getState();
            downloadList = downloadList.filter(el => el.status === 'pending');
            const tasks = q.length() + q.running() + downloadList.length;
            console.log(tasks, 'tasks')
            if (tasks !== 0 || activeManager.isActive()) {
                const { username } = store.getState();
                this.extendAuth().then(res => {
                    broadcastManager.postMessage('refresh', serviceNamespace.broadCast.AUTO_REFRESH, username);
                }).catch(err => {
                    console.log(err, 'failed to extend token');
                });
            }
        }
        const condition = (timeRemain, time) => {
            return tokenManager.checkTokenUnExpiration() && timeRemain % time === 0 && timeRemain !== tokenManager.getMaxTime();
        }
        tokenManager.addListener({ time, func, condition });
    }

    /**
     * listen to broadcast login, logout, refresh
     */
    listenToBroadcast() {
        broadcastManager.addListener('logout', (msg, channelNamespace) => {
            this.logout(namespace.userAuthLogout.RECEIVED_LOGOUT)
        })
        broadcastManager.addListener('login', (msg, channelNamespace) => {

            const { isLogin, username } = store.getState();
            console.log(username, 'username')
            console.log(msg, '  msg')
            if (!isLogin) {
                return;
            } else if (msg === username) {
                tokenManager.refreshToken();
                return;
            } else {
                this.logout(namespace.userAuthLogout.RECEIVED_LOGIN, false, false);
            }
        })
        broadcastManager.addListener('refresh', (msg, channelNamespace) => {
            const { isLogin, username } = store.getState();
            if (!isLogin) {
                return;
            } else if (msg === username) {
                tokenManager.refreshToken();
                return;
            }
        })
    }

    /**
     * update the access token and refresh token via keycloak.js, from keycloak react-app client
     */
    extendAuth() {
        const oldToken = keycloak.token;
        return new Promise((resolve, reject) => {
            keycloak.updateToken(-1).then(function (refreshed) {
                if (refreshed) {
                    const accessToken = keycloak.token;
                    const refreshToken = keycloak.refreshToken;
                    tokenManager.setCookies({ 'access_token': accessToken, 'refresh_token': refreshToken });
                    tokenManager.setTimeSkew(accessToken);
                    tokenManager.refreshToken(accessToken);
                    console.assert(oldToken !== accessToken)
                    resolve({
                        accessToken,
                        refreshToken
                    });
                } else {
                    message.error('failed to refresh token');
                    reject('failed to refresh token')
                }
            }).catch(function () {
                message.error('Failed to refresh the token, or the session has expired');
                reject('Failed to refresh the token, or the session has expired');
            });
        })
    }

    /**
     * 
     * @param {string} namespace the unique namespace
     * @param {boolean} shouldClearCookie if true, clean the cookie. only if login different account in another tab will set this false;
     * @param {boolean} shouldClearUsername if true, clean the username. by default true. only if login different account in another tab will set this false;
     */
    logout(namespace, shouldClearCookie = true, shouldClearUsername = true) {
        const { clearId } = store.getState();
        if (!Object.values(serviceNamespace.userAuthLogout).includes(namespace)) {
            throw new Error(`the namespace is not defined on userAuth namepace file`);
        }
        keycloakManager.removeListener(clearId);
        q.kill();
        if (shouldClearCookie) keycloakManager.clearCookies();
        resetReduxState(shouldClearUsername);
        keycloak.logout().then(res => {
        });
        //history.push('/');
        Modal.destroyAll();
    }
}

const userAuthManager = new UserAuthManager();
export default userAuthManager;