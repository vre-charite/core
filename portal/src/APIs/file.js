import {
  serverAxiosNoIntercept,
  serverAxios as axios,
  devOpServer as devOpAxios,
  devOpServerUrl,
  devOpServer,
  kongAPI,
  uploadAxios,
} from './config';
import { objectKeysToSnakeCase } from '../Utility';
import { message } from 'antd';
import _ from 'lodash';
import { pipelines } from '../Utility/pipelines';

const GREENROOM_DOWNLOAD_URL = kongAPI + '/download/gr/v1/download';
const VRE_CORE_DOWNLOAD_URL = kongAPI + '/download/vre/v1/download';

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
  return devOpAxios({
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
    return [zoneLabel + ':TrashFile'];
  }

  let fileLabel = null;
  if (zoneLabel === 'Greenroom') {
    if (paths.find((p) => p.toLowerCase() === 'processed')) {
      fileLabel = 'Processed';
    }
    if (paths.find((p) => p.toLowerCase() === 'raw')) {
      fileLabel = 'Raw';
    }
  }
  if (zoneLabel === 'Greenroom' && fileLabel === 'Raw') {
    const prefix = zoneLabel + ':' + fileLabel;
    return [prefix + ':File', zoneLabel + ':Folder'];
  } else {
    const prefix = fileLabel ? zoneLabel + ':' + fileLabel : zoneLabel;
    return [prefix + ':File'];
  }
}
function getLabelsNew(paths) {
  const ZoneMap = {
    greenroom: 'Greenroom',
    core: 'VRECore',
  };
  const zoneLabel = ZoneMap[paths[0]];

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
async function getFilesByFolderAPI(
  geid,
  pageSize,
  page,
  column,
  order,
  activePane,
  filters,
) {
  if (!activePane) {
    return;
  }
  const paths = activePane.split('-');
  const labels = getLabelsNew(paths);
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
    zone: labels[1],
  };
  if (labels[2]) {
    params['datatype'] = labels[2];
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

  let res = await axios({
    url: `/v1/files/entity/folder/${geid}`,
    params: objectKeysToSnakeCase(params),
  });

  const entities = res.data.result.data.map((item) => {
    console.log(item);
    let typeName =
      item.labels.indexOf('Raw') !== -1 ? 'nfs_file' : 'nfs_file_processed';
    let formatRes = {
      displayText: item.fullPath,
      guid: item.guid,
      geid: item.globalEntityId,
      typeName: typeName,
      attributes: {
        createTime: item.timeCreated,
        nodeLabel: item.labels,
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
    routing: res.data.result.routing,
  };
  console.log(entities);
  return res;
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
    query: {},
  };
  if (activePane) {
    const paths = activePane.split('-');
    const labels = getLabels(paths);
    const relevant_path = paths
      .slice(1)
      .map((v) => _.snakeCase(v))
      .join('/');
    let conditions = {};
    if (relevant_path !== 'trash') {
      if (
        pipeline === pipelines['DATA_COPY'] ||
        pipeline === pipelines['GENERATE_PROCESS'] ||
        pipeline === pipelines['DATA_DELETE']
      ) {
        conditions.process_pipeline = _.snakeCase(pipeline);
      }
    }
    if (labels[0].indexOf('Greenroom') !== -1 && role === 'collaborator') {
      conditions.uploader = username;
    }
    if (role === 'contributor') {
      conditions.uploader = username;
    }
    if (filters && filters.fileName) {
      conditions.name = filters.fileName;
      conditions.partial = conditions.partial
        ? [...conditions.partial, 'name']
        : ['name'];
    }
    if (filters && filters.owner) {
      conditions.uploader = filters.owner;
      conditions.partial = conditions.partial
        ? [...conditions.partial, 'uploader']
        : ['uploader'];
    }
    if (filters && filters.generateID) {
      conditions.generate_id = filters.generateID;
      conditions.partial = conditions.partial
        ? [...conditions.partial, 'generate_id']
        : ['generate_id'];
    }
    params.query = {
      labels: labels,
    };
    for (let label of labels) {
      if (label.indexOf('Folder') !== -1) {
        let conditionsTemp = {
          name: conditions['name'],
          uploader: conditions['uploader'],
          partial: conditions['partial'],
          folder_level: 0,
        };
        params.query[label] = conditionsTemp;
      } else {
        params.query[label] = conditions;
        if (relevant_path !== 'trash') {
          params.query[label].archived = false;
        }
      }
    }
  }

  let res = await axios({
    url: `/v3/files/containers/${containerId}/files/meta`,
    method: 'POST',
    data: params,
  });
  const entities = res.data.result.map((item) => {
    let typeName = item.fullPath
      ? item.labels.indexOf('Raw') !== -1
        ? 'nfs_file'
        : 'nfs_file_processed'
      : null;
    let formatRes = {
      displayText: item.fullPath,
      guid: item.guid,
      geid: item.globalEntityId,
      typeName: typeName,
      attributes: {
        createTime: item.timeCreated,
        nodeLabel: item.labels,
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
    const geidsList = res.data.result.entities
      .filter((e) => e.displayText)
      .map((e) => e.geid);
    let attrsMap = await getFileManifestAttrs(geidsList);
    attrsMap = attrsMap.data.result;

    res.data.result.entities = res.data.result.entities.map((entity) => {
      return {
        ...entity,
        manifest:
          attrsMap[entity.geid] && attrsMap[entity.geid].length
            ? attrsMap[entity.geid]
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
  taskId,
  hashCode,
  namespace,
  updateDownloadItemDispatch,
  setSuccessNumDispatcher,
  successNum,
) {
  if (namespace === 'greenroom') {
    return axios({
      url: `/download/gr/v1/download/status/${hashCode}`,
      method: 'GET',
    })
      .then((res) => {
        const { status } = res.data.result;
        if (status === 'READY_FOR_DOWNLOADING') {
          updateDownloadItemDispatch({ key: taskId, status: 'success' });

          // Start to download zip file
          const url = `${GREENROOM_DOWNLOAD_URL}/${hashCode}`;
          window.open(url, '_blank');
          setTimeout(() => {
            setSuccessNumDispatcher(successNum + 1);
          }, 3000);
        } else if (status === 'error') {
          // Stop check status
        }
      })
      .catch((err) => {
        console.log(err);
      });
  } else {
    return axios({
      url: `/download/vre/v1/download/status/${hashCode}`,
      method: 'GET',
    })
      .then((res) => {
        const { status } = res.data.result;
        if (status === 'READY_FOR_DOWNLOADING') {
          updateDownloadItemDispatch({ key: taskId, status: 'success' });

          // Start to download zip file
          const url = `${VRE_CORE_DOWNLOAD_URL}/${hashCode}`;
          window.open(url, '_blank');
          setTimeout(() => {
            setSuccessNumDispatcher(successNum + 1);
          }, 3000);
        } else if (status === 'error') {
          // Stop check status
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }
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
  projectCode,
  operator,
  namespace,
) {
  if (namespace === 'greenroom') {
    return axios({
      url: 'download/gr/v1/download/pre/',
      method: 'POST',
      data: {
        files: files,
        project_code: projectCode,
        operator,
        session_id: sessionId,
      },
      timeout: 10000000000000000,
      headers: {
        'Session-ID': `${sessionId}`,
      },
    }).then((res) => {
      if (setLoading) {
        setLoading(false);
      }
      if (res.data.result.status !== 'READY_FOR_DOWNLOADING') {
        message.info(
          "Your download is being prepared...The file will start to download when it's ready.",
          6,
        );

        let fileName = res.data.result.source;
        const fileNamesArr = fileName.split('/') || [];
        fileName = fileNamesArr.length && fileNamesArr[fileNamesArr.length - 1];

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
      } else {
        const token =
          res.data.result.payload && res.data.result.payload.hashCode;

        let fileName = res.data.result.source;
        const fileNamesArr = fileName.split('/') || [];
        fileName = fileNamesArr.length && fileNamesArr[fileNamesArr.length - 1];

        let item = {
          downloadKey: res.data.result.jobId,
          container: res.data.result.project_code,
          status: 'success',
          filename: fileName,
          projectId: containerId,
          namespace,
          createdTime: Date.now(),
        };
        appendDownloadListCreator(item);

        const url = `${GREENROOM_DOWNLOAD_URL}/${token}`;
        // window.open(url, '_blank');
        return url;
      }
    });
  } else {
    return axios({
      url: 'download/vre/v1/download/pre/',
      method: 'POST',
      data: {
        files: files,
        project_code: projectCode,
        operator,
        session_id: sessionId,
      },
      timeout: 10000000000000000,
      headers: {
        'Session-ID': `${sessionId}`,
      },
    }).then((res) => {
      if (setLoading) {
        setLoading(false);
      }
      if (res.data.result.status !== 'READY_FOR_DOWNLOADING') {
        message.info(
          "Your download is being prepared...The file will start to download when it's ready.",
          6,
        );

        let fileName = res.data.result.source;
        const fileNamesArr = fileName.split('/') || [];
        fileName = fileNamesArr.length && fileNamesArr[fileNamesArr.length - 1];

        let item = {
          downloadKey: res.data.result['jobId'],
          container: res.data.result.project_code,
          status: 'pending',
          filename: fileName,
          projectId: containerId,
          hashCode: res.data.result.payload.hashCode,
          namespace,
          createdTime: Date.now(),
        };
        appendDownloadListCreator(item);
        return null;
      } else {
        const token =
          res.data.result.payload && res.data.result.payload.hashCode;

        let fileName = res.data.result.source;
        const fileNamesArr = fileName.split('/') || [];
        fileName = fileNamesArr.length && fileNamesArr[fileNamesArr.length - 1];

        let item = {
          downloadKey: res.data.result.jobId,
          container: res.data.result.project_code,
          status: 'success',
          filename: fileName,
          projectId: containerId,
          namespace,
          createdTime: Date.now(),
        };
        appendDownloadListCreator(item);

        const url = `${VRE_CORE_DOWNLOAD_URL}/${token}`;
        // window.open(url, '_blank');
        return url;
      }
    });
  }
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
    url: `v2/files/containers/${containerId}/files/count`,
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
  getFilesByFolderAPI,
  emailUploadedFileListAPI,
  projectFileCountTotal,
  projectFileCountToday,
  preUploadApi,
  uploadFileApi2,
  combineChunksApi,
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
