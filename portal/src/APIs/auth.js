import { serverAxios as axios } from './config';

function login(data) {
  return axios({
    url: '/users/auth',
    method: 'POST',
    data: { ...data, realm: 'testrealms' },
  });
}

function refreshTokenAPI(data) {
  return axios({
    url: '/users/refresh',
    method: 'POST',
    data: { ...data, realm: 'testrealms' },
  });
}

function resetPasswordAPI(data) {
  return axios({
    url: '/users/password',
    method: 'PUT',
    data: { ...data, realm: 'testrealms' },
  });
}

export { login, refreshTokenAPI, resetPasswordAPI };
