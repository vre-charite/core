import { serverAxios } from './config';
import _ from 'lodash';

/**
 * https://indocconsortium.atlassian.net/browse/VRE-1645
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
 * https://indocconsortium.atlassian.net/browse/VRE-1645
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
    data: {
      dataset_geid: datasetGeid,
      session_id: sessionId,
      operator: operator,
    },
  });
}

export function checkDatasetDownloadStatusAPI(hashCode) {
  return serverAxios({
    url: `/download/vre/v1/download/status/${hashCode}`,
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
    data: {
      dataset_geid: datasetGeid,
      files: fileGeids,
      session_id: sessionId,
      operator: operator,
    },
  });
}
/**
 * https://indocconsortium.atlassian.net/browse/VRE-1645
 * @param {string} datasetGeid
 * @param {*} data
 * @returns
 */
export function updateDatasetInfo(datasetGeid, data) {
  return serverAxios({
    url: `/v1/dataset/${datasetGeid}`,
    data,
    method: 'put',
  }).then((res) => {
    _.set(res, 'data.result', mapBasicInfo(res.data.result));
    return res;
  });
}

export function previewDatasetFile(datasetGeid, fileGeid) {
  return serverAxios({
    url: `/v1/${fileGeid}/preview/`,
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
