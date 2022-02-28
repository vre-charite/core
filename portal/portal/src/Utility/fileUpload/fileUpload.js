import { message } from 'antd';
import { combineChunksApi, uploadFileApi2 } from '../../APIs';
import { cancelRequestReg } from '../../APIs/config';
import { ErrorMessager, namespace } from '../../ErrorMessages';
import {
  setNewUploadIndicator,
  updateUploadItemCreator,
  setUploadFileManifest,
} from '../../Redux/actions';
import { store } from '../../Redux/store';
import { sleep } from '../common';
import reduxActionWrapper from '../reduxActionWrapper';
import i18n from '../../i18n';
import { keepAlive } from '../';
import { tokenManager } from '../../Service/tokenManager';
import _ from 'lodash';
import { objectKeysToSnakeCase } from '../';
import { getPath } from './getPath';
import { dcmId } from '../../config';

const USER_LOGOUT = 'user logged out';
const MAX_LENGTH = 1024 * 1024 * 2;
const [
  updateUploadItemDispatcher,
  setNewUploadIndicatorDispatcher,
  setUploadFileManifestDispatcher,
] = reduxActionWrapper([
  updateUploadItemCreator,
  setNewUploadIndicator,
  setUploadFileManifest,
]);

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
  const {
    uploadKey,
    dcmID,
    datasetId,
    uploader,
    file,
    projectCode,
    tags,
    manifest,
    jobId,
    resumableIdentifier,
    toExistingFolder,
    folderPath,
  } = data;

  setNewUploadIndicatorDispatcher();

  let chunks = slice(file, MAX_LENGTH);
  const totalSize = file.size;
  let uploadedSize = 0;
  const sessionId = tokenManager.getCookie('sessionId');
  updateUploadItemDispatcher({
    uploadKey,
    status: 'uploading',
    progress: 0,
    projectId: datasetId,
    fileName: file.name,
    projectCode,
  });

  let relativePath = getPath(file.webkitRelativePath);
  if (toExistingFolder) {
    if (relativePath === '') {
      relativePath = folderPath;
    } else {
      relativePath = folderPath + '/' + relativePath;
    }
  }
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
      resumableIdentifier,
      resumableFilename: file.name.normalize('NFD'),
      resumableRelativePath: relativePath,
      resumableTotalChunks: totalChunks,
      //subPath:subPath||'',
      dcmId: dcmID,
      operator: uploader, // Add uploader
      tags,
      projectCode,
    };
  };

  const sendOneChunk = function (chunk, index) {
    let context = createContext(file, chunk, index, MAX_LENGTH, chunks.length);

    let fd = new FormData();
    fd.append('chunk_data', chunk);

    Object.keys(context).forEach((item) => {
      fd.append(_.snakeCase(item), context[item]);
    });

    const { request } = cancelRequestReg(uploadFileApi2, fd, sessionId);
    return request;
  };

  /**
   * Description: try to resent failed chunk for RETRY_MAX times. Return resolve if one request success, and return reject if all requests failed.
   * @param {Object} chunk Chunk needs to be resented
   * @param {String} index original index of the chunk
   * @param {Number} retries maximum times of retry
   */

  function retry(chunk, index, retries, err = null) {
    if (!retries) {
      return Promise.reject(err);
    }
    return sendOneChunk(chunk, index).catch((err) => {
      return retry(chunk, index, retries - 1, err);
    });
  }

  async function combineChunks() {
    try {
      const reqData = {
        projectCode,
        operator: uploader,
        resumableIdentifier,
        resumableFilename: file.name.normalize('NFD'),
        resumableRelativePath: relativePath,
        resumableTotalChunks: chunks.length,
        resumableTotalSize: file.size,
        tags,
        dcmId: dcmID,
      };

      const result = await combineChunksApi(
        objectKeysToSnakeCase(reqData),
        sessionId,
      );
      manifest &&
        setUploadFileManifestDispatcher({
          manifestId: manifest.id,
          files: [result.data.result.source],
          attributes: manifest && manifest.attributes,
        });
      updateUploadItemDispatcher({
        uploadKey,
        progress: 1,
        status: 'pending',
        jobId,
        projectCode,
        uploadedTime: Date.now(),
      });
      message.success(
        `${i18n.t('success:fileUpload.0')} ${file.name} ${i18n.t(
          'success:fileUpload.1',
        )}`,
      );
    } catch (err) {
      const errorMessage = new ErrorMessager(
        namespace.project.files.combineChunk,
      );
      errorMessage.triggerMsg(null, null, { fileName: file.name });
    }
  }

  // start chunks uploading
  try {
    await Promise.map(
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
              jobId,
            });
            keepAlive();
          })
          .catch(async (err) => {
            const { isLogin } = store.getState();
            if (!isLogin) return Promise.reject(new Error(USER_LOGOUT));
            await sleep(5000);
            return retry(chunk, index, 3);
          });
      },
      {
        concurrency: 3,
      },
    );
  } catch (err) {
    reject();
    if (err.message === USER_LOGOUT) return;

    if (err.response) {
      const errorMessager = new ErrorMessager(
        namespace.project.files.uploadFileApi,
      );
      errorMessager.triggerMsg(err.response.status, null, {
        fileName: file.name,
      });
    } else {
      const errorMessager = new ErrorMessager(
        namespace.project.files.uploadRequestFail,
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
    return;
  }

  await combineChunks();

  setTimeout(() => {
    resolve(); //resolve and start the next file uploading in queue
  }, 2000);
}

export { fileUpload };
