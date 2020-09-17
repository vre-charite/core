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

function checkToken(token,setRefreshModal) {
  if (token) {
    var exp = jwt_decode(token).exp;
    const diff = exp - moment().unix() < 59 ; // expired 

    if (diff) {
      console.log('logout in tokenRefresh.js, diff')
      setRefreshModal(true);
      //logout();
    }
  }
}

function isTokenExpired(token){
  if(!token){
    return true;
  }
  const exp = jwt_decode(token).exp;
  const diff = exp - moment().unix();
  if(diff<=0){
    return true;
  }
  return false;
}

function validateEmail(email) {
  const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}

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

export { headerUpdate, clearCookies, checkToken, validateEmail, isTokenExpired, getCookie };
