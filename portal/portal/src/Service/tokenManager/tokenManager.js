import { Cookies } from 'react-cookie';
import { axios } from '../../APIs/config';
import jwtDecode from 'jwt-decode';
import moment from 'moment';
import _ from 'lodash';
import { v4 as uuidv4 } from 'uuid';

const largeDate = Infinity;
class TokenManager {
  cookies;
  setTimeId;
  listeners;
  constructor() {
    this.cookies = new Cookies();
    this.listeners = [];
    setInterval(() => {
      this._traverseListeners();
    }, 1000);
  }


  /**
   * get a cookie
   * @param {string} name the name of cookie
   * @returns {string|undefined} the cookie value
   */
  getCookie(name) {
    if (typeof name !== 'string') {
      throw new Error(`the name argument should be a string`);
    }
    return this.cookies.get(name);
  }
  /**
   * set cookies
   * @param {{access_token?:string,refresh_token?:string}} newCookies object of key:value
   */
  setCookies(newCookies) {
    Object.keys(newCookies).forEach((key) => {
      this.cookies.set(key, newCookies[key], { path: '/' });
    });
  }

  /**
   * refresh the token to the axios headers, by default read it from cookie
   * and set the token expiration time
   * @param {string?} accessToken the access token
   */
  refreshToken(accessToken) {
    accessToken = accessToken || this.getCookie('access_token');
    axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken
      }`;
    //this._traverseListeners();
  }

  /**
   * execute all listener functions in this.listener
   */
  _traverseListeners() {
    const timeRemain = this.getTokenTimeRemain();
    this.listeners.forEach((item) => {
      const { time, func, condition, params } = item;
      if (condition(timeRemain, time)) {
        func(...params);
      }
    });
  }

  /**
   * do func() when condition can return a true with ${time}
   * @param {{time:number,func:(...params:T)=>void,condition?:(timeRemain:number,time:number)=>boolean,params?:T[]}} listener if condition is not specified, only return true when time === timeRemain
   * @returns {string} the id to cancel the listener, by calling tokenManager.removeListener(listenerId)
   */
  addListener(listener) {
    const listenerId = uuidv4();
    const {
      time,
      func,
      condition = (timeRemain, time) => timeRemain === time,
      params = [],
    } = listener;
    if (typeof time !== 'number') {
      throw new Error('the time should be a number');
    }
    if (!_.isFunction(func)) {
      throw new Error('the listener.func should be a function');
    }
    if (condition && !_.isFunction(condition)) {
      throw new Error('the listener.condition should be a function');
    }
    if (params && !Array.isArray(params)) {
      throw new Error(
        `the params for func should be grouped into an array in order`,
      );
    }
    this.listeners.push({ time, func, condition, params, listenerId });
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
   * token will expire in $return seconds
   * @param {string?} token the access token
   * @returns {number} if -1, token is not valid
   */
  getTokenTimeRemain(token) {
    token = token || this.getCookie('access_token');
    if (!token) {
      return -largeDate;
    } else {
      const exp = jwtDecode(token).exp;
      return exp - (moment().unix() - this.getCookie('timeSkew'));
    }
  }

  /**
   * get the liftime
   */
  getMaxTime() {
    const token = this.getCookie('access_token');
    if (!token) {
      return -largeDate;
    } else {
      const time = jwtDecode(token).exp - jwtDecode(token).iat;
      return time;
    }
  };

  /**
   * set the time skew to the cookie. call this function when calling the refresh api function or login function
   * timeSkew is the difference of local time and the server time. server time = local time - time skew. 
   * timeSkew can be positive or negative
   * @param {string} accessToken the access token
   */
  setTimeSkew(accessToken) {
    const timeSkew = Math.floor(((new Date()).getTime()) / 1000) - jwtDecode(accessToken).iat;
    this.setCookies({timeSkew});
  }

  /**
   * clear all cookies
   */
  clearCookies() {
    Object.keys(this.cookies.getAll()).forEach((key) => {
      this.cookies.remove(key, { path: '/' });
    });
  }

  /**
   * if token still valid, return true;
   * @returns {boolean}
   */
  checkTokenUnExpiration() {
    const token = this.getCookie('access_token');

    if (token && this.getTokenTimeRemain() >= 0) {
      return true;
    } else {
      return false;
    }
  }
}

const tokenManager = new TokenManager();
export default tokenManager;
