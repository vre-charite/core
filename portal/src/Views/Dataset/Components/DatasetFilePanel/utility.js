import _ from 'lodash';

const countStatus = (fileActions) => {
  let runningCount = 0;
  let errorCount = 0;
  let finishCount = 0;
  let initCount = 0;
  let cancelCount = 0;

  for (const fileAction of fileActions) {
    switch (fileAction.status) {
      case 'RUNNING': {
        runningCount++;
        break;
      }
      case 'ERROR': {
        errorCount++;
        break;
      }
      case 'FINISH': {
        finishCount++;
        break;
      }
      case 'INIT': {
        initCount++;
        break;
      }
      case 'CANCELLED': {
        cancelCount++;
        break;
      }
      default: {
      }
    }
  }

  return [runningCount, errorCount, finishCount, initCount, cancelCount];
};

const parsePath = (payload) => {
  let location = payload.location;
  let res = '';
  if (location) {
    location = _.replace(location, 'minio://', '');
    const url = new URL(location);
    const pathName = url.pathname;
    let pathArr = _.trimStart(pathName, '/').split('/');
    pathArr = pathArr.slice(2);
    res = decodeURIComponent(pathArr.join('/'));
  } else {
    const relativePath = _.trimStart(payload.folderRelativePath, '/');
    let pathArr = relativePath.split('/');
    pathArr = pathArr.slice(1);
    res = decodeURIComponent(pathArr.join('/') + '/' + payload.name);
  }
  return _.trimStart(res, '/');
};

export { fetchFileOperations } from '../../DatasetData/Components/DatasetDataExplorer/utility';

export { countStatus, parsePath };
