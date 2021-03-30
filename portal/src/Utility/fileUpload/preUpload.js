import { preUploadApi } from '../../APIs'
import { tokenManager } from '../../Service/tokenManager';
import { objectKeysToSnakeCase } from '../';
import {getPath} from './getPath'
/**
 * get the jobId the resumable_identifier from the backend before upload
 * @param {string} projectCode 
 * @param {string} operator the uploader
 * @param {"AS_FOLDER" | "AS_FILE"} jobType 
 * @param {string[]} folderTags 
 * @param {file[]} fileList resumableFilename is the filename, resumableRelativePath is the path, with no slash(/) on the start, and also No ending with filename
 * @param {string} uploadMessage 
 */
export function preUpload(projectCode, operator, jobType, folderTags, files, uploadMessage) {
    const filesInfo = files.map(file => ({
        resumableFilename: file.originFileObj.name,
        resumableRelativePath: getPath(file.originFileObj.webkitRelativePath)
    }));
    const param = {
        projectCode,
        operator,
        jobType,
        folderTags,
        data: filesInfo,
        uploadMessage
    }
    const sessionId = tokenManager.getCookie('sessionId');
    return preUploadApi(objectKeysToSnakeCase(param), sessionId);
}

