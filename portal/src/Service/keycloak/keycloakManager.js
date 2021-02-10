import { keycloak } from './config';
import moment from 'moment';
import _ from 'lodash';
import { v4 as uuidv4 } from 'uuid';
import { Modal } from 'antd';
import { resetReduxState } from '../../Utility';
import { Cookies } from 'react-cookie';
import { namespace as serviceNamespace } from '../namespace';

class KeycloakManager {
  listeners;
  constructor() {
    this.listeners = [];
    setInterval(() => {
      this._traverseListeners();
    }, 1000);
  }

  getRefreshRemainTime() {
    const remainTime =
      keycloak.refreshTokenParsed?.exp - (moment().unix() - keycloak.timeSkew);
    return isNaN(remainTime) ? -1 : remainTime;
  }

  checkSession() {
    const isSessionOn = this.getRefreshRemainTime() >= 0;
    return isSessionOn;
  }

  getAccessRemainTime() {
    const remainTime =
      keycloak.tokenParsed?.exp - (moment().unix() - keycloak.timeSkew);
    return isNaN(remainTime) ? -1 : remainTime;
  }

  /**
   * execute all listener functions in this.listener
   */
  _traverseListeners() {
    const timeRemain = this.getRefreshRemainTime();
    this.listeners.forEach((item) => {
      const { func, condition } = item;
      if (condition(timeRemain)) {
        func();
      }
    });
  }

  /**
   * do func() when condition can return a true with ${time}
   * @param {{func:()=>void,condition?:(timeRemain:number)=>boolean}} listener if condition is not specified, only return true when time === timeRemain
   * @returns {string} the id to cancel the listener, by calling tokenManager.removeListener(listenerId)
   */
  addListener(listener) {
    const listenerId = uuidv4();
    const { func, condition = (timeRemain) => false } = listener;
    if (!_.isFunction(func)) {
      throw new Error('the listener.func should be a function');
    }
    if (condition && !_.isFunction(condition)) {
      throw new Error('the listener.condition should be a function');
    }
    this.listeners.push({ func, condition, listenerId });
    return listenerId;
  }

  /**
   * remove a listener function from the token timeline
   * @param {string} listenerId the uuid of the listener function
   */
  removeListener(listenerId) {
    if (typeof listenerId !== 'string') {
      throw new Error('the listenerId should be an string');
    }
    _.remove(this.listeners, (item) => item.listenerId === listenerId);
  }

  /**
   * clear all cookies
   */
  clearCookies() {
    const cookies = new Cookies();
    Object.keys(cookies.getAll()).forEach((key) => {
      cookies.remove(key, { path: '/' });
    });
  }

  logout(namespace, shouldClearCookie = true, shouldClearUsername = true) {
    if (!Object.values(serviceNamespace.userAuthLogout).includes(namespace)) {
      throw new Error(`the namespace is not defined on userAuth namepace file`);
    }
    if (shouldClearCookie) this.clearCookies();
    resetReduxState(shouldClearUsername);
    keycloak.logout({ redirectUri: '/vre/' }).then((res) => {});
    Modal.destroyAll();
  }
}

const keycloakManager = new KeycloakManager();
export { keycloakManager };
