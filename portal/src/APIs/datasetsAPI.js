import { serverAxios, axios, devOpServer } from './config';
import { objectKeysToSnakeCase } from '../Utility';
/**
 * Get all the datasets
 *
 * @returns dataset[]
 * @IRDP-432
 */
function getDatasetsAPI(params = {}) {
  // return serverAxios({
  //   url: '/v1/datasets/',
  //   method: 'GET',
  //   params: objectKeysToSnakeCase(params),
  // });
  delete params['end_params'];
  if (params['tags']) {
    params['tags'] = JSON.stringify(params['tags']);
  }
  return serverAxios({
    url: '/v1/datasets/',
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
  const url = `/v1/datasets/`;
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
    url: `v1/datasets/${datasetId}`,
    method: 'GET',
  });
}

function getTagsAPI() {
  return serverAxios({
    url: `/v1/datasets/?type=tag`,
  });
}

function getSystemTagsAPI(projectCode) {
  return serverAxios({
    url: `/v1/system-tags?project_code=${projectCode}`,
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
    params: { container_id: containerId, trash_can: true },
  });
}

function listAllContainersPermission(username) {
  return serverAxios({
    url: `/v1/users/${username}/datasets`,
    maxContentLength: Infinity,
    maxBodyLength: Infinity,
  });
}

async function listUsersContainersPermission(username, data) {
  return serverAxios({
    // url: `http://localhost:5000/v1/users/${username}/datasets`,
    url: `/v1/users/${username}/datasets`,
    method: 'POST',
    data,
    maxContentLength: Infinity,
    maxBodyLength: Infinity,
  });
}

function updateDatasetInfoAPI(containerId, data) {
  return serverAxios({
    url: `/v1/datasets/${containerId}`,
    method: 'PUT',
    data,
  });
}
function updateDatasetIcon(containerId, base64Img) {
  return serverAxios({
    url: `/v1/datasets/${containerId}`,
    method: 'PUT',
    data: {
      icon: base64Img,
    },
  });
}
function listAllVirtualFolder(containerId) {
  return serverAxios({
    url: `/v1/vfolder/?container_id=${containerId}`,
    method: 'GET',
  });
}

function createVirtualFolder(containerId, name) {
  return serverAxios({
    url: `/v1/vfolder/`,
    method: 'POST',
    data: {
      name: name,
      container_id: containerId,
    },
  });
}
async function listAllfilesVfolder(folderId, page, pageSize, order, column) {
  const columnMap = {
    createTime: 'time_created',
    fileName: 'name',
    owner: 'uploader',
    fileSize: 'file_size',
    generateID: 'generate_id',
  };
  order = order ? order : 'desc';
  column = column && columnMap[column] ? columnMap[column] : 'time_created';

  const res = await serverAxios({
    url: `/v1/vfolder/${folderId}`,
    method: 'GET',
    params: {
      page: page,
      page_size: pageSize,
      order_by: column,
      order_type: order,
    },
  });
  const entities = res.data.result.map((item) => {
    let typeName =
      item.labels.indexOf('Raw') !== -1 ? 'nfs_file' : 'nfs_file_processed';
    let formatRes = {
      displayText: item.fullPath,
      guid: item.guid,
      geid: item.globalEntityId,
      typeName: typeName,
      attributes: {
        createTime: item.timeCreated,
        fileName: item.name,
        fileSize: item.fileSize,
        name: item.fullPath,
        owner: item.uploader,
        path: item.path,
        qualifiedName: item.fullPath,
        generateId:
          item.generateId && typeof item.generateId !== 'undefined'
            ? item.generateId
            : 'undefined',
      },
      labels: item.tags,
    };
    return formatRes;
  });
  res.data.result = {
    approximateCount: res.data.total,
    entities,
  };
  return res;
}

function deleteVirtualFolder(folderId) {
  return serverAxios({
    url: `/v1/vfolder/${folderId}`,
    method: 'DELETE',
  });
}

function listAllCopy2CoreFiles(projectCode, sessionId) {
  return devOpServer({
    url: `/v1/file/actions/status?action=data_transfer&project_code=${projectCode}&session_id=${sessionId}`,
    method: 'GET',
  });
}

function loadDeletedFiles(projectCode, sessionId) {
  return devOpServer({
    url: `/v1/file/actions/status?action=data_delete&project_code=${projectCode}&session_id=${sessionId}`,
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
 * https://indocconsortium.atlassian.net/browse/VRE-921
 * @param {number} manifestId
 */
function getManifestById(manifestId) {
  return serverAxios({
    url: `/v1/data/manifest/${manifestId}`,
  });
}

/**
 * update the manifest attribute for a specified file
 * https://indocconsortium.atlassian.net/browse/VRE-947
 * @param {string} filePath
 * @param {object} attributes all the attributes {name:value}
 */
function updateFileManifestAPI(filePath, attributes) {
  return serverAxios({
    url: `/v1/file/manifest`,
    method: 'PUT',
    data: {
      file_path: filePath,
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
function attachManifest(manifestId, files, attributes) {
  const refinedArr = files.map((file_path) => {
    return {
      manifest_id: manifestId,
      file_path: file_path,
      attributes: attributes,
    };
  });
  return serverAxios({
    url: `/v1/file/manifest/attach`,
    method: 'POST',
    data: refinedArr,
  });
}

function getProjectInfoAPI(projectId) {
  return serverAxios({
    // url: `http://localhost:5000/v1/project/${projectId}`,
    url: `/v1/project/${projectId}`,
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
 * @param {*} manifest the manifest object, https://indocconsortium.atlassian.net/browse/VRE-922
 */
function importManifestAPI(manifest) {
  return serverAxios({
    url: '/v1/import/manifest',
    data: manifest,
    method: 'POST',
  });
}

/**
 * https://indocconsortium.atlassian.net/browse/VRE-1006
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
 * https://indocconsortium.atlassian.net/browse/VRE-1006
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
 * https://indocconsortium.atlassian.net/browse/VRE-1006
 * get user's announcement information. So that we can know which announcement the user has read.
 * @param {string} username
 */
function getUserAnnouncementApi(username) {
  return serverAxios({
    url: `/v1/users/${username}`,
  });
}

/**
 * https://indocconsortium.atlassian.net/browse/VRE-1006
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
function getAuditLogsApi(projectId, paginationParams, query) {
  return serverAxios({
    method: 'get',
    url: `/v1/audit-logs/${projectId}`,
    params: {
      ...paginationParams,
      query,
    },
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
  updateDatasetIcon,
  getSystemTagsAPI,
  createVirtualFolder,
  listAllVirtualFolder,
  listAllfilesVfolder,
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
};
