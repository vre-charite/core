import { message } from 'antd';
import { v4 as uuidv4 } from 'uuid';
import { combineChunks, preUpload, uploadFileApi2 } from '../../APIs';
import { cancelRequestReg } from '../../APIs/config';
import { ErrorMessager, namespace } from '../../ErrorMessages';
import {
  setNewUploadIndicator,
  updateUploadItemCreator,
} from '../../Redux/actions';
import { store } from '../../Redux/store';
import { sleep } from '../common';
import reduxActionWrapper from '../reduxActionWrapper';
import i18n from '../../i18n';
import {uploadAction} from '../'
const USER_LOGOUT = 'user logged out';
const [
  updateUploadItemDispatcher,
  setNewUploadIndicatorDispatcher,
] = reduxActionWrapper([updateUploadItemCreator, setNewUploadIndicator]);
const _ = require('lodash');

const Promise = require('bluebird');

/**
 * Slice files into chunks
 * Author: 橙红年代
 * https://juejin.im/post/5cf765275188257c6b51775f
 *
 * @param {array} file file[]
 * @param {number} [piece=1024 * 1024 * 5]
 * @returns chunks
 */

function slice(file, piece = 1024 * 1024 * 5) {
  let totalSize = file.size;
  let start = 0; // starting byte for each chunk
  let end = start + piece; // ending byte for each chunk
  let chunks = [];
  while (start < totalSize) {
    // slice file into chunks with piece size.
    // Inherited from Blob object, file has slice function
    let blob = file.slice(start, end);
    chunks.push(blob);

    start = end;
    end = start + piece;
  }
  return chunks;
}

/**
 *
 * @param {*} data
 * @param {*} resolve
 * @param {*} reject
 */
async function fileUpload(data, resolve, reject) {
  const MAX_LENGTH = 1024 * 1024 * 2;
  const uuid = uuidv4();
  const {
    uploadKey,
    generateID,
    datasetId,
    uploader,
    file,
    projectCode,
    tags,
  } = data;

  setNewUploadIndicatorDispatcher();

  let chunks = slice(file, MAX_LENGTH);
  //message.info(`File ${file.name} starts uploading process`)
  const totalSize = file.size;
  let taskId = null;
  let uploadedSize = 0;

  updateUploadItemDispatcher({
    uploadKey,
    status: 'uploading',
    progress: 0,
    projectId: datasetId,
    fileName: file.name,
    projectCode,
  });

  const createContext = function (
    file,
    chunk,
    index,
    chunkLength,
    totalChunks,
    subPath,
  ) {
    return {
      resumableChunkNumber: index + 1,
      resumableChunkSize: chunkLength,
      resumableCurrentChunkSizef: chunk.size,
      resumableTotalSize: file.size,
      resumableType: file.type,
      resumableIdentifier: file.uid + uuid,
      resumableFilename: file.name,
      resumableRelativePath: file.name,
      resumableTotalChunks: totalChunks,
      //subPath:subPath||'',
      generateID, // Add generate ID
      uploader, // Add uploader
    };
  };

  const sendOneChunk = function (chunk, index) {
    let context = createContext(file, chunk, index, MAX_LENGTH, chunks.length);

    let fd = new FormData();
    fd.append('file', chunk);

    Object.keys(context).forEach((item) => {
      fd.append(item, context[item]);
    });
    fd.append('chunk', index + 1);

    const { request } = cancelRequestReg(uploadFileApi2, datasetId, fd);
    return request;
  };

  /**
   * Description: try to resent failed chunk for RETRY_MAX times. Return resolve if one request success, and return reject if all requests failed.
   * @param {Object} chunk Chunk needs to be resented
   * @param {String} index original index of the chunk
   * @param {Number} RETRY_MAX maximum times of retry
   */
  const retry = (chunk, index, RETRY_MAX) => {
    let arr = [];
    for (let i = 0; i < RETRY_MAX; i++) {
      arr.push(sendOneChunk(chunk, index));
    }
    return Promise.any(arr);
  };
  const bodyFormData = new FormData();
  bodyFormData.append('resumableIdentifier', file.uid + uuid);
  bodyFormData.append('resumableFilename', file.name);
  if (generateID) bodyFormData.append('generateID', generateID);
  const sessionId = localStorage.getItem('sessionId');
  preUpload(datasetId, bodyFormData, sessionId)
    .then((preRes) => {
      Promise.map(
        chunks,
        function (chunk, index) {
          return sendOneChunk(chunk, index)
            .then(async (res) => {
              uploadedSize += chunk.size;
              updateUploadItemDispatcher({
                uploadKey,
                progress: uploadedSize / totalSize,
                status: 'uploading',
                projectCode,
                taskId: preRes.data && preRes.data.result && preRes.data.result.taskId
              });
              uploadAction();
            })
            .catch(async (err) => {
              const { isLogin } = store.getState();
              if (!isLogin) return Promise.reject(new Error(USER_LOGOUT));
              await sleep(5000);
              retry(chunk, index, 3);
            });
        },
        {
          concurrency: 3,
        },
      )
        .then(async function (res) {
          resolve();
          const formData = new FormData();
          formData.append('resumableIdentifier', file.uid + uuid);
          formData.append('resumableFilename', file.name);
          formData.append('resumableTotalChunks', chunks.length);
          formData.append('resumableTotalSize', file.size);
          formData.append('uploader', uploader);
          if (tags) formData.append('tags', tags);
          if (generateID) formData.append('generateID', generateID);
          const result = await combineChunks(datasetId, formData, sessionId);
          if (
            result.status === 200 &&
            result.data &&
            result.data.result &&
            result.data.result.taskId
          ) {
            taskId = result.data.result.taskId;
          }
          if (!taskId) {
            await sleep(1000);

            const checkedResult = await combineChunks(
              datasetId,
              formData,
              sessionId,
            );
            if (
              checkedResult.status === 200 &&
              checkedResult.data &&
              checkedResult.data.result &&
              checkedResult.data.result.taskId
            ) {
              taskId = checkedResult.data.result.taskId;
            } else {
              throw new Error(`the task Id doesn't exist`);
            }
          }
          updateUploadItemDispatcher({
            uploadKey,
            progress: 1,
            status: 'pending',
            taskId: preRes.data && preRes.data.result && preRes.data.result.taskId,
            projectCode,
            uploadedTime: Date.now(),
          });
          message.success(
            `${i18n.t('success:fileUpload.0')} ${file.name} ${i18n.t(
              'success:fileUpload.1',
            )}`,
          );
        })
        .catch((err) => {
          reject();
          if (err.message === USER_LOGOUT) return;
          if (err.response) {
            const errorMessager = new ErrorMessager(
              namespace.dataset.files.uploadFileApi,
            );
            errorMessager.triggerMsg(err.response.status, null, {
              fileName: file.name,
            });
          } else {
            const errorMessager = new ErrorMessager(
              namespace.dataset.files.uploadRequestFail,
            );
            errorMessager.triggerMsg(null, null, { fileName: file.name });
          }
          updateUploadItemDispatcher({
            uploadKey,
            progress: uploadedSize / totalSize,
            status: 'error',
            uploadedTime: Date.now(),
            projectCode,
          });
        });
    })
    .catch((err) => {
      reject();
      const errorMessager = new ErrorMessager(
        namespace?.dataset?.files?.preUpload,
      );
      errorMessager.triggerMsg(err?.response?.status, null, {
        fileName: file.name,
      });
      updateUploadItemDispatcher({
        uploadKey,
        progress: uploadedSize / totalSize,
        status: 'error',
        uploadedTime: Date.now(),
        projectCode,
      });
    });
}

export { fileUpload };
