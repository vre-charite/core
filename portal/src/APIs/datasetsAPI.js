import { serverAxios, axios } from './config';

/**
 * Get all the datasets
 *
 * @returns dataset[]
 * @IRDP-432
 */
function getDatasetsAPI(params = {}) {
  return serverAxios({
    url: '/v1/datasets/',
    method: 'GET',
    params,
  });
}

// /**
//  * Create a dataset
//  *
//  * @param {object} data
//  * @returns success/fail
//  * @IRDP-432
//  */
// function createDatasetAPI(data) {
//   console.log('createDatasetAPI -> data', data);
//   return serverAxios({
//     url: `/v1/datasets`,
//     method: 'POST',
//     data,
//   });
// }

/**
 * Create a project
 *
 * @param {object} data
 * @param {{cancelFunction:()=>void}} cancelAxios the obj containns the function to cancel the serverAxios api calling
 * @returns success/fail
 * @IRDP-432
 */
function createProjectAPI(data, cancelAxios) {
  const CancelToken = axios.CancelToken;
  const url = `/v1/datasets/`;
  console.log('createProjectAPI -> url', url);
  return serverAxios({
    url: url,
    method: 'POST',
    data,
    cancelToken: new CancelToken(function executor(c) {
      // An executor function receives a cancel function as a parameter
      cancelAxios.cancelFunction = c;
    }),
  });
}

/**
 * get children datasets
 *
 * @param {object} datasetId parent datset
 * @returns {array} child datasets
 * @IRDP-456
 */
function getChildrenAPI(datasetId) {
  return serverAxios({
    url: `/v1/datasets/${datasetId}/relations/children`,
    method: 'GET',
  });
}

/**
 * query datasets with name, metadata, tags, etc
 * https://indocconsortium.atlassian.net/browse/VRE-92
 *
 * @param {object} data
 */
function queryDatasetAPI(data) {
  return serverAxios({
    url: '/v1/datasets/queries',
    method: 'POST',
    data,
  });
}

function listFilesApi(datasetId) {
  return serverAxios({
    url: `/datasets/${datasetId}`,
    method: 'GET',
  });
}

function getTagsAPI() {
  return serverAxios({
    url: `/v1/datasets/?type=tag`,
  });
}

function getMetadatasAPI() {
  return serverAxios({
    url: `/v1/datasets/?type=metadata`,
  });
}

/**
 * change a user's role on a dataset, from old role to new role
 *
 * @param {string} username
 * @param {number} datasetId
 * @param {object} roles
 */
function changeUserRoleInDatasetAPI(username, datasetId, roles) {
  return serverAxios({
    url: `/v1/datasets/${datasetId}/users/${username}`,
    data: roles,
    method: 'put',
  });
}

function addUserToDatasetAPI(username, datasetId, role) {
  return serverAxios({
    url: `/v1/datasets/${datasetId}/users/${username}`,
    data: { role },
    method: 'POST',
  });
}

/**
 * remove a user from a container
 *
 * @param {string} username
 * @param {number} datasetId
 */
function removeUserFromDatasetApi(username, datasetId) {
  return serverAxios({
    url: `/v1/datasets/${datasetId}/users/${username}`,
    method: 'DELETE',
  });
}

/**
 * set a user status in a container
 *
 * @param {string} username
 * @param {number} datasetId
 */
function setUserStatusFromDatasetApi(username, datasetId, action) {
  return serverAxios({
    url: `/v1/datasets/${datasetId}/users/${username}/status`,
    method: 'PUT',
    data: {
      status: action, // active, disable, hibernate
    },
  });
}

/**
 * given the dataset id, get the children datasets
 *
 * @param {number} datasetId the dataset id
 */
function getChildrenDataset(datasetId) {
  return serverAxios({
    url: `/v1/datasets/${datasetId}/relations/children`,
  });
}

/**
 *  get the the current user's personal dataset id
 * https://indocconsortium.atlassian.net/browse/VRE-157
 * @param {number} username
 */
function getPersonalDatasetAPI(username) {
  return serverAxios({
    url: `/v1/users/${username}/default`,
  });
}

/**
 * create a personal dataset
 * https://indocconsortium.atlassian.net/browse/VRE-157
 * @param {number} username
 */
function createPersonalDatasetAPI(username) {
  return serverAxios({
    url: `/v1/users/${username}/default`,
    method: 'POST',
  });
}

/**
 * This API allows the member to all files, containers and folders under specific container.
 * https://indocconsortium.atlassian.net/browse/VRE-165
 * @param {number} containerId
 */
function traverseFoldersContainersAPI(containerId) {
  return serverAxios({
    url: `/v1/files/folders`,
    params: { container_id: containerId },
  });
}

function listAllContainersPermission(username) {
  return serverAxios({
    url: `/v1/users/${username}/datasets`,
  });
}

function updateDatasetInfoAPI(containerId, data) {
  return serverAxios({
    url: `/v1/datasets/${containerId}`,
    method: 'PUT',
    data,
  });
}

export {
  getDatasetsAPI,
  createProjectAPI,
  queryDatasetAPI,
  listFilesApi,
  getTagsAPI,
  getMetadatasAPI,
  changeUserRoleInDatasetAPI,
  addUserToDatasetAPI,
  getChildrenDataset,
  getChildrenAPI,
  getPersonalDatasetAPI,
  createPersonalDatasetAPI,
  traverseFoldersContainersAPI,
  listAllContainersPermission,
  removeUserFromDatasetApi,
  setUserStatusFromDatasetApi,
  updateDatasetInfoAPI,
};
