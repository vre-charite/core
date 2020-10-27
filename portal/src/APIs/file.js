import {
  serverAxios as axios,
  devOpServer as devOpAxios,
  devOpServerUrl,
} from './config';
import { objectKeysToSnakeCase } from '../Utility';
import { message } from 'antd';
import _ from 'lodash';

function uploadFileApi(containerId, data, cancelToken) {
  return devOpAxios({
    url: `/v1/containers/${containerId}/files`,
    method: 'POST',
    data,
    cancelToken,
  });
}

function uploadFileApi2(containerId, data, cancelToken) {
  return devOpAxios({
    url: `/v1/upload/containers/${containerId}/chunks`,
    method: 'POST',
    data,
    cancelToken,
  });
}

function preUpload(containerId, data, sessionId) {
  return devOpAxios({
    url: `/v1/upload/containers/${containerId}/pre`,
    method: 'POST',
    data,
    headers: {
      'Session-ID': sessionId,
    },
  });
}

function combineChunks(containerId, data, sessionId) {
  return devOpAxios({
    url: `/v1/upload/containers/${containerId}/on-success`,
    method: 'POST',
    data,
    headers: {
      'Session-ID': sessionId,
    },
  });
}

function checkUploadStatus(containerId, sessionId) {
  return devOpAxios({
    url: `/v1/upload/containers/${containerId}/upload-state`,
    method: 'GET',
    headers: {
      'Session-ID': sessionId,
    },
  });
}

function deleteUploadStatus(containerId, sessionId) {
  return devOpAxios({
    url: `/v1/upload/containers/${containerId}/upload-state`,
    method: 'DELETE',
    headers: {
      'Session-ID': sessionId,
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
 *  https://indocconsortium.atlassian.net/browse/VRE-152
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
    data: {
      path: path ? path + '/' + folderName : folderName,
      container_id: containerId,
    },
  });
}

/**
 * get a page of raw files from atlas
 * VRE-212
 * @param {number} containerId
 * @param {number} pageSize
 * @param {number} page
 */
function getRawFilesAPI(
  containerId,
  pageSize,
  page,
  column,
  text,
  order,
  admin_view,
  entityType,
  filters,
) {
  let params = {
    page,
    pageSize,
    column,
    // text,
    order,
    admin_view,
  };

  if (entityType) params = { ...params, entityType };
  if (!admin_view) params = { ...params, admin_view };
  if (filters && Object.keys(filters).length > 0)
    params = { ...params, filter: JSON.stringify(filters) };

  return axios({
    url: `/v1/files/containers/${containerId}/files/meta`,
    params: objectKeysToSnakeCase(params),
  });
}

/**
 * get a page of processed file on a path
 * @param {number} containerId
 * @param {number} pageSize
 * @param {number} page
 * @param {string} path
 */
function getFilesByTypeAPI(
  containerId,
  pageSize,
  page,
  path,
  column,
  order,
  admin_view,
  entityType,
  filters,
) {
  let pipelineArr = null;
  if (path) pipelineArr = path.split('/');

  let pipeline = null;
  if (pipelineArr && pipelineArr.length > 1)
    pipeline = pipelineArr[pipelineArr.length - 1];

  let params = {
    page,
    pageSize,
    column,
    order,
    container_id: containerId,
  };

  if (pipeline) {
    params.stage = 'processed';
    params.process_pipeline = _.snakeCase(pipeline);
    params['entityType'] = entityType ? entityType : 'nfs_file_processed';
  }

  if (!admin_view) params = { ...params, admin_view };
  if (filters && Object.keys(filters).length > 0)
    params = { ...params, filter: JSON.stringify(filters) };
  return axios({
    url: `/v1/files/containers/${containerId}/files/meta`,
    params: objectKeysToSnakeCase(params),
  });
}

/**
 * check multiple files bulk download status in container
 * @param {number} containerId
 * @param {number} path
 * @param {number} fileName
 */
function checkDownloadStatusAPI(
  containerId,
  taskId,
  removeDownloadListCreator,
  setSuccessNumDispatcher,
  successNum,
) {
  return devOpAxios({
    url: `/v1/containers/${containerId}/file?task_id=${taskId}`,
    method: 'GET',
  })
    .then((res) => {
      const { status } = res.data.result;
      if (status === 'success') {
        removeDownloadListCreator(taskId);
        setSuccessNumDispatcher(successNum + 1);
        // Start to download zip file
        const token = res.data.result['token'];
        const url = `${devOpServerUrl}/v1/files/download?token=${token}`;
        // var link = document.createElement('a');
        // link.style.display = 'none';
        // document.body.appendChild(link);
        // link.setAttribute('download', null);
        // link.setAttribute('href', url);
        // link.click();
        // document.body.removeChild(link);
        window.open(url, '_blank');
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
 */
function downloadFilesAPI(
  containerId,
  files,
  setLoading,
  appendDownloadListCreator,
) {
  return axios({
    url: `/v1/files/containers/${containerId}/file`,
    method: 'POST',
    data: { files: files },
    timeout: 10000000000000000,
  }).then((res) => {
    if (setLoading) {
      setLoading(false);
    }
    if (res.data.result['taskId']) {
      message.info(
        "Preparing download... The file will start to download when it's ready.",
        6,
      );
      let item = {
        downloadKey: res.data.result['taskId'],
        projectId: containerId,
        status: 'pending',
      };
      appendDownloadListCreator(item);
      // Start to check zipping process
    } else {
      const token = res.data.result;
      const url = `${devOpServerUrl}/v1/files/download?token=${token}`;
      window.open(url, '_blank');
    }
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
 * @VRE-314
 */
function projectFileCountTotal(containerId) {
  return axios({
    url: `v1/files/containers/${containerId}/files/count/total`,
  });
}

/**
 * Get daily summary of the file download/upload
 *
 * @param {int} containerId containerId
 * @VRE-315
 */
function projectFileCountToday(containerId, admin_view) {
  if (admin_view === false) {
    return axios({
      url: `v1/files/containers/${containerId}/files/count/daily?admin_view=false`,
      params: {
        action: 'all',
      },
    });
  } else {
    return axios({
      url: `v1/files/containers/${containerId}/files/count/daily`,
      params: {
        action: 'all',
      },
    });
  }
}

/**
 * Get summary of the file download/upload
 *
 * @param {int} containerId containerId
 * @param {string} startDate startDate
 * @param {string} endDate endDate
 * @param {string} user user
 * @param {int} page page
 * @VRE-315
 */
function projectFileSummary(containerId, admin_view, params) {
  // console.log( objectKeysToSnakeCase(...params))
  if (admin_view === false) {
    return axios({
      url: `v1/files/containers/${containerId}/files/count/daily?admin_view=false`,
      params: objectKeysToSnakeCase({ ...params }),
    });
  } else {
    return axios({
      url: `v1/files/containers/${containerId}/files/count/daily`,
      params: objectKeysToSnakeCase({ ...params }),
    });
  }
}

/**
 * List all tags existed in the project and its frequency
 *
 * @param {int} containerId containerId
 * @VRE-314
 */
function listProjectTagsAPI(containerId, query, pattern, length) {
  return devOpAxios({
    url: `/v1/containers/${containerId}/tags`,
    params: { query, pattern, length },
  });
}

/**
 * Add new tags to existed file entities
 *
 * @param {int} containerId containerId
 * @param {dict} data data
 * @VRE-314
 */
function addProjectTagsAPI(containerId, data) {
  return devOpAxios({
    url: `/v1/containers/${containerId}/tags`,
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
 * @VRE-314
 */
function deleteProjectTagsAPI(containerId, params) {
  return devOpAxios({
    url: `/v1/containers/${containerId}/tags`,
    method: 'DELETE',
    data: params
  });
}
export {
  uploadFileApi,
  getFilesAPI,
  listFoldersAndFilesUnderContainerApi,
  createFolderApi,
  getRawFilesAPI,
  downloadFilesAPI,
  checkDownloadStatusAPI,
  checkPendingStatusAPI,
  getFilesByTypeAPI,
  emailUploadedFileListAPI,
  projectFileCountTotal,
  projectFileCountToday,
  preUpload,
  uploadFileApi2,
  combineChunks,
  projectFileSummary,
  checkUploadStatus,
  listProjectTagsAPI,
  deleteUploadStatus,
  addProjectTagsAPI,
  deleteProjectTagsAPI
};
