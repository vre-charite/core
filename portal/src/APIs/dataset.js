import { serverAxios, serverAxiosNoIntercept } from './config';
import { keycloak } from '../Service/keycloak';
import _ from 'lodash';
import { API_PATH, DOWNLOAD_PREFIX, DOWNLOAD_PREFIX_V1 } from '../config';

/**
 * ticket-1645
 * create a new dataset
 * @param {string} username
 * @param {string} title
 * @param {string} code
 * @param {string[]} authors
 * @param {"GENERAL"|"BIDS"} type
 * @param {string} modality
 * @param {string[]} collectionMethod
 * @param {string} license
 * @param {string[]} tags
 * @param {string} description
 */
export function createDatasetApi(
  username,
  title,
  code,
  authors,
  type = 'GENERAL',
  modality,
  collectionMethod,
  license,
  tags,
  description,
) {
  return serverAxios({
    url: '/v1/dataset',
    method: 'post',
    headers: { 'Refresh-token': keycloak.refreshToken },
    data: {
      username,
      title,
      code,
      authors,
      type,
      modality,
      collection_method: collectionMethod,
      license,
      tags,
      description,
    },
  });
}

/**
 * ticket-1645
 * @param {string} username
 * @param {string} orderBy
 * @param {"desc"|"asc"} orderType
 * @param {number} page starts from 0
 * @param {number} pageSize
 * @param {object} filter
 * @returns
 */
export function getMyDatasetsApi(
  username,
  page = 0,
  pageSize = 10,
  orderBy = 'time_created',
  orderType = 'desc',
  filter = {},
) {
  if (!username) {
    throw new Error('username is not specified');
  }
  return serverAxios({
    url: `/v1/users/${username}/datasets`,
    method: 'post',
    data: {
      filter,
      order_by: orderBy,
      order_type: orderType,
      page,
      page_size: pageSize,
    },
  });
}

export function listDatasetFiles(
  datasetGeid,
  folderGeid,
  page,
  pageSize,
  orderBy,
  orderType,
  query,
) {
  const params = {
    folder_geid: folderGeid,
    page: page,
    page_size: pageSize,
    order_by: orderBy,
    order_type: orderType,
    query: query,
  };
  return serverAxios({
    url: `/v1/dataset/${datasetGeid}/files`,
    params: params,
  });
}

const mapBasicInfo = (result) => {
  const {
    timeCreated,
    creator,
    title,
    authors,
    type,
    modality,
    collectionMethod,
    license,
    code,
    projectGeid = '',
    size,
    totalFiles,
    description,
    globalEntityId: geid,
    tags,
  } = result;

  const basicInfo = {
    timeCreated,
    creator,
    title,
    authors,
    type,
    modality,
    collectionMethod,
    license,
    code,
    projectGeid,
    size,
    totalFiles,
    description,
    geid,
    tags,
  };

  return basicInfo;
};

/**
 *
 * @param {string} datasetCode
 * @returns
 */
export function getDatasetByDatasetCode(datasetCode) {
  return serverAxios({
    url: `/v1/dataset-peek/${datasetCode}`,
  }).then((res) => {
    _.set(res, 'data.result', mapBasicInfo(res.data.result));
    return res;
  });
}

export function deleteDatasetFiles(datasetGeid, geids, operator) {
  return serverAxios({
    url: `/v1/dataset/${datasetGeid}/files`,
    method: 'DELETE',
    headers: { 'Refresh-token': keycloak.refreshToken },
    data: {
      source_list: geids,
      operator: operator,
    },
  });
}

export function moveDatasetFiles(
  datasetGeid,
  sourceGeids,
  targetGeid,
  operator,
) {
  return serverAxios({
    url: `/v1/dataset/${datasetGeid}/files`,
    method: 'POST',
    headers: { 'Refresh-token': keycloak.refreshToken },
    data: {
      source_list: sourceGeids,
      target_geid: targetGeid,
      operator: operator,
    },
  });
}

export function getDatasetActivityLogsAPI(datasetGeid, params) {
  return serverAxios({
    url: `v1/activity-logs/${datasetGeid}`,
    method: 'GET',
    params,
  });
}

export function downloadDataset(datasetGeid, operator, sessionId) {
  return serverAxios({
    url: `/v2/dataset/download/pre`,
    method: 'POST',
    headers: { 'Refresh-token': keycloak.refreshToken },
    data: {
      dataset_geid: datasetGeid,
      session_id: sessionId,
      operator: operator,
    },
  });
}

export function checkDatasetDownloadStatusAPI(hashCode) {
  return serverAxios({
    url: `${DOWNLOAD_PREFIX_V1}/status/${hashCode}`,
    method: 'GET',
  });
}
export function downloadDatasetFiles(
  datasetGeid,
  fileGeids,
  operator,
  sessionId,
) {
  return serverAxios({
    url: `/v2/download/pre`,
    method: 'POST',
    headers: { 'Refresh-token': keycloak.refreshToken },
    data: {
      dataset_geid: datasetGeid,
      files: fileGeids,
      session_id: sessionId,
      operator: operator,
    },
  });
}

export function previewDatasetFile(datasetGeid, fileGeid) {
  return serverAxios({
    url: `/v1/${fileGeid}/preview/`,
    headers: { 'Refresh-token': keycloak.refreshToken },
    method: 'GET',
    params: {
      dataset_geid: datasetGeid,
    },
  });
}

export function previewDatasetFileStream(datasetGeid, fileGeid) {
  return serverAxios({
    url: `/v1/${fileGeid}/preview/stream`,
    method: 'GET',
    params: {
      dataset_geid: datasetGeid,
    },
  });
}

/**
 * get the file operations for file panel in dataset page
 * ticket-1801
 * @param {"move"|"delete"|"rename"|"import"} action
 * @param {string} datasetCode
 * @param {string} sessionId
 * @param {string} operator
 * @returns
 */
export function getFileOperationsApi(action, datasetGeid, sessionId, operator) {
  return serverAxios({
    url: `/v1/dataset/${datasetGeid}/file/tasks`,
    params: {
      action: `dataset_file_${action}`,
      session_id: sessionId,
      operator,
    },
  });
}

export function getDatasetVersionsAPI(datasetGeid, params) {
  return serverAxios({
    url: `/v1/dataset/${datasetGeid}/versions`,
    method: 'GET',
    params,
  });
}

export function publishNewVersionAPI(datasetGeid, operator, notes, version) {
  return serverAxios({
    url: `/v1/dataset/${datasetGeid}/publish`,
    method: 'POST',
    data: {
      operator,
      notes,
      version,
    },
  });
}

export function datasetDownloadReturnURLAPI(datasetGeid, version) {
  return serverAxios({
    url: `/v1/dataset/${datasetGeid}/download/pre`,
    method: 'GET',
    params: {
      version,
    },
  });
}

export function datasetDownloadAPI(hash) {
  return serverAxios({
    url: `${DOWNLOAD_PREFIX}/${hash}`,
    method: 'GET',
    headers: { 'Refresh-token': keycloak.refreshToken },
  }).then((res) => {
    const url = API_PATH + DOWNLOAD_PREFIX + '/' + hash;
    window.open(url, '_blank');
  });
}

export function datasetVersionLogs(datsetGeid, params) {
  return serverAxios({
    url: `v1/activity-logs/version/${datsetGeid}`,
    method: 'GET',
    params,
  });
}

export function checkPublishStatusAPI(datasetGeid, statusId) {
  return serverAxios({
    url: `/v1/dataset/${datasetGeid}/publish/status`,
    method: 'GET',
    params: {
      status_id: statusId,
    },
  });
}

/**
 * ticket-1702
 * rename a file or folder's name
 * @param {string} datasetGeid
 * @param {string} fileGeid
 * @param {string} newName
 * @param {string} operator
 */
export function renameFileApi(datasetGeid, fileGeid, newName, operator) {
  return serverAxios({
    url: `/v1/dataset/${datasetGeid}/files/${fileGeid}`,
    method: 'post',
    data: { new_name: newName, operator },
    headers: { 'Refresh-token': keycloak.refreshToken },
  });
}

export function getDefaultSchemaTPLDetail(tplGeid) {
  return serverAxiosNoIntercept({
    url: `/v1/dataset/schemaTPL/default/${tplGeid}`,
    method: 'GET',
  });
}

export function getCustomSchemaTPLDetail(datasetGeid, tplGeid) {
  return serverAxiosNoIntercept({
    url: `/v1/dataset/${datasetGeid}/schemaTPL/${tplGeid}`,
    method: 'GET',
  });
}

export function getSchemaDataDetail(datasetGeid, schemaDataGeid) {
  return serverAxiosNoIntercept({
    url: `/v1/dataset/${datasetGeid}/schema/${schemaDataGeid}`,
    method: 'GET',
  });
}

export function createSchemaData(
  datasetGeid,
  systemDefined,
  standard,
  schemaName,
  content,
  tplGeid,
  creator,
  isDraft,
) {
  return serverAxios({
    url: `/v1/dataset/${datasetGeid}/schema`,
    method: 'post',
    data: {
      name: schemaName,
      dataset_geid: datasetGeid,
      tpl_geid: tplGeid,
      standard: standard,
      system_defined: systemDefined,
      is_draft: isDraft,
      content: content,
      creator: creator,
      activity: [
        {
          action: 'CREATE',
          resource: 'Schema',
          detail: {
            name: schemaName,
          },
        },
      ],
    },
  });
}
export function deleteDatasetSchemaData(datasetGeid, schemaGeid, schemaName) {
  return serverAxios({
    url: `/v1/dataset/${datasetGeid}/schema/${schemaGeid}`,
    method: 'DELETE',
    data: {
      activity: [
        {
          action: 'REMOVE',
          resource: 'Schema',
          detail: {
            name: schemaName,
          },
        },
      ],
    },
  });
}
export function getDatasetSchemaListAPI(datasetGeid) {
  return serverAxios({
    url: `/v1/dataset/${datasetGeid}/schema/list`,
    method: 'post',
    data: {},
  });
}

export function getDatasetDefaultSchemaTemplateListAPI() {
  return serverAxios({
    url: `/v1/dataset/schemaTPL/default/list`,
    method: 'post',
    data: {},
  });
}
export function getDatasetCustomSchemaTemplateListAPI(datasetGeid) {
  return serverAxios({
    url: `/v1/dataset/${datasetGeid}/schemaTPL/list`,
    method: 'post',
    data: {},
  });
}
export function createDatasetSchemaTPL(
  datasetGeid,
  tplName,
  tplContent,
  creator,
) {
  return serverAxios({
    url: `/v1/dataset/${datasetGeid}/schemaTPL`,
    method: 'post',
    data: {
      name: tplName,
      dataset_geid: datasetGeid,
      standard: 'default',
      system_defined: false,
      is_draft: false,
      content: tplContent,
      creator: creator,
      activity: [
        {
          action: 'ADD',
          resource: 'Dataset.Schema.Template',
          detail: {
            name: tplName,
          },
        },
      ],
    },
  });
}
/**
 * ticket-1852
 * update the dataset schema form data
 * @param {string} datasetGeid
 * @param {string} schemaGeid
 * @param {string} schemaName like essential.schema.json
 * @param {object} content the whole content of the form data
 * @param {*} activity
 * @returns
 */
export function updateDatasetSchemaDataApi(
  datasetGeid,
  schemaGeid,
  schemaName,
  isDraft,
  content,
  activity,
) {
  return serverAxios({
    url: `/v1/dataset/${datasetGeid}/schema/${schemaGeid}`,
    method: 'PUT',
    data: {
      name: schemaName,
      dataset_geid: datasetGeid,
      is_draft: isDraft,
      content,
      activity,
    },
  });
}

export function preValidateBids(datasetGeid) {
  return serverAxios({
    url: '/v1/dataset/bids-validate',
    method: 'POST',
    headers: { 'Refresh-token': keycloak.refreshToken },
    data: {
      dataset_geid: datasetGeid,
    },
  });
}

export function getBidsResult(datasetGeid) {
  return serverAxios({
    url: `/v1/dataset/bids-validate/${datasetGeid}`,
  });
}
