import jwt_decode from 'jwt-decode';
import moment from 'moment';
import logout from './logout/logout';

import {
  serverAxios,
  devOpServer,
  invitationAxios,
  authServerAxios,
} from "../APIs/config";

/* This function is to update access token and refresh token
    in all Axios request header 
*/
function headerUpdate(access_token, refresh_token) {
  serverAxios.defaults.headers.common[
    "Authorization"
  ] = `Bearer ${access_token}`;
  devOpServer.defaults.headers.common[
    "Authorization"
  ] = `Bearer ${access_token}`;
  invitationAxios.defaults.headers.common[
    "Authorization"
  ] = `Bearer ${access_token}`;
  authServerAxios.defaults.headers.common[
    "Authorization"
  ] = `Bearer ${access_token}`;
}

function clearCookies() {
  const cookies = document.cookie.split(";");
  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i];
    const eqPos = cookie.indexOf("=");
    const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
    document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
  }
}

function checkToken(token) {
  if (token) {
    var exp = jwt_decode(token).exp;
    const diff = exp - moment().unix() < 59; // expired after 1 min

    if (diff) {
      logout();
    }
  }
}

function validateEmail(email) {
  const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}

export { headerUpdate, clearCookies, checkToken, validateEmail };
