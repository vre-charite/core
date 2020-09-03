import { message } from 'antd';
import { cancelRequestReg } from '../../APIs/config';
// import { uploadFileApi, checkUploadStatusApi } from "../Api";
import { uploadFileApi, preUpload, uploadFileApi2, combineChunks } from '../../APIs';
import {
  appendUploadListCreator,
  updateUploadItemCreator,
  setNewUploadIndicator,
} from '../../Redux/actions';
import { objectKeysToCamelCase } from '..';
import reduxActionWrapper from '../reduxActionWrapper';
import { namespace, ErrorMessager } from '../../ErrorMessages';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';

const [
  appendUploadListDispatcher,
  updateUploadItemDispatcher,
  setNewUploadIndicatorDispatcher,
] = reduxActionWrapper([
  appendUploadListCreator,
  updateUploadItemCreator,
  setNewUploadIndicator,
]);
const _ = require('lodash');

var Promise = require('bluebird');

async function fileUpload(data, resolve, reject) {
  const MAX_LENGTH = 1024 * 1024 * 4;
  const uuid = uuidv4();
  const { uploadKey, generateID, datasetId, uploader, file } = data;

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

    const { source, request } = cancelRequestReg(uploadFileApi2, datasetId, fd);
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

  preUpload(datasetId, bodyFormData)
    .then((res) => {
      Promise.map(
        chunks,
        function (chunk, index) {
          return sendOneChunk(chunk, index)
            .then(async (res) => {
              // const { result } = objectKeysToCamelCase(res.data);
              // if (result.taskId) {
              //   taskId = result.taskId;
              // }
              uploadedSize += chunk.size;
    
              if ((uploadedSize / totalSize) === 1) {
                // const formData = new FormData();
                // formData.append('resumableIdentifier', file.uid + uuid);
                // formData.append('resumableFilename', file.name);
                // formData.append('resumableTotalChunks', chunks.length);
                // formData.append('resumableTotalSize', file.size);
                // formData.append('uploader', uploader);
                
                // if (generateID) formData.append('generateID', generateID);
    
                // const result = await combineChunks(datasetId, formData);
                // if (result.status === 200 && result.data && result.data.result && result.data.result.task_id) {
                //   taskId = result.data.result.task_id;
                // } 
              } else {
                updateUploadItemDispatcher({
                  uploadKey,
                  progress: uploadedSize / totalSize,
                  status: 'uploading',
                });
              }
            })
            .catch((err) => {
              // Retry when file upload fails on 401 or unstable internet (ECONNABORTED)
              // If anything wrong with the file itself(e.g. repeated file name/illegal file name)
              // The upload should stop
              console.log(err);
              if (err.code === 'ECONNABORTED' || err.response.status === 401 || err.response.status === 403) {
                return retry(chunk, index, 1); // Max retry times is 1
              } else {
                /* if (err.response) {
                  const errorMessager = new ErrorMessager(
                    namespace.dataset.files.uploadFileApi,
                  );
                  errorMessager.triggerMsg(err.response.status,null,{fileName:file.name});
                }else{
                  const errorMessager = new ErrorMessager(namespace.dataset.files.uploadRequestFail);
                  errorMessager.triggerMsg(null,null,{fileName:file.name})
                } */
    
                return Promise.reject(err);
              }
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
          
          if (generateID) formData.append('generateID', generateID);

          const result = await combineChunks(datasetId, formData);
          if (result.status === 200 && result.data && result.data.result && result.data.result.task_id) {
            taskId = result.data.result.task_id;
          } 
          if (!taskId) {
            throw new Error(`the task Id doesn't exist`);
          }
          updateUploadItemDispatcher({
            uploadKey,
            progress: 1,
            status: 'pending',
            taskId,
            uploadedTime: Date.now(),
          });
          message.success(`File ${file.name} was successfully uploaded.`);
        })
        .catch((err) => {
          reject();
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
          });
        });
    })
    .catch((err) => {
      reject();
      message.error('failed upload')
      updateUploadItemDispatcher({
        uploadKey,
        progress: uploadedSize / totalSize,
        status: 'error',
        uploadedTime: Date.now(),
      });
    })
}

/**
 *  Omit file and uploaded_study keys, retrun all the tags
 *
 * @param {object} values the object fromt the uploader
 * @returns {object} all tags
 */
function getTags(values) {
  return _.omit(values, ['upload', 'uploaded_study']);
}

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

export { fileUpload };
