import reduxActionWrapper from '../reduxActionWrapper';
import { appendUploadListCreator, updateUploadItemCreator,  } from '../../Redux/actions';


const [appendUploadListDispatcher] = reduxActionWrapper([appendUploadListCreator, updateUploadItemCreator]);

/**
 * start the upload process
 * @param {object} data the data from the upload modal form, with the fileList and datasetId, uploader, etc.
 * @param {Async.queue} q the async queue object
 */
const uploadStarter =  (data, q) => {
    const timeStamp = Date.now()
    const fileList = data.file.fileList;
    const fileActions = fileList.map(item => {
        const file = item.originFileObj;
        const uploadKey = file.name + timeStamp;
        return ({
            uploadKey,
            status: "waiting",
            progress: null,
            projectId: data.dataset,
            fileName: file.name,
            projectName:data.projectName,
            generateID:data.gid?data.gid:null,
            projectCode: data.projectCode,
        });
    });
    appendUploadListDispatcher(fileActions);
    q.push(fileList.map(item => ({
        file: item.originFileObj, uploadKey: item.originFileObj.name + timeStamp, generateID:data.gid,
        datasetId:data.dataset,
        uploader:data.uploader,
        projectCode: data.projectCode,
    })));
    q.error((err, task)=>{
        console.log(`task ${task} error`);
    })
}

export default uploadStarter;