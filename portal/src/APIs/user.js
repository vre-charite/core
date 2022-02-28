import { serverAxios as axios } from './config';
import { objectKeysToSnakeCase } from '../Utility';
import userEmail from '../Redux/Reducers/userEmail';
import { KEYCLOAK_REALM } from '../config';

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

function getUsersOnDatasetAPI(projectGeid, params) {
  return axios({
    url: `/v1/containers/${projectGeid}/users`,
    params: objectKeysToSnakeCase(params),
  });
}

function getUserOnProjectAPI(projectGeid, data) {
  return axios({
    url: `/v1/containers/${projectGeid}/users/query`,
    method: 'POST',
    data: objectKeysToSnakeCase(data),
  });
}

function getPortalUsers(params) {
  return axios({
    url: `/v1/users/platform`,
    method: 'GET',
    params: objectKeysToSnakeCase(params),
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
    params: { realm: KEYCLOAK_REALM, username: username, invite_code: code },
  });
}

/**
 * Check if email exit in neo4j
 *
 * @param {string} email
 * @param {int} containerId
 * @returns username/error
 */

/**
 * invite a new user to platform, and to a specified project if available.
 * ticket-1343
 * @param {string} email
 * @param {"admin"|"member"} platformRole
 * @param {string|null} projectRole
 * @param {string|null} projectGeid the project geid
 * @param {boolean} inAd true if the user is already in AD but not in neo4j yet.
 * @returns
 */
function inviteUserApi(
  email,
  platformRole,
  projectRole,
  projectGeid,
  inviter,
  inAd,
  adUserDn,
) {
  const data = {
    email,
    platform_role: platformRole,
    ad_account_created: inAd,
    ad_user_dn: adUserDn,
  };
  if (projectGeid && projectRole && inviter) {
    const relationship = {
      project_geid: projectGeid,
      project_role: projectRole,
      inviter,
    };
    data['relationship'] = relationship;
  }
  return axios({
    url: '/v1/invitations',
    method: 'post',
    data,
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
    timeout: 100 * 1000,
  });
}

/* list admins under specific project
 * @param {string} datasetId
 */
function getAdminsOnDatasetAPI(projectGeid) {
  return axios({
    url: `/v1/containers/${projectGeid}/admins`,
  });
}

function guacomoleAPI() {
  return axios({
    url: `/v1/helloworld/test_gua`,
  });
}

function checkUserPlatformRole(email, projectGeid) {
  if (projectGeid) {
    return axios({
      url: `/v1/invitation/check/${email}`,
      method: 'GET',
      timeout: 5 * 60 * 1000,
      params: { project_geid: projectGeid },
    });
  }
  return axios({
    url: `/v1/invitation/check/${email}`,
    timeout: 5 * 60 * 1000,
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
    url: `/v1/users/${username}/containers`,
    method: 'POST',
    data: {
      is_all: true,
      order_by: 'time_created',
      order_type: 'desc',
    },
  });
}

/**
 * Set user status in the platform users page
 *
 * @param {object} data {id, email, status: action}
 * @returns
 */
function updateUserStatusAPI(params) {
  return axios({
    url: `v1/user/account`,
    method: 'PUT',
    timeout: 5 * 60 * 1000,
    data: {
      operation_type: params.operationType,
      realm: params.userRealm,
      user_geid: params.userGeid,
      user_email: params.userEmail,
      payload: params.payload,
    },
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

/**
 * ticket-1200
 * List or query on all resource requests.
 */
function getResourceRequestsAPI(params) {
  return axios({
    url: `/v1/resource-requests/query`,
    method: 'POST',
    data: objectKeysToSnakeCase(params),
  });
}

/**
 * ticket-1200
 * Create new resource request
 */
function createResourceRequestAPI(params) {
  return axios({
    url: `/v1/resource-requests`,
    method: 'POST',
    data: objectKeysToSnakeCase(params),
  });
}

/**
 * ticket-1200
 * Mark a request as completed
 */
function approveResourceRequestAPI(requestId) {
  return axios({
    url: `/v1/resource-request/${requestId}/complete`,
    method: 'PUT',
  });
}
function getUserstatusAPI() {
  return axios({
    url: `/v1/user/status`,
    method: 'GET',
  });
}

function changeUserStatusAPI(email, userName, familyName, givenName) {
  return axios({
    url: `/v1/users`,
    method: 'PUT',
    data: {
      email: email,
      username: userName,
      last_name: familyName,
      first_name: givenName,
    },
  });
}

export {
  getAllUsersAPI,
  createUserAPI,
  getUsersOnDatasetAPI,
  checkIsUserExistAPI,
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
  getResourceRequestsAPI,
  createResourceRequestAPI,
  approveResourceRequestAPI,
  getUserstatusAPI,
  changeUserStatusAPI,
};
