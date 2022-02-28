import { preUploadApi } from '../../APIs';
import { tokenManager } from '../../Service/tokenManager';
import { objectKeysToSnakeCase } from '../';
import { getPath } from './getPath';
import { dcmId } from '../../config';
/**
 * get the jobId the resumable_identifier from the backend before upload
 * @param {string} projectCode
 * @param {string} operator the uploader
 * @param {"AS_FOLDER" | "AS_FILE"} jobType
 * @param {string[]} folderTags
 * @param {file[]} fileList resumableFilename is the filename, resumableRelativePath is the path, with no slash(/) on the start, and also No ending with filename
 * @param {string} uploadMessage
 * @param {string} dcmIdValue the dcmIdValue, if available
 */
export function preUpload(
  projectCode,
  operator,
  jobType,
  folderTags,
  files,
  uploadMessage,
  dcmIdValue ,
  toExistingFolder,
  folderPath,
) {
  let currentFolderName = '';
  const filesInfo = files.map((file) => {
    let relativePath = getPath(file.originFileObj.webkitRelativePath);
    currentFolderName = relativePath.split('/')[0];
    if (toExistingFolder) {
      if (relativePath === '') {
        relativePath = folderPath;
      } else {
        relativePath = folderPath + '/' + relativePath;
      }
    }
    const fileInfo = {
      resumableFilename: file.originFileObj.name,
      resumableRelativePath: relativePath,
    };
    if (dcmIdValue) fileInfo["dcmId"] = dcmIdValue;
    return fileInfo;
  });
  let currentFolderNode = '';
  if (jobType === 'AS_FOLDER') {
    if (folderPath) {
      currentFolderNode = folderPath + '/' + currentFolderName;
    } else {
      currentFolderNode = currentFolderName;
    }
  }
  const param = {
    projectCode,
    operator,
    jobType,
    folderTags,
    data: filesInfo,
    uploadMessage,
    currentFolderNode,
  };

  const sessionId = tokenManager.getCookie('sessionId');
  return preUploadApi(objectKeysToSnakeCase(param), sessionId);
}
