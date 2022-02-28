import { serverAxios, axios, devOpServer } from './config';
import { objectKeysToCamelCase, objectKeysToSnakeCase } from '../Utility';
import _, { result } from 'lodash';
import { keycloak } from '../Service/keycloak';
/**
 * Get all the datasets
 *
 * @returns dataset[]
 * @IRDP-432
 */
function getDatasetsAPI(params = {}) {
  // return serverAxios({
  //   url: '/v1/containers/',
  //   method: 'GET',
  //   params: objectKeysToSnakeCase(params),
  // });
  delete params['end_params'];
  if (params['tags']) {
    params['tags'] = JSON.stringify(params['tags']);
  }
  return serverAxios({
    url: '/v1/containers/',
    method: 'GET',
    params: objectKeysToSnakeCase(params),
  });
}

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
  const url = `/v1/projects`;
  return serverAxios({
    url: url,
    method: 'POST',
    data,
    timeout: 60 * 1000,
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
    url: `/v1/containers/${datasetId}/relations/children`,
    method: 'GET',
  });
}

/**
 * query datasets with name, metadata, tags, etc
 * ticket-92
 *
 * @param {object} data
 */
function queryDatasetAPI(data) {
  return serverAxios({
    url: '/v1/containers/queries',
    method: 'POST',
    data,
  });
}

function getTagsAPI() {
  return serverAxios({
    url: `/v1/containers/?type=tag`,
  });
}

function getSystemTagsAPI(projectCode) {
  return serverAxios({
    url: `/v1/system-tags?project_code=${projectCode}`,
  });
}

function getMetadatasAPI() {
  return serverAxios({
    url: `/v1/containers/?type=metadata`,
  });
}

/**
 * change a user's role on a dataset, from old role to new role
 *
 * @param {string} username
 * @param {number} datasetId
 * @param {object} roles
 */
function changeUserRoleInDatasetAPI(username, projectGeid, roles) {
  return serverAxios({
    url: `/v1/containers/${projectGeid}/users/${username}`,
    data: roles,
    method: 'put',
  });
}

function addUserToDatasetAPI(username, projectGeid, role) {
  return serverAxios({
    url: `/v1/containers/${projectGeid}/users/${username}`,
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
function removeUserFromDatasetApi(username, projectGeid) {
  return serverAxios({
    url: `/v1/containers/${projectGeid}/users/${username}`,
    method: 'DELETE',
  });
}

/**
 * given the dataset id, get the children datasets
 *
 * @param {number} datasetId the dataset id
 */
function getChildrenDataset(datasetId) {
  return serverAxios({
    url: `/v1/containers/${datasetId}/relations/children`,
  });
}

/**
 *  get the the current user's personal dataset id
 * ticket-157
 * @param {number} username
 */
function getPersonalDatasetAPI(username) {
  return serverAxios({
    url: `/v1/users/${username}/default`,
  });
}

/**
 * create a personal dataset
 * ticket-157
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
 * ticket-165
 * @param {number} containerId
 */
function traverseFoldersContainersAPI(containerId) {
  return serverAxios({
    url: `/v1/files/folders`,
    params: { container_id: containerId, trash_can: true },
  });
}

function listAllContainersPermission(username) {
  return serverAxios({
    url: `/v1/users/${username}/containers`,
    maxContentLength: Infinity,
    maxBodyLength: Infinity,
  });
}

async function listUsersContainersPermission(username, data) {
  return serverAxios({
    url: `/v1/users/${username}/containers`,
    method: 'POST',
    data,
    maxContentLength: Infinity,
    maxBodyLength: Infinity,
  });
}

function updateDatasetInfoAPI(projectGeid, data) {
  return serverAxios({
    url: `/v1/containers/${projectGeid}`,
    method: 'PUT',
    data,
  });
}

function updateDatasetIcon(projectGeid, base64Img) {
  return serverAxios({
    url: `/v1/containers/${projectGeid}`,
    method: 'PUT',
    data: {
      icon: base64Img,
    },
  });
}

function updateVirtualFolder(projectGeid, payload) {
  return serverAxios({
    url: `/v1/project/${projectGeid}/collections`,
    method: 'PUT',
    data: {
      collections: payload,
    },
  });
}

async function listAllVirtualFolder(projectGeid) {
  const res = await serverAxios({
    url: `/v1/collections?project_geid=${projectGeid}`,
    method: 'GET',
  });
  const vfolders = res.data.result.map((v) => {
    return {
      geid: v.globalEntityId,
      labels: v.labels,
      ...v.properties,
    };
  });
  res.data.result = vfolders;
  return res;
}

function createVirtualFolder(projectGeid, name) {
  return serverAxios({
    url: `/v1/collections`,
    method: 'POST',
    data: {
      name: name,
      project_geid: projectGeid,
    },
  });
}

function deleteVirtualFolder(collectionGeid) {
  return serverAxios({
    url: `/v1/collections/${collectionGeid}`,
    method: 'DELETE',
  });
}

async function listAllCopy2CoreFiles(projectCode, sessionId) {
  const res = await serverAxios({
    url: `/v1/files/actions/tasks?action=data_transfer&project_code=${projectCode}&session_id=${sessionId}`,
    method: 'GET',
  });
  return [...res.data.result];
}

function loadDeletedFiles(projectCode, sessionId) {
  return serverAxios({
    url: `/v1/files/actions/tasks?action=data_delete&project_code=${projectCode}&session_id=${sessionId}`,
    method: 'GET',
  });
}

function getProjectManifestList(projectCode) {
  return serverAxios({
    url: `/v1/data/manifests?project_code=${projectCode}`,
    method: 'GET',
  });
}

/**
 * ticket-921
 * @param {number} manifestId
 */
function getManifestById(manifestId) {
  return serverAxios({
    url: `/v1/data/manifest/${manifestId}`,
  });
}

/**
 * update the manifest attribute for a specified file
 * ticket-947
 * @param {string} geid file's geid
 * @param {object} attributes all the attributes {name:value}
 */
function updateFileManifestAPI(geid, attributes) {
  return serverAxios({
    url: `/v1/file/${geid}/manifest`,
    method: 'PUT',
    data: {
      ...attributes,
    },
  });
}

function addNewManifest(name, projectCode) {
  return serverAxios({
    url: `/v1/data/manifests`,
    method: 'POST',
    data: {
      name: name,
      project_code: projectCode,
    },
  });
}
function updateManifest(manifestId, name, projectCode) {
  return serverAxios({
    url: `/v1/data/manifest/${manifestId}`,
    method: 'PUT',
    data: {
      name: name,
      project_code: projectCode,
    },
  });
}
function deleteManifest(manifestId) {
  return serverAxios({
    url: `/v1/data/manifest/${manifestId}`,
    method: 'DELETE',
  });
}
function deleteAttrFromManifest(attrId) {
  return serverAxios({
    url: `/v1/data/attribute/${attrId}`,
    method: 'DELETE',
  });
}
function updateAttrFromManifest(
  manifestId,
  attrId,
  name,
  projectCode,
  type,
  value,
  optional,
) {
  return serverAxios({
    url: `/v1/data/attribute/${attrId}`,
    method: 'PUT',
    data: {
      manifest_id: manifestId,
      name: name,
      project_code: projectCode,
      type: type,
      value: value,
      optional: optional,
    },
  });
}
function addNewAttrToManifest(
  manifestId,
  name,
  projectCode,
  type,
  value,
  optional,
) {
  return serverAxios({
    url: `/v1/data/attributes`,
    method: 'POST',
    data: [
      {
        name: name,
        project_code: projectCode,
        type: type,
        value: value,
        manifest_id: manifestId,
        optional: optional,
      },
    ],
  });
}
function addNewAttrsToManifest(attrsParams) {
  const refinedAttrs = attrsParams.map((attr) => {
    return {
      name: attr.name,
      project_code: attr.projectCode,
      type: attr.type,
      value: attr.value,
      manifest_id: attr.manifestId,
      optional: attr.optional,
    };
  });
  return serverAxios({
    url: `/v1/data/attributes`,
    method: 'POST',
    data: refinedAttrs,
  });
}

function attachManifest(projectCode, manifestId, geids, attributes) {
  return serverAxios({
    url: `/v1/file/attributes/attach`,
    method: 'POST',
    data: {
      project_code: projectCode,
      manifest_id: manifestId,
      global_entity_id: geids,
      attributes: attributes,
      inherit: true,
    },
  });
}

function getProjectInfoAPI(projectGeid) {
  return serverAxios({
    // url: `http://localhost:5000/v1/project/${projectId}`,
    url: `/v1/project/${projectGeid}`,
    method: 'GET',
  });
}

/**
 * get project by project code. It's used to check the uniqueness of project code
 * @param {string} projectCode the project code
 */
function getDatasetByCode(projectCode) {
  return serverAxios({
    url: '/v1/project/code/' + projectCode,
  });
}

/**
 * import a manifest from json file
 * @param {*} manifest the manifest object, ticket-922
 */
function importManifestAPI(manifest) {
  return serverAxios({
    url: '/v1/import/manifest',
    data: manifest,
    method: 'POST',
  });
}

/**
 * ticket-1006
 * startDate: 2021-02-22
 * endDate:2021-02-22
 * version: 1614027879010
 * page: by default 0, return the newest
 * pageSize: by default 10
 * order: by default 'desc' by time
 * @param {{projectCode:string,startDate:string,endDate:string,version:string,page:string,pageSize:string,order:'asc'|'desc'}} param0
 */
function getAnnouncementApi({
  projectCode,
  startDate,
  endDate,
  version,
  page,
  pageSize,
  order,
}) {
  return serverAxios({
    url: `/v1/announcements`,
    params: {
      project_code: projectCode,
      start_date: startDate,
      end_date: endDate,
      version,
      page,
      page_size: pageSize,
      order: order || 'desc',
    },
  });
}

/**
 * ticket-1006
 * @param {{projectCode:string,content:string}} param0
 */
function addAnnouncementApi({ projectCode, content }) {
  return serverAxios({
    method: 'post',
    url: `/v1/announcements`,
    data: {
      project_code: projectCode,
      content,
    },
  });
}

/**
 * ticket-1006
 * get user's announcement information. So that we can know which announcement the user has read.
 * @param {string} username
 */
function getUserAnnouncementApi(username) {
  return serverAxios({
    url: `/v1/users/${username}`,
  });
}

/**
 * ticket-1006
 * update the user's announcement information. Add the read announcement id to it.
 */
function putUserAnnouncementApi(username, projectCode, announcementId) {
  return serverAxios({
    method: 'put',
    url: `/v1/users/${username}`,
    data: { [`announcement_${projectCode}`]: announcementId },
  });
}

/**
 * @param {{projectId:string,query:object}} param0
 */
function getAuditLogsApi(projectGeid, paginationParams, query) {
  return serverAxios({
    method: 'get',
    url: `/v1/audit-logs/${projectGeid}`,
    params: {
      ...paginationParams,
      query,
    },
  });
}

/**
 * ticket-1431
 * get the the project's workbench info.
 */
function getWorkbenchInfo(projectGeid) {
  return serverAxios({
    method: 'get',
    url: `/v1/${projectGeid}/workbench`,
  });
}

/**
 * ticket-1431
 * deploy a workbench for a project.
 */
function deployWorkbenchAPI(projectGeid, workbench) {
  return serverAxios({
    method: 'post',
    url: `/v1/${projectGeid}/workbench`,
    data: {
      workbench_resource: workbench,
      deployed: true,
    },
  });
}

/**
 * ticket-1435
 * @param {string} folderName
 * @param {string} destinationGeid
 * @param {string} projectGeid
 * @param {string} uploader
 * @param {"greenroom | Core"} zone No longer used
 */
function createSubFolderApi(
  folderName,
  destinationGeid,
  projectCode,
  uploader,
  zone,
) {
  return serverAxios({
    url: '/v1/folder',
    method: 'post',
    data: {
      folder_name: folderName,
      destination_geid: destinationGeid,
      project_code: projectCode,
      uploader,
      tags: [],
      zone: _.lowerCase(zone),
    },
  });
}

function requestToCoreAPI(
  projectGeid,
  entityGeids,
  destinationFolderGeid,
  sourceFolderGeid,
  sourcePath,
  destinationPath,
  requestNote,
  userName,
) {
  return serverAxios({
    url: `/v1/request/copy/${projectGeid}`,
    method: 'POST',
    data: {
      entity_geids: entityGeids,
      destination_geid: destinationFolderGeid,
      source_geid: sourceFolderGeid,
      source_path: sourcePath,
      destination_path: destinationPath,
      note: requestNote,
      submitted_by: userName,
    },
  });
}

function addToDatasetsAPI(datasetGeid, payLoad) {
  return serverAxios({
    url: `/v1/dataset/${datasetGeid}/files`,
    method: 'PUT',
    headers: { 'Refresh-token': keycloak.refreshToken },
    data: payLoad,
  });
}

function getDatasetsListingAPI(username, payload) {
  return serverAxios({
    url: `/v1/users/${username}/datasets`,
    method: 'POST',
    data: payload,
  });
}

function listFilesInRequestApi(requestGeid, projectGeid, query, partial) {
  return serverAxios({
    url: `/v1/request/copy/${projectGeid}/files`,
    method: 'GET',
    params: {
      request_geid: requestGeid,
      query,
      partial,
    },
  });
}

function listAllCopyRequests(projectGeid, status, pageNo, pageSize) {
  return serverAxios({
    url: `/v1/request/copy/${projectGeid}`,
    method: 'get',
    params: {
      status: status,
      page: pageNo,
      page_size: pageSize,
    },
  });
}

function requestPendingFilesAPI(projectGeid, requestId) {
  return serverAxios({
    url: `/v1/request/copy/${projectGeid}/pending-files`,
    method: 'GET',
    params: {
      request_id: requestId,
    },
  });
}

function requestCompleteAPI(data) {
  return serverAxios({
    url: `/v1/request/copy/${data.projectGeid}`,
    method: 'PUT',
    data: {
      request_id: data.requestId,
      status: data.status,
      review_notes: data.reviewNotes,
    },
  });
}
export {
  getDatasetsAPI,
  createProjectAPI,
  queryDatasetAPI,
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
  updateDatasetIcon,
  getSystemTagsAPI,
  createVirtualFolder,
  listAllVirtualFolder,
  updateVirtualFolder,
  deleteVirtualFolder,
  listUsersContainersPermission,
  listAllCopy2CoreFiles,
  getProjectInfoAPI,
  getDatasetByCode,
  getProjectManifestList,
  addNewManifest,
  addNewAttrToManifest,
  deleteManifest,
  deleteAttrFromManifest,
  updateAttrFromManifest,
  loadDeletedFiles,
  updateManifest,
  addNewAttrsToManifest,
  attachManifest,
  importManifestAPI,
  getManifestById,
  addAnnouncementApi,
  getAuditLogsApi,
  updateFileManifestAPI,
  getAnnouncementApi,
  getUserAnnouncementApi,
  putUserAnnouncementApi,
  getWorkbenchInfo,
  deployWorkbenchAPI,
  createSubFolderApi,
  addToDatasetsAPI,
  getDatasetsListingAPI,
  requestToCoreAPI,
  listFilesInRequestApi,
  listAllCopyRequests,
  requestPendingFilesAPI,
  requestCompleteAPI,
};
