import {
  serverAxiosNoIntercept,
  serverAxios as axios,
  devOpServer as devOpAxios,
  devOpServerNoIntercept,
  kongAPI,
  uploadAxios,
} from './config';
import { objectKeysToSnakeCase, checkGreenAndCore } from '../Utility';
import { message } from 'antd';
import _ from 'lodash';
import { keycloak } from '../Service/keycloak';
import { API_PATH, dcmId, dcm_id } from '../config';

function uploadFileApi(containerId, data, cancelToken) {
  return devOpAxios({
    url: `/v1/containers/${containerId}/files`,
    method: 'POST',
    data,
    cancelToken,
  });
}

function uploadFileApi2(data, sessionId, cancelToken) {
  return uploadAxios({
    url: `/v1/files/chunks`,
    method: 'POST',
    data,
    cancelToken,
    timeout: 30 * 1000,
    headers: {
      'Session-ID': sessionId,
    },
  });
}

function preUploadApi(data, sessionId) {
  return uploadAxios({
    url: `/v1/files/jobs`,
    method: 'POST',
    data,
    timeout: 10 * 60 * 1000,
    headers: {
      'Session-ID': sessionId,
    },
  });
}

function combineChunksApi(data, sessionId) {
  return uploadAxios({
    url: `/v1/files`,
    method: 'POST',
    data,
    headers: {
      'Session-ID': sessionId,
      'Refresh-token': keycloak.refreshToken,
    },
  });
}

function checkUploadStatus(projectCode, operator, sessionId) {
  return uploadAxios({
    url: `/v1/files/jobs`,
    method: 'GET',
    headers: {
      'Session-ID': sessionId,
    },
    params: {
      project_code: projectCode,
      operator,
    },
  });
}

function deleteUploadStatus(containerId, sessionId) {
  return axios({
    url: `/v1/upload/containers/${containerId}/upload-state`,
    method: 'DELETE',
    headers: {
      'Session-ID': sessionId,
    },
  });
}

function checkDownloadStatus(sessionId, projectCode, operator) {
  return axios({
    url: `/download/gr/v1/downloads/status`,
    method: 'GET',
    headers: {
      'Session-ID': `${sessionId}`,
    },
    params: {
      project_code: projectCode,
      operator,
    },
  });
}

function deleteDownloadStatus(sessionId) {
  return axios({
    url: `/download/gr/v1/download/status`,
    method: 'DELETE',
    headers: {
      'Session-ID': `${sessionId}`,
    },
  });
}

/**
 * Get a list of files from the study
 *
 * @param {int} studyId studyId
 * @returns {array} files[]
 * @IRDP-436
 */
function getFilesAPI(datasetId) {
  return axios({
    //url: `/${studyId}/files`,
    url: `/v1/${datasetId}/files`,
    method: 'GET',
  });
}

/**
 * This API allows the member of a usecase(or dataset) to list all file/folder name inside.
 *
 *  ticket-152
 * @param {number} datasetId
 * @param {string} path
 */
function listFoldersAndFilesUnderContainerApi(containerId, path) {
  return devOpAxios({
    url: `/v1/folders`,
    params: { path, container_id: containerId },
  });
}

/**
 * create a sub folder in a given dataset with a path
 *
 * @param {number} datasetId
 * @param {string} path
 * @param {string} folderName
 */
function createFolderApi(containerId, path, folderName) {
  return devOpAxios({
    url: `/v1/folders`,
    method: 'POST',
    headers: { 'Refresh-token': keycloak.refreshToken },
    data: {
      path: path ? path + '/' + folderName : folderName,
      container_id: containerId,
    },
  });
}

function getFileManifestAttrs(geidsList, lineageView = false) {
  return serverAxiosNoIntercept({
    url: `/v1/file/manifest/query`,
    method: 'POST',
    data: {
      geid_list: geidsList,
      lineage_view: lineageView,
    },
  });
}

async function getRequestFiles(
  requestGeid,
  page,
  pageSize,
  orderBy,
  orderType,
  filters,
  partial,
  projectGeid,
  parentGeid,
) {
  const params = {
    page,
    page_size: pageSize,
    order_by: orderBy,
    order_type: orderType,
    partial,
    query: _.omit(filters, ['tags']),
    request_id: requestGeid,
  };
  if (parentGeid) {
    params.parent_geid = parentGeid;
  }
  let res;
  res = await axios({
    url: `/v1/request/copy/${projectGeid}/files`,
    params: objectKeysToSnakeCase(params),
  });
  res.data.result.entities = res.data.result.data.map((item) => {
    res.data.result.approximateCount = res.data.total;
    let formatRes = {
      geid: item.entityGeid,
      key: item.entityGeid,
      archived: item.archived,
      createTime: item.uploadedAt,
      nodeLabel:
        item.entityType === 'folder'
          ? ['Greenroom', 'Folder']
          : ['Greenroom', 'File'],
      displayPath: item.displayPath,
      name: item.name,
      fileSize: item.fileSize,
      owner: item.uploadedBy,
      path: item.path,
      location: item.location,
      folderRelativePath: item.folderRelativePath,
      dcmId:
        item['dcmId'] && typeof item['dcmId'] !== 'undefined'
          ? item['dcmId']
          : undefined,
      tags: [],
      reviewedAt: item.reviewedAt,
      reviewedBy: item.reviewedBy,
      reviewStatus: item.reviewStatus,
    };
    return formatRes;
  });
  res.data.result.routing = res.data.result.routing.map((item, ind) => {
    let formatRes = {
      name: item.name,
      labels:
        item.entityType === 'folder'
          ? ['Greenroom', 'Folder']
          : ['Greenroom', 'File'],
      globalEntityId: item.entityGeid,
      folderLevel: res.data.result.routing.length - ind,
    };
    return formatRes;
  });
  return res;
}

async function getRequestFilesDetailByGeid(geids) {
  return axios({
    url: `/v1/files/bulk/detail`,
    method: 'POST',
    data: {
      geids,
    },
  });
}

/**
 * ticket-1314
 * @param {string} geid the geid of a virtual folder or folder, like bcae46e0-916c-11eb-be94-eaff9e667817-1617118177
 * @param {number} page the nth page. start from ?
 * @param {number} pageSize the number of items in each page
 * @param {string} orderBy order by which column. should be one of the column name
 * @param {"desc"|"asc"} orderType
 * @param {*} filters the query filter like {"name":"hello"}
 * @param {"Greenroom"|"Core"|"All"} zone if the sourceType is "Trash", the zone is All
 * @param {"Project"|"Folder"|"TrashFile"|"Collection"} sourceType The Folder are the folders inside file explorer.
 * @param {string[]} partial what queries should be partial search.
 */
async function getFiles(
  geid,
  page,
  pageSize,
  orderBy,
  orderType,
  filters,
  zone,
  sourceType,
  partial,
  panelKey,
  projectGeid,
) {
  const archived = panelKey.toLowerCase().includes('trash') ? true : false;
  filters['archived'] = archived;
  let url;
  if (checkGreenAndCore(panelKey) && geid === null) {
    url = `/v1/files/entity/meta/`;
  } else {
    url = `/v1/files/entity/meta/${geid}`;
  }
  const params = {
    page,
    page_size: pageSize,
    order_by: orderBy,
    order_type: orderType,
    partial,
    query: _.omit(filters, ['tags']),
    zone: zone,
    sourceType,
    project_geid: projectGeid,
  };
  let res;
  res = await axios({
    url,
    params: objectKeysToSnakeCase(params),
  });
  res.data.result.entities = res.data.result.data;
  res.data.result.entities = res.data.result.entities.map((item) => {
    res.data.result.approximateCount = res.data.total;
    let formatRes = {
      guid: item.guid,
      geid: item.globalEntityId,
      archived: item.archived,
      attributes: {
        createTime: item.timeCreated,
        nodeLabel: item.labels,
        displayPath: item.displayPath,
        fileName: item.name,
        fileSize: item.fileSize,
        owner: item.uploader,
        path: item.path,
        location: item.location,
        folderRelativePath: item.folderRelativePath,
        dcmId:
          item['dcmId'] && typeof item['dcmId'] !== 'undefined'
            ? item['dcmId']
            : 'undefined',
      },
      labels:
        item.systemTags && item.systemTags.length
          ? item.tags.concat(item.systemTags)
          : item.tags,
    };
    return formatRes;
  });
  return res;
}

/**
 * check multiple files bulk download status in container
 * @param {number} containerId
 * @param {number} path
 * @param {number} fileName
 */
function checkDownloadStatusAPI(
  taskId,
  hashCode,
  namespace,
  updateDownloadItemDispatch,
  setSuccessNumDispatcher,
  successNum,
) {
  return axios({
    url: `/download/gr/v1/download/status/${hashCode}`,
    method: 'GET',
  })
    .then((res) => {
      const { status } = res.data.result;
      if (status === 'READY_FOR_DOWNLOADING') {
        const namespaceUrl =
          namespace.toLowerCase() === 'greenroom' ? 'gr' : 'core';
        updateDownloadItemDispatch({ key: taskId, status: 'success' });
        const hashCode = res.data.result?.payload?.hashCode;
        const url =
          API_PATH + `/download/${namespaceUrl}/v1/download/${hashCode}`;
        // Start to download zip file
        console.log(API_PATH, url);
        window.open(url, '_blank');
        setTimeout(() => {
          setSuccessNumDispatcher(successNum + 1);
        }, 3000);
      } else if (status === 'CANCELLED') {
        updateDownloadItemDispatch({ key: taskId, status: 'error' });
      } else if (status === 'error') {
        // Stop check status
      }
    })
    .catch((err) => {
      console.log(err);
    });
}

/**
 * download the file in container
 * @param {number} containerId
 * @param {number} path
 * @param {number} fileName
 * @returns {string} url string
 */
async function downloadFilesAPI(
  containerId,
  files,
  setLoading,
  appendDownloadListCreator,
  sessionId,
  projectCode,
  operator,
  namespace,
  requestId, // only for request to core table
) {
  console.log(namespace);
  const options = {
    url: `/v2/download/pre`,
    method: 'post',
    headers: { 'Refresh-token': keycloak.refreshToken },
    data: {
      files,
      project_code: projectCode,
      operator: operator,
      session_id: sessionId,
    },
  };
  if (requestId) {
    options.data['approval_request_id'] = requestId;
  }
  return axios(options).then((res) => {
    let fileName = res.data.result.source;
    const status = res.data.result.status;
    const fileNamesArr = fileName.split('/') || [];
    fileName = fileNamesArr.length && fileNamesArr[fileNamesArr.length - 1];
    const namespaceUrl =
      namespace.toLowerCase() === 'greenroom' ? 'gr' : 'core';
    if (status === 'READY_FOR_DOWNLOADING') {
      const hashCode = res.data.result.payload.hashCode;
      const url =
        API_PATH + `/download/${namespaceUrl}/v1/download/${hashCode}`;
      return url;
    }

    let item = {
      downloadKey: res.data.result['jobId'],
      container: res.data.result.projectCode,
      projectCode: res.data.result.projectCode,
      status: 'pending',
      filename: fileName,
      projectId: containerId,
      hashCode: res.data.result.payload.hashCode,
      namespace,
      createdTime: Date.now(),
    };

    appendDownloadListCreator(item);

    return null;
  });
}

/**
 * check the file status in the backend after all chunks uploaded
 * @param {number} containerId
 * @param {number} taskId
 */
function checkPendingStatusAPI(containerId, taskId) {
  return axios({
    url: `/v1/upload/containers/${containerId}/status`,
    method: 'GET',
    params: objectKeysToSnakeCase({
      taskId,
    }),
  });
}

/**
 * call this api to email the project admin with the uploaded file list
 * @param {Object[]} fileList the uploaded files from redux
 * @param {string} number the user who upload the files
 */
function emailUploadedFileListAPI(fileList, uploader) {
  if (fileList.length === 0) {
    return Promise.resolve();
  }
  fileList.forEach((ele) => {
    Object.keys(ele).forEach((item) => {
      if (typeof ele[item] !== 'string') {
        ele[item] = String(ele[item]);
      }
    });
  });

  return axios({
    url: '/v1/report/upload',
    method: 'post',
    data: {
      uploader,
      files: fileList.map((item) => {
        const timestamp = Number(item.uploadedTime);
        return { ...item, uploadedTime: new Date(timestamp) };
      }),
    },
  });
}

/**
 * Get total number of the raw files and processed files
 *
 * @param {int} containerId containerId
 */
function projectFileCountTotal(geid, params) {
  return axios({
    url: `v1/files/project/${geid}/files/statistics`,
    params,
  });
}

/**
 * Add new tags to existed file entities
 *
 * @param {int} containerId containerId
 * @param {dict} data data
 */
function updateProjectTagsAPI(fileType, geid, data) {
  return axios({
    url: `/v2/${fileType}/${geid}/tags`,
    method: 'POST',
    data,
  });
}

function batchTagsAPI(data) {
  return axios({
    url: '/v2/entity/tags',
    method: 'POST',
    data,
  });
}

/**
 * Delete new tags to existed file entities
 *
 * @param {int} containerId containerId
 * @param {str} tag tag
 * @param {array} taglist taglist
 * @param {str} guid
 */
function deleteProjectTagsAPI(containerId, params) {
  return axios({
    url: `/v2/files/containers/${containerId}/files/tags`,
    method: 'DELETE',
    data: params,
  });
}

function fileLineageAPI(key, typeName, direction) {
  return axios({
    url: `/v1/lineage`,
    method: 'GET',
    params: { geid: key, direction, type_name: typeName },
  });
}

function addToVirtualFolder(collectionGeid, geids) {
  return axios({
    url: `/v1/collections/${collectionGeid}/files`,
    method: 'POST',
    data: {
      file_geids: geids,
    },
  });
}

/**
 * ticket-1499
 * @param {string} collectionGeid the vfolder geid
 * @param {string} geids the files/folders geid
 * @returns
 */
function removeFromVirtualFolder(collectionGeid, geids) {
  return axios({
    url: `/v1/collections/${collectionGeid}/files`,
    method: 'DELETE',
    data: {
      file_geids: geids,
    },
  });
}

function getZipContentAPI(fileGeid, projectGeid) {
  return serverAxiosNoIntercept({
    url: '/v1/archive/',
    params: {
      project_geid: projectGeid,
      file_geid: fileGeid,
    },
  });
}

function deleteFileAPI(data) {
  return axios({
    url: '/v1/files/actions',
    method: 'DELETE',
    headers: { 'Refresh-token': keycloak.refreshToken },
    data,
  });
}

function searchFilesAPI(params, projectGeid) {
  if (params?.query?.zone?.value)
    params.query.zone.value = _.lowerCase(params.query.zone.value);
  return axios({
    url: `/v1/${projectGeid}/files/search`,
    method: 'GET',
    params,
  });
}

function validateRepeatFiles(
  targets,
  destination,
  operator,
  operation,
  projectGeid,
  sessionId,
) {
  let payload = {
    targets,
  };
  if (destination) {
    payload.destination = destination;
  }
  return axios({
    url: `/v1/files/repeatcheck`,
    method: 'POST',
    headers: {
      'Session-ID': sessionId,
    },
    data: {
      payload,
      operator,
      operation,
      project_geid: projectGeid,
      session_id: sessionId,
    },
  });
}

function commitFileAction(
  payload,
  operator,
  operation,
  projectGeid,
  sessionId,
) {
  return axios({
    url: `/v1/files/actions`,
    method: 'POST',
    headers: {
      'Session-ID': sessionId,
      'Refresh-token': keycloak.refreshToken,
    },

    data: {
      payload,
      operator,
      operation,
      project_geid: projectGeid,
      session_id: sessionId,
    },
  });
}
function reviewAllRequestFiles(
  projectGeid,
  requestId,
  reviewStatus,
  sessionId,
) {
  return axios({
    url: `/v1/request/copy/${projectGeid}/files`,
    method: 'PUT',
    headers: {
      'Session-ID': sessionId,
    },
    data: {
      request_id: requestId,
      review_status: reviewStatus,
      session_id: sessionId,
    },
  });
}
function reviewSelectedRequestFiles(
  projectGeid,
  requestId,
  geids,
  reviewStatus,
  sessionId,
) {
  return axios({
    url: `/v1/request/copy/${projectGeid}/files`,
    method: 'PATCH',
    headers: {
      'Session-ID': sessionId,
    },
    data: {
      request_id: requestId,
      entity_geids: geids,
      review_status: reviewStatus,
      session_id: sessionId,
    },
  });
}

export {
  uploadFileApi,
  getFilesAPI,
  listFoldersAndFilesUnderContainerApi,
  createFolderApi,
  downloadFilesAPI,
  checkDownloadStatusAPI,
  checkPendingStatusAPI,
  emailUploadedFileListAPI,
  projectFileCountTotal,
  preUploadApi,
  uploadFileApi2,
  combineChunksApi,
  checkUploadStatus,
  deleteUploadStatus,
  updateProjectTagsAPI,
  batchTagsAPI,
  deleteProjectTagsAPI,
  fileLineageAPI,
  checkDownloadStatus,
  deleteDownloadStatus,
  addToVirtualFolder,
  removeFromVirtualFolder,
  getZipContentAPI,
  deleteFileAPI,
  getFileManifestAttrs,
  searchFilesAPI,
  getFiles,
  getRequestFiles,
  validateRepeatFiles,
  commitFileAction,
  reviewSelectedRequestFiles,
  reviewAllRequestFiles,
  getRequestFilesDetailByGeid,
};
