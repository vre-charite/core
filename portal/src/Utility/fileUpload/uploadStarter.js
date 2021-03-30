import reduxActionWrapper from '../reduxActionWrapper';
import {
  appendUploadListCreator,
  updateUploadItemCreator,
} from '../../Redux/actions';
import { preUpload } from './preUpload'
import { message } from 'antd';
import { ErrorMessager, namespace } from '../../ErrorMessages';
const [appendUploadListDispatcher, updateUploadItemDispatcher] = reduxActionWrapper([
  appendUploadListCreator,
  updateUploadItemCreator,
]);

/**
 * start the upload process
 * @param {object} data the data from the upload modal form, with the fileList and datasetId, uploader, etc.
 * @param {Async.queue} q the async queue object
 */
const uploadStarter = (data, q) => {
  const timeStamp = Date.now();
  const fileList = data.fileList;
  const fileActions = fileList.map((item) => {
    const file = item.originFileObj;
    const uploadKey = file.name + timeStamp;
    return {
      uploadKey,
      status: 'waiting',
      progress: null,
      projectId: data.dataset,
      fileName: file.name,
      projectName: data.projectName,
      generateID: data.gid ? data.gid : null,
      projectCode: data.projectCode,
      createdTime: Date.now(),
    };
  });
  appendUploadListDispatcher(fileActions);
  preUpload(data.projectCode, data.uploader, data.jobType, data.tags, fileList, "").then(res => {
    const result = res.data.result;
    if (result && result.length > 0) {
      const newFileList = fileList.map((item, index) => {
        const resFile = result[index];
        return { ...item, sessionId: resFile.sessionId, resumableIdentifier: resFile.payload.resumableIdentifier, jobId: resFile.jobId }
      })
      q.push(
        newFileList.map((item) => ({
          file: item.originFileObj,
          uploadKey: item.originFileObj.name + timeStamp,
          generateID: data.gid,
          datasetId: data.dataset,
          uploader: data.uploader,
          projectCode: data.projectCode,
          tags: data.tags,
          manifest: data.manifest,
          createdTime: Date.now(),
          sessionId: item.sessionId,
          resumableIdentifier: item.resumableIdentifier,
          jobId: item.jobId,
        })),
      );
    } else {
      throw new Error('Failed to get identifiers from response')
    }

  }).catch(err => {
    console.log(err);
    if(err.response?.status===409){
      for(const file of err.response?.data?.result?.failed){
        const {name, relative_path} = file;
        const errorMessager = new ErrorMessager(
          namespace?.dataset?.files?.preUpload,
        );
        errorMessager.triggerMsg(err?.response?.status, null, {
          fileName: (relative_path?relative_path + "/":"") + name,
        });
      }
    }else{
      const errorMessager = new ErrorMessager(
        namespace?.dataset?.files?.preUpload,
      );
      errorMessager.triggerMsg(err?.response?.status, null);
    }
    for (const file of fileList) {
      updateUploadItemDispatcher({
        uploadKey: file.originFileObj.name + timeStamp,
        status: 'error',
        uploadedTime: Date.now(),
        projectCode: data.projectCode,
      });
    }

  })

  q.error((err, task) => {
    console.log(`task ${task} error`);
  });
};

export default uploadStarter;
