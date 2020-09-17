import {
  serverAxios as axios,
  devOpServer as devOpAxios,
  devOpServerUrl,
} from './config';
import { objectKeysToSnakeCase, apiErrorHandling } from '../Utility';
import { message } from 'antd';
import namespace from '../ErrorMessages';
import Axios from 'axios';

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

function preUpload(containerId, data) {
  return devOpAxios({
    url: `/v1/upload/containers/${containerId}/pre`,
    method: 'POST',
    data,
  });
}

function combineChunks(containerId, data) {
  return devOpAxios({
    url: `/v1/upload/containers/${containerId}/on-success`,
    method: 'POST',
    data,
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
function getProcessedFilesAPI(
  containerId,
  pageSize,
  page,
  path,
  column,
  text,
  order,
  entityType,
) {
  const pipelineArr = path.split('/');
  const pipeline = pipelineArr[pipelineArr.length - 1];

  let params = {
    page,
    pageSize,
    stage: 'processed',
    column,
    text,
    order,
    pipeline: pipeline,
    container_id: containerId,
  };
  if (entityType) params = { ...params, entityType };

  return axios({
    url: `/v1/files/files/processed`,
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
) {
  return devOpAxios({
    url: `/v1/containers/${containerId}/file?task_id=${taskId}`,
    method: 'GET',
  }).then((res) => {
    const { status } = res.data.result;
    if (status === 'success') {
      removeDownloadListCreator(taskId);
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
  }).then((res) => {
    if (setLoading) {
      setLoading(false);
    }
    if (res.data.result['task_id']) {
      message.info(
        "Preparing download... The file will start to download when it's ready.",
        6,
      );
      let item = {
        downloadKey: res.data.result['task_id'],
        projectId: containerId,
        status: 'pending',
      };
      appendDownloadListCreator(item);
      // Start to check zipping process
    } else {
      const token = res.data.result;
      const url = `${devOpServerUrl}/v1/files/download?token=${token}`;
      // var link = document.createElement('a');
      // link.style.display = 'none';
      // document.body.appendChild(link);
      // link.setAttribute('download', null);
      // link.setAttribute('href', url);
      // link.click();
      // document.body.removeChild(link);
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
  // return devOpAxios({
  //   url: `/v1/containers/${containerId}/files`,
  //   params: objectKeysToSnakeCase({
  //     taskId,
  //   }),
  // });
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
    });
  } else {
    return axios({
      url: `v1/files/containers/${containerId}/files/count/daily`,
    });
  }
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
  getProcessedFilesAPI,
  emailUploadedFileListAPI,
  projectFileCountTotal,
  projectFileCountToday,
  preUpload,
  uploadFileApi2,
  combineChunks,
};
