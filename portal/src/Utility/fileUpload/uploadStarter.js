import reduxActionWrapper from '../reduxActionWrapper';
import {
  appendUploadListCreator,
  updateUploadItemCreator,
} from '../../Redux/actions';
import { preUpload } from './preUpload';
import { message } from 'antd';
import { FILE_OPERATIONS } from '../../Views/Project/Canvas/Charts/FileExplorer/FileOperationValues';
import { ErrorMessager, namespace } from '../../ErrorMessages';
import { getPath } from './getPath';
import { dcmID } from '../../config';
const [appendUploadListDispatcher, updateUploadItemDispatcher] =
  reduxActionWrapper([appendUploadListCreator, updateUploadItemCreator]);

/**
 * start the upload process
 * @param {object} data the data from the upload modal form, with the fileList and datasetId, uploader, etc.
 * @param {Async.queue} q the async queue object
 */
const uploadStarter = async (data, q) => {
  const timeStamp = Date.now();
  const fileList = data.fileList;
  const fileActions = fileList.map((item) => {
    const file = item.originFileObj;
    const uploadKey = getUploadKey(item, timeStamp);
    const relativePath = getPath(file.webkitRelativePath);

    return {
      uploadKey,
      status: 'waiting',
      progress: null,
      projectId: data.dataset,
      fileName: relativePath
        ? data.folderPath + '/' + relativePath + '/' + file.name
        : data.folderPath + '/' + file.name,
      projectName: data.projectName,
      dcmID: data.gid ? data.gid : null,
      projectCode: data.projectCode,
      createdTime: Date.now(),
    };
  });

  appendUploadListDispatcher(fileActions);
  preUpload(
    data.projectCode,
    data.uploader,
    data.jobType,
    data.tags,
    fileList,
    '',
    data.gid,
    data.toExistingFolder,
    data.folderPath,
  )
    .then((res) => {
      const result = res.data.result;
      if (result && result.length > 0) {
        const newFileList = fileList.map((item, index) => {
          const resFile = result[index];
          return {
            ...item,
            sessionId: resFile.sessionId,
            resumableIdentifier: resFile.payload.resumableIdentifier,
            jobId: resFile.jobId,
          };
        });
        q.push(
          newFileList.map((item) => ({
            file: item.originFileObj,
            uploadKey: getUploadKey(item, timeStamp),
            dcmID: data.gid,
            datasetId: data.dataset,
            uploader: data.uploader,
            projectCode: data.projectCode,
            tags: data.tags,
            manifest: data.manifest,
            createdTime: Date.now(),
            sessionId: item.sessionId,
            resumableIdentifier: item.resumableIdentifier,
            jobId: item.jobId,
            toExistingFolder: data.toExistingFolder,
            folderPath: data.folderPath,
          })),
        );
      } else {
        throw new Error('Failed to get identifiers from response');
      }
    })
    .catch((err) => {
      if (err.response?.status === 409) {
        for (const file of err.response?.data?.result?.failed) {
          const { name, relative_path } = file;
          const errorMessager = new ErrorMessager(
            namespace?.project?.files?.preUpload,
          );
          errorMessager.triggerMsg(err?.response?.status, null, {
            fileName: (relative_path ? relative_path + '/' : '') + name,
          });
        }
      } else {
        const errorMessager = new ErrorMessager(
          namespace?.project?.files?.preUpload,
        );
        errorMessager.triggerMsg(err?.response?.status, null);
      }
      for (const file of fileList) {
        updateUploadItemDispatcher({
          uploadKey: getUploadKey(file, timeStamp),
          status: 'error',
          uploadedTime: Date.now(),
          projectCode: data.projectCode,
        });
      }
    });

  q.error((err, task) => {
    console.log(`task ${task} error`);
  });
};

const getUploadKey = (file, timeStamp) => {
  return file.originFileObj.webkitRelativePath
    ? `${file.originFileObj.webkitRelativePath}/`
    : '' + file.originFileObj.name + timeStamp;
};

export default uploadStarter;
