import axios from 'axios';
import { message } from 'antd';
import _ from 'lodash';
import { clearCookies } from '../Utility';
import { logout } from '../Utility';
import Cookies from 'universal-cookie';
const cookies = new Cookies();

// Function to returns the value of a specified cookie
function getCookie(cname) {
  var name = cname + '=';
  var decodedCookie = decodeURIComponent(document.cookie);
  var ca = decodedCookie.split(';');
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return undefined;
}

function deleteAllCookies() {
  var cookies = document.cookie.split(';');

  for (var i = 0; i < cookies.length; i++) {
    var cookie = cookies[i];
    var eqPos = cookie.indexOf('=');
    var name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
    document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT';
  }
}

/**
 * For axios to handle the success response
 * @param {*} response
 */
function successHandler(response) {
  return response;
}

function errorHandler(error) {
  if (error.response) {
    const { data, status } = error.response;

    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    const {
      response: {
        config: { baseURL, url },
      },
    } = error;
    console.log(status);
    switch (status) {
      case 401: {
        console.log('???', window.location.pathname);
        if (data.result === 'Permission Denied') {
          message.warning('User permission denied.');
        } else if (
          window.location.pathname !== '/vre' &&
          window.location.pathname !== '/vre/'
        ) {
          message.error(
            'The session is expired or token is invalid. Please log in again',
          );
          console.log('logout in config.js since 401')
          logout(cookies.get('username'));
        }

        break;
      }
    }
  } else if (error.request) {
    /*  console.log("TCL: handleApiFailure -> error.request", error.request);
    // The request was made but no response was received
    // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
    // http.ClientRequest in node.js
    message.error("Error network: cannot receive a response");
 */
    if (error.request.status === 0) {
    }
  } else {
    // The request has no response nor request -
    // Something happened in setting up the request that triggered an Error
    console.log('handleApiFailure -> error', error);

    // If caused by axios canceltoken, it will have an error message.
    if (error.message) {
      message.error('the request has been cancelled');
    } else {
      // Else, print the vague message.
      message.error('Error Network: please check your network connection');
    }
  }
  return new Promise((resolve, reject) => reject(error));
}

// Fetch token from cookies
const token = getCookie('access_token');
// console.log("token", token);
const refreshToken = getCookie('refresh_token');

// Axios request basic settings
// const localhost = 'http://0.0.0.0:5060';
// Test config
// const server = 'http://bff.utility:5060';

console.log('process.env.REACT_APP_ENV', process.env.REACT_APP_ENV);
// for dev env
let kongAPI = 'http://10.3.7.220/vre/api/vre/portal';
let devOpServerUrl = 'http://10.3.7.220/vre/api/vre/portal/dataops';

// for staging env
if (process.env.REACT_APP_ENV === 'staging') {
  kongAPI = 'https://nx.indocresearch.org/vre/api/vre/portal';
  devOpServerUrl = 'https://nx.indocresearch.org/vre/api/vre/portal/dataops';
}

const authService = 'http://authn.utility:5061';
const serverAxios = axios.create({
  baseURL: kongAPI,
});

// serverAxios.defaults.withCredentials = true;
serverAxios.defaults.headers.post['Content-Type'] = 'application/json';
serverAxios.defaults.timeout = 10000;

if (token) {
  serverAxios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}
const CancelToken = axios.CancelToken;

//Adding a interceptor to axios, so it handles expire issue before .then and .error
serverAxios.interceptors.response.use(successHandler, errorHandler);

/**
 * executes the api calling function
 * and returns both the cancel object of the axios call and the promise.
 * you can cancel this API request by calling source.cancel()
 * @param {function} requestFunction the
 * @param {*} arg other payloads of the request function
 * @returns   request: the axios result, source: the axios cancellation object
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

const devOpServer = axios.create({ baseURL: devOpServerUrl });
// devOpServer.defaults.withCredentials = true;
devOpServer.defaults.headers.post['Content-Type'] = 'application/json';
devOpServer.defaults.timeout = 100000000000;
if (token) {
  devOpServer.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

//Adding a interceptor to axios, so it handles expire issue before .then and .error
devOpServer.interceptors.response.use(successHandler, errorHandler);

// devOpServer.defaults.withCredentials = true;

const authServerAxios = axios.create({ baseURL: authService });
// authServerAxios.defaults.withCredentials = true;
authServerAxios.defaults.headers.post['Content-Type'] = 'application/json';
authServerAxios.defaults.timeout = 10000;
if (token) {
  authServerAxios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

//Adding a interceptor to axios, so it handles expire issue before .then and .error
//authServerAxios.interceptors.response.use(successHandler, errorHandler);

const invitationAxios = axios.create({ baseURL: 'http://bff.utility:5060' });
// authServerAxios.defaults.withCredentials = true;
invitationAxios.defaults.headers.post['Content-Type'] = 'application/json';
invitationAxios.defaults.timeout = 10000;
if (token) {
  invitationAxios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}


export {
  serverAxios,
  tempAxios,
  cancelRequestReg,
  devOpServer,
  authServerAxios,
  invitationAxios,
  devOpServerUrl,
};
