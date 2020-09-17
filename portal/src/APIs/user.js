import {
  serverAxios as axios,
  authServerAxios,
  invitationAxios,
} from './config';
import { objectKeysToSnakeCase } from '../Utility';

function getAllUsersAPI() {
  return axios({
    url: '/v1/users/platform',
  });
}

function createUserAPI(data) {
  return axios({
    url: '/v1/users/platform',
    method: 'post',
    data,
  });
}

function getUsersOnDatasetAPI(datasetId) {
  return axios({
    url: `/v1/datasets/${datasetId}/users`,
  });
}

/**
 * check if user exist in key cloak
 * @param {string} username
 */
function checkIsUserExistAPI(username) {
  return axios({
    url: `/v1/admin/users/name`,
    method: 'GET',
    params: { realm: 'vre', username: username },
  });
}

/**
 * Archived: check if email exist in key cloak
 *
 * @param {*} email
 * @returns
 */
function checkEmailExistAPI0(email) {
  return axios({
    url: `/v1/admin/getuserbyemailinternal`,
    data: { email, realm: 'vre' },
    method: 'post',
  });
}

/**
 * Check if email exit in neo4j
 *
 * @param {string} email
 * @param {int} container_id
 * @returns username/error
 */
function checkEmailExistAPI(email, container_id) {
  return axios({
    url: `/v1/admin/users/email`,
    params: { email, container_id },
    method: 'GET',
  });
}

/**
 *
 * @param {string} email
 * @param {string} role
 * @param {number} projectId
 */
function inviteUserApi(email, role, projectId) {
  return axios({
    url: '/v1/invitations',
    method: 'post',
    data: { email, role, projectId },
  });
}

/**
 * parse the invitation hash from the invitation email link
 * @param {string} hash
 */
function parseInviteHashAPI(hash) {
  return axios({
    url: `/v1/invitation/${hash}`,
  });
}

/**
 * User self registration
 * vre-205
 * @param {string} username
 * @param {string} password
 * @param {string} email
 * @param {string} role
 * @param {string} projectId
 * @param {string} hash
 */
function UserSelfRegistrationAPI({
  username,
  password,
  email,
  firstName,
  lastName,
  role,
  projectId,
  token,
}) {
  return axios({
    url: `/v1/users/new`,
    method: 'post',
    data: objectKeysToSnakeCase({
      username,
      password,
      email,
      firstName,
      lastName,
      role,
      projectId,
      token,
    }),
  });
}

export {
  getAllUsersAPI,
  createUserAPI,
  getUsersOnDatasetAPI,
  checkIsUserExistAPI,
  checkEmailExistAPI,
  inviteUserApi,
  parseInviteHashAPI,
  UserSelfRegistrationAPI,
};
