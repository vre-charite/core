import { serverAxios as axios, devOpServer as devOpAxios } from './config';

/**
 * Get all the datasets
 *
 * @returns dataset[]
 * @IRDP-432
 */
function getDatasetsAPI(params = {}) {
  return axios({
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
//   return axios({
//     url: `/v1/datasets`,
//     method: 'POST',
//     data,
//   });
// }

/**
 * Create a project
 *
 * @param {object} data
 * @returns success/fail
 * @IRDP-432
 */
function createProjectAPI(data) {
  const url = `/v1/datasets/`;
  console.log('createProjectAPI -> url', url);
  return axios({
    url: url,
    method: 'POST',
    data,
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
  return axios({
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
  return axios({
    url: '/v1/datasets/queries',
    method: 'POST',
    data,
  });
}

function listFilesApi(datasetId) {
  return axios({
    url: `/datasets/${datasetId}`,
    method: 'GET',
  });
}

function getTagsAPI() {
  return axios({
    url: `/v1/datasets/?type=tag`,
  });
}

function getMetadatasAPI() {
  return axios({
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
  return axios({
    url: `/v1/datasets/${datasetId}/users/${username}`,
    data: roles,
    method: 'put',
  });
}

function addUserToDatasetAPI(username, datasetId, role) {
  return axios({
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
  return axios({
    url: `/v1/datasets/${datasetId}/users/${username}`,
    method: 'DELETE',
  });
}

/**
 * given the dataset id, get the children datasets
 *
 * @param {number} datasetId the dataset id
 */
function getChildrenDataset(datasetId) {
  return axios({
    url: `/v1/datasets/${datasetId}/relations/children`,
  });
}

/**
 *  get the the current user's personal dataset id
 * https://indocconsortium.atlassian.net/browse/VRE-157
 * @param {number} username
 */
function getPersonalDatasetAPI(username) {
  return axios({
    url: `/v1/users/${username}/default`,
  });
}

/**
 * create a personal dataset
 * https://indocconsortium.atlassian.net/browse/VRE-157
 * @param {number} username
 */
function createPersonalDatasetAPI(username) {
  return axios({
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
  return axios({
    url: `/v1/files/folders`,
    params: { container_id: containerId },
  });
}

function listAllContainersPermission(username) {
  return axios({
    url: `/v1/users/${username}/datasets`,
  });
}

function updateDatasetInfoAPI(containerId, data) {
  return axios({
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
  updateDatasetInfoAPI,
};
