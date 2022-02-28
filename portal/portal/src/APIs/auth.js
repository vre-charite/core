import { KEYCLOAK_REALM } from '../config';
import { serverAxios as axios } from './config';

function login(data) {
  return axios({
    url: '/users/auth',
    method: 'POST',
    data: { ...data, realm: KEYCLOAK_REALM },
  });
}

function refreshTokenAPI(data) {
  return axios({
    url: '/users/refresh',
    method: 'POST',
    data: { ...data, realm: KEYCLOAK_REALM },
  });
}

function resetPasswordAPI(data) {
  return axios({
    url: '/users/password',
    method: 'PUT',
    data: { ...data, realm: KEYCLOAK_REALM },
  });
}

/* send reset password email to user
 * @param {string} username
 */
function sendResetPasswordEmailAPI(username, cancelToken) {
  return axios({
    url: '/users/reset/send-email',
    method: 'POST',
    data: { ...username, realm: KEYCLOAK_REALM },
    cancelToken,
  });
}

/* send username through email
 * @param {string} email
 */
function sendUsernameEmailAPI(email, cancelToken) {
  return axios({
    url: '/users/reset/send-username',
    method: 'POST',
    data: { ...email, realm: KEYCLOAK_REALM },
    cancelToken,
  });
}

/* Update password
 * @param {object} data: should include token, password, password_confirm
 */
function resetForgottenPasswordAPI(data, cancelToken) {
  return axios({
    url: '/users/reset/password',
    method: 'POST',
    data: { ...data, realm: KEYCLOAK_REALM },
    cancelToken,
  });
}

/* Check reset token
 * @param {string} token
 */
function checkTokenAPI(token) {
  return axios({
    url: `/users/reset/check-token?token=${token}&realm=${KEYCLOAK_REALM}`,
    method: 'GET',
  });
}

function lastLoginAPI(username) {
  return axios({
    url: '/v1/users/lastlogin',
    method: 'POST',
    data: {
      username,
    },
  });
}

export {
  login,
  refreshTokenAPI,
  resetPasswordAPI,
  sendResetPasswordEmailAPI,
  sendUsernameEmailAPI,
  resetForgottenPasswordAPI,
  checkTokenAPI,
  lastLoginAPI,
};
