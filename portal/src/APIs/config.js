import axios from 'axios';
import { message } from 'antd';
import _ from 'lodash';
import camelcaseKeys from 'camelcase-keys';
import { activeManager } from '../Service/activeManager';
import { keycloak } from '../Service/keycloak';

/**
 * For axios to handle the success response
 * @param {AxiosResponse} response
 */
function successHandler(response) {
  const url = _.get(response, 'config.url');
  if (url && url !== '/users/refresh') {
    activeManager.activate();
  }
  return camelcaseKeys(response, { deep: true });
}

const useHeader = (item) => {
  item.interceptors.request.use((request) => {
    request.headers['Authorization'] = 'Bearer ' + keycloak.token;
    return request;
  });
};

/**
 *
 * @param {AxiosError} error
 */
function errorHandler(error) {
  if (error.response) {
    const { data, status } = error.response;

    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx

    switch (status) {
      case 401: {
        if (data.result === 'Permission Denied') {
          message.warning('User permission denied.');
        } else if (window.location.pathname !== '/vre/') {
          console.log('logout in config.js since 401');
        }

        break;
      }
      default: {
      }
    }
  } else if (error.request) {
    if (error.request.status === 0) {
    }
  } else {
    // If caused by axios canceltoken, it will have an error message.
    if (error.message) {
      message.error(error.message || 'The request has been cancelled');
    } else {
      // Else, print the vague message.
      message.error('Error Network: please check your network connection');
    }
  }
  return new Promise((resolve, reject) => reject(error));
}

let kongAPI = 'http://10.3.7.220/vre/api/vre/portal';
let devOpServerUrl = 'http://10.3.7.220/vre/api/vre/portal/dataops';
// let devOpServerUrl = 'http://10.3.7.234:5063';

// for staging env
if (process.env.REACT_APP_ENV === 'staging') {
  kongAPI = 'https://vre-staging.indocresearch.org/vre/api/vre/portal';
  devOpServerUrl =
    'https://vre-staging.indocresearch.org/vre/api/vre/portal/dataops';
}

// for charite env
if (process.env.REACT_APP_ENV === 'charite') {
  kongAPI = 'https://vre.charite.de/vre/api/vre/portal';
  devOpServerUrl = 'https://vre.charite.de/vre/api/vre/portal/dataops';
}

const authService = 'http://auth.utility:5061';
const serverAxios = axios.create({
  baseURL: kongAPI,
});

// serverAxios.defaults.withCredentials = true;
serverAxios.defaults.headers.post['Content-Type'] = 'application/json';
serverAxios.defaults.timeout = 10000;

const CancelToken = axios.CancelToken;

//Adding a interceptor to axios, so it handles expire issue before .then and .error
serverAxios.interceptors.response.use(successHandler, errorHandler);
useHeader(serverAxios);

const serverAxiosNoIntercept = axios.create({
  baseURL: kongAPI,
});
serverAxiosNoIntercept.defaults.headers.post['Content-Type'] =
  'application/json';
serverAxiosNoIntercept.defaults.timeout = 10000;
useHeader(serverAxiosNoIntercept);
/**
 * executes the api calling function
 * and returns both the cancel object of the axios call and the promise.
 * you can cancel this API request by calling source.cancel()
 * @param {(...arg)=>AxiosPromise<any>} requestFunction the api function that return.
 * @param {any[]} arg other payloads of the request function
 * @returns {{request:(...arg:any[],source:CancelTokenSource)=>AxiosPromise<any>,source:CancelTokenSource}}   request: the axios result, source: the axios cancellation object
 */
function cancelRequestReg(requestFunction, ...arg) {
  const source = CancelToken.source();
  return {
    request: requestFunction(...arg, source.token),
    source,
  };
}

const tempAxios = axios.create({
  baseURL: 'http://10.3.1.120:6061/',
});
tempAxios.defaults.withCredentials = true;
tempAxios.defaults.headers.post['Content-Type'] = 'application/json';
tempAxios.defaults.timeout = 5000;
//Adding a interceptor to axios, so it handles expire issue before .then and .error
tempAxios.interceptors.response.use(successHandler, errorHandler);
useHeader(tempAxios);

const devOpServer = axios.create({ baseURL: devOpServerUrl });
// devOpServer.defaults.withCredentials = true;
devOpServer.defaults.headers.post['Content-Type'] = 'application/json';
devOpServer.defaults.timeout = 100000000000;

//Adding a interceptor to axios, so it handles expire issue before .then and .error
devOpServer.interceptors.response.use(successHandler, errorHandler);
useHeader(devOpServer);

// devOpServer.defaults.withCredentials = true;

const authServerAxios = axios.create({ baseURL: authService });
// authServerAxios.defaults.withCredentials = true;
authServerAxios.defaults.headers.post['Content-Type'] = 'application/json';
authServerAxios.defaults.timeout = 10000;
useHeader(authServerAxios);

//Adding a interceptor to axios, so it handles expire issue before .then and .error
//authServerAxios.interceptors.response.use(successHandler, errorHandler);

const invitationAxios = axios.create({ baseURL: 'http://bff.utility:5060' });
// authServerAxios.defaults.withCredentials = true;
invitationAxios.defaults.headers.post['Content-Type'] = 'application/json';
invitationAxios.defaults.timeout = 10000;
useHeader(invitationAxios);

export {
  axios,
  serverAxios,
  cancelRequestReg,
  devOpServer,
  authServerAxios,
  invitationAxios,
  devOpServerUrl,
  serverAxiosNoIntercept,
  kongAPI,
};
