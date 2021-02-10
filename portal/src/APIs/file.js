import {
  serverAxiosNoIntercept,
  serverAxios as axios,
  devOpServer as devOpAxios,
  devOpServerUrl,
  devOpServer,
} from './config';
import { objectKeysToSnakeCase } from '../Utility';
import { message } from 'antd';
import _ from 'lodash';
import { pipelines } from '../Utility/pipelines';

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

function checkDownloadStatus(sessionId) {
  return devOpAxios({
    url: `/v1/download-state`,
    method: 'GET',
    headers: {
      'Session-ID': `DOWNLOAD${sessionId}`,
    },
    params: {
      container_id: 0,
    },
  });
}

function deleteDownloadStatus(sessionId) {
  return devOpAxios({
    url: `/v1/download-state`,
    method: 'DELETE',
    headers: {
      'Session-ID': `DOWNLOAD${sessionId}`,
    },
    params: {
      container_id: 0,
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

function getFileManifestAttrs(filePaths, lineageView = false) {
  return serverAxiosNoIntercept({
    url: `/v1/file/manifest/query`,
    method: 'POST',
    data: {
      file_paths: filePaths,
      lineage_view: lineageView
    },
  });
}

function getLabels(paths) {
  const ZoneMap = {
    greenroom: 'Greenroom',
    core: 'VRECore',
  };
  const zoneLabel = ZoneMap[paths[0]];
  const relevant_path = paths
    .slice(1)
    .map((v) => _.snakeCase(v))
    .join('/');
  if (relevant_path === 'trash') {
    return [zoneLabel, 'TrashFile'];
  }

  const labels = ['File'];
  labels.push(zoneLabel);
  if (zoneLabel === 'Greenroom') {
    if (paths.find((p) => p.toLowerCase() === 'processed')) {
      labels.push('Processed');
    }
    if (paths.find((p) => p.toLowerCase() === 'raw')) {
      labels.push('Raw');
    }
  }

  return labels;
}
/**
 * get a page of processed file on a path
 * @param {number} containerId
 * @param {number} pageSize
 * @param {number} page
 * @param {string} path
 */
async function getFilesByTypeAPI(
  containerId,
  pageSize,
  page,
  pipeline,
  column,
  order,
  role,
  username,
  activePane,
  filters,
) {
  const columnMap = {
    createTime: 'time_created',
    fileName: 'name',
    owner: 'uploader',
    fileSize: 'file_size',
    generateID: 'generate_id',
  };
  let params = {
    page,
    page_size: pageSize,
    order_by: columnMap[column] ? columnMap[column] : column,
    order_type: order,
    partial: true,
    query: {},
  };
  if (activePane) {
    const paths = activePane.split('-');
    const labels = getLabels(paths);
    const relevant_path = paths
      .slice(1)
      .map((v) => _.snakeCase(v))
      .join('/');
    if (relevant_path === 'trash') {
      params.query.labels = labels;
    } else {
      params.query.archived = false;
      params.query.path = relevant_path;
      params.query.labels = labels;
      if (
        pipeline === pipelines['DATA_COPY'] ||
        pipeline === pipelines['GENERATE_PROCESS'] ||
        pipeline === pipelines['DATA_DELETE']
      ) {
        params.query.process_pipeline = _.snakeCase(pipeline);
      }
    }
    if (labels.indexOf('Greenroom') !== -1 && role === 'collaborator') {
      params.query.uploader = username;
    }
    if (role === 'contributor') {
      params.query.uploader = username;
    }
    if (filters && filters.fileName) {
      params.query.name = filters.fileName;
      params.partial = true;
    }
    if (filters && filters.owner) {
      params.query.uploader = filters.owner;
      params.partial = true;
    }
    if (filters && filters.generateID) {
      params.query.generate_id = filters.generateID;
      params.partial = true;
    }
  }

  let res = await axios({
    url: `/v2/files/containers/${containerId}/files/meta`,
    params: objectKeysToSnakeCase(params),
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
  if (activePane && activePane === 'greenroom-raw') {
    const filePaths = res.data.result.entities.map(
      (e) => e.attributes.qualifiedName,
    );
    let attrsMap = await getFileManifestAttrs(filePaths);
    attrsMap = attrsMap.data.result;
    res.data.result.entities = res.data.result.entities.map((entity) => {
      return {
        ...entity,
        manifest:
          attrsMap[entity.attributes.qualifiedName] &&
          attrsMap[entity.attributes.qualifiedName].length
            ? attrsMap[entity.attributes.qualifiedName]
            : null,
      };
    });
  }
  return res;
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
  updateDownloadItemDispatch,
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
        updateDownloadItemDispatch({ key: taskId, status: 'success' });
        setSuccessNumDispatcher(successNum + 1);
        // Start to download zip file
        const token = res.data.result['token'];
        const url = `${devOpServerUrl}/v1/files/download?token=${token}`;
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
  sessionId,
) {
  return axios({
    url: `/v1/files/containers/${containerId}/file`,
    method: 'POST',
    data: { files: files },
    timeout: 10000000000000000,
    headers: {
      'Session-ID': `DOWNLOAD${sessionId}`,
    },
  }).then((res) => {
    if (setLoading) {
      setLoading(false);
    }
    if (res.data.result['taskId']) {
      message.info(
        "Your download is being prepared...The file will start to download when it's ready.",
        6,
      );
      let item = {
        downloadKey: res.data.result['taskId'],
        container: res.data.result['container'],
        status: 'pending',
        filename: res.data.result['taskId'],
        projectId: containerId,
      };
      appendDownloadListCreator(item);
      // Start to check zipping process
    } else {
      const token = res.data.result;

      let item = {
        downloadKey: res.data.result,
        container: res.data.container,
        status: 'success',
        filename: res.data.filename,
        projectId: containerId,
      };
      appendDownloadListCreator(item);

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
function updateProjectTagsAPI(containerId, data) {
  return devOpAxios({
    url: `/v2/containers/${containerId}/tags`,
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
    url: `/v2/containers/${containerId}/tags`,
    method: 'DELETE',
    data: params,
  });
}

function fileLineageAPI(key, typeName, direction) {
  return axios({
    url: `/v1/lineage`,
    method: 'GET',
    params: { full_path: key, direction, type_name: typeName },
  });
}

function fileAuditLogsAPI(params) {
  return devOpAxios({
    url: `/v1/file/actions/logs`,
    method: 'GET',
    params,
  });
}

function copyFiles(inputFiles, projectCode, operator, sessionId, opType) {
  return devOpAxios({
    url: `/v1/file/actions/transfer-to-core`,
    method: 'POST',
    data: {
      input_files: inputFiles,
      project_code: projectCode,
      operator: operator,
      session_id: sessionId,
      operation_type: opType,
    },
  });
}

function addToVirtualFolder(folderId, geids) {
  return axios({
    url: `/v1/vfolder/${folderId}/files`,
    method: 'POST',
    data: {
      geids: geids,
    },
  });
}

function removeFromVirtualFolder(folderId, geids) {
  return axios({
    url: `/v1/vfolder/${folderId}/files`,
    method: 'DELETE',
    data: {
      geids: geids,
    },
  });
}

function getZipContentAPI(file) {
  return devOpServer({
    url: '/v1/archive',
    params: {
      file_path: file,
    },
  });
}

function deleteFileAPI(data) {
  return axios({
    url: '/v1/files/actions',
    method: 'DELETE',
    data,
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
  updateProjectTagsAPI,
  deleteProjectTagsAPI,
  fileLineageAPI,
  checkDownloadStatus,
  deleteDownloadStatus,
  copyFiles,
  addToVirtualFolder,
  removeFromVirtualFolder,
  fileAuditLogsAPI,
  getZipContentAPI,
  deleteFileAPI,
  getFileManifestAttrs,
};
