// Copyright 2022 Indoc Research
// 
// Licensed under the EUPL, Version 1.2 or – as soon they
// will be approved by the European Commission - subsequent
// versions of the EUPL (the "Licence");
// You may not use this work except in compliance with the
// Licence.
// You may obtain a copy of the Licence at:
// 
// https://joinup.ec.europa.eu/collection/eupl/eupl-text-eupl-12
// 
// Unless required by applicable law or agreed to in
// writing, software distributed under the Licence is
// distributed on an "AS IS" basis,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
// express or implied.
// See the Licence for the specific language governing
// permissions and limitations under the Licence.
// 

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
