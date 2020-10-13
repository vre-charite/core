import { userLogoutCreator, setRefreshModal, setUploadListCreator, setIsLoginCreator, setUsernameCreator } from '../../Redux/actions'
import { store } from '../../Redux/store'
import { q } from '../../Context';
import { history } from '../../Routes';
import { tokenManager } from '../tokenManager';
import {activeManager} from '../activeManager'
import { reduxActionWrapper, resetReduxState } from '../../Utility';
import { broadcastManager } from '../broadcastManager';
import { namespace } from '../namespace';
import { refreshTokenAPI } from '../../APIs'
import { namespace as serviceNamespace } from '../namespace'
const [userLogoutDispatcher, setRefreshModalDispatcher, setUploadListDispatcher, setIsLoginDispatcher, setUsernameDispatcher] = reduxActionWrapper([userLogoutCreator, setRefreshModal, setUploadListCreator, setIsLoginCreator, setUsernameCreator]);
const modalTime = 60;
class UserAuthManager {
    openRefreshModalId;
    closeRefreshModalId;
    expirationId
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
            const { downloadList } = store.getState();
            const tasks = q.length() + q.running() + downloadList.length;
            console.log(tasks, 'tasks')
            if (tasks !== 0||activeManager.isActive()) {
                const { username } = store.getState();
                this.extendAuth().then(res => {
                    broadcastManager.postMessage('refresh', serviceNamespace.broadCast.AUTO_REFRESH, username);
                }).catch(err=>{
                    console.log(err,'failed to extend token');
                });
            }
        }
        const condition = (timeRemain, time) => {
            return tokenManager.checkTokenUnExpiration() && timeRemain%time===0&&timeRemain!==tokenManager.getMaxTime();
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
                this.logout(namespace.userAuthLogout.RECEIVED_LOGIN,false,false);
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
     * get a new access token and refresh token from the backend. extend the auth by refreshing the refresh_token and access_token from the backend. May be called when q is uploading files or user click on the refresh button on the modal
     */
    async extendAuth() {
        const refreshTokenOld = tokenManager.getCookie('refresh_token');
        const res = await refreshTokenAPI({ refreshtoken: refreshTokenOld })
        const { accessToken, refreshToken } = res.data.result;
        tokenManager.setCookies({ 'access_token': accessToken, 'refresh_token': refreshToken });
        tokenManager.refreshToken(accessToken);
        return res;
    }
     
    /**
     * 
     * @param {string} namespace the unique namespace
     * @param {boolean} shouldClearCookie if true, clean the cookie. only if login different account in another tab will set this false;
     * @param {boolean} shouldClearUsername if true, clean the username. by default true. only if login different account in another tab will set this false;
     */
    logout(namespace,shouldClearCookie=true,shouldClearUsername=true) {
        const {clearId} = store.getState();
        if (!Object.values(serviceNamespace.userAuthLogout).includes(namespace)) {
            throw new Error(`the namespace is not defined on userAuth namepace file`);
        }
        console.log(namespace, 'namespace of logout');
        tokenManager.removeListener(clearId);
        q.kill();
        if(shouldClearCookie)tokenManager.clearCookies();
        resetReduxState(shouldClearUsername);
        tokenManager.refreshToken('no token');
        history.push('/');
    }
}

const userAuthManager = new UserAuthManager();
export default userAuthManager;