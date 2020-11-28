import { serverAxios as axios } from './config';
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

function getUsersOnDatasetAPI(datasetId, params) {
  return axios({
    url: `/v1/datasets/${datasetId}/users`,
    params: objectKeysToSnakeCase(params),
  });
}

function getUserOnProjectAPI(datasetId, data) {
  return axios({
    url: `/v1/datasets/${datasetId}/users/query`,
    method: 'POST',
    data: objectKeysToSnakeCase(data),
  });
}

/**
 * check if user exist in key cloak
 * @param {string} username
 */
function checkIsUserExistAPI(username, code) {
  return axios({
    url: `/users/name`,
    method: 'GET',
    params: { realm: 'vre', username: username, invite_code: code },
  });
}

/**
 * Check if email exit in neo4j
 *
 * @param {string} email
 * @param {int} containerId
 * @returns username/error
 */
function checkEmailExistAPI(email, datasetId) {
  return axios({
    url: `/v1/datasets/${datasetId}/users/email`,
    params: { email, realm: 'vre' },
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
function UserSelfRegistrationAPI(params) {
  return axios({
    url: `/v1/users/new`,
    method: 'post',
    data: objectKeysToSnakeCase(params),
  });
}

/**
 *
 * @param {object} data
 */
function contactUsApi(data) {
  return axios({
    url: '/v1/contact',
    method: 'post',
    data,
  });
}

/* list admins under specific project
 * @param {string} datasetId
 */
function getAdminsOnDatasetAPI(datasetId) {
  return axios({
    url: `/v1/datasets/${datasetId}/admins`,
  });
}

function getPortalUsers(params) {
  return axios({
    url: `/v1/users/platform`,
    params: objectKeysToSnakeCase(params),
  });
}

function guacomoleAPI() {
  return axios({
    url: `/v1/helloworld/test_gua`,
  });
}

function checkUserPlatformRole(email) {
  return axios({
    url: `/v1/invitation/check/${email}`,
    method: 'GET',
  });
}

/**
 * Get all the projects this user belongs to
 *
 * @param {*} username string
 * @returns
 */
function getUserProjectListAPI(username) {
  return axios({
    url: `/v1/users/${username}/datasets`,
    method: 'GET',
  });
}

/**
 * Set user status in the platform users page
 *
 * @param {object} data {id, email, status: action}
 * @returns
 */
function updateUserStatusAPI(data) {
  return axios({
    url: `/v1/users/action`,
    method: 'PUT',
    data,
  });
}

/**
 * get all the invitations on the platform
 *
 * @returns
 */
function getInvitationsAPI(params) {
  return axios({
    url: `/v1/invitation-list`,
    method: 'POST',
    data: objectKeysToSnakeCase(params),
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
  contactUsApi,
  getAdminsOnDatasetAPI,
  getPortalUsers,
  getUserOnProjectAPI,
  guacomoleAPI,
  checkUserPlatformRole,
  getUserProjectListAPI,
  updateUserStatusAPI,
  getInvitationsAPI,
};
