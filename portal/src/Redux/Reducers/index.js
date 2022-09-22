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

import { combineReducers } from 'redux';
import datasetList from './datasetList';
import userList from './userList';
import { tags } from './tags';
import { metadatas } from './metadatas';
import { personalDatasetId } from './personalDatasetId';
import containersPermission from './containersPermission';
import role from './role';
import uploadList from './uploadList';
import newUploadIndicator from './newUploadIndicator';
import { USER_LOGOUT } from '../actionTypes';
import refreshTokenModal from './refreshToken';
import downloadList from './downloadList';
import clearId from './clearId';
import username from './username';
import isLogin from './isLogin';
import successNum from './successNum';
import downloadClearId from './downloadClearId';
import panelActiveKey from './panelActiveKey';
import project from './currentProject';
import email from './userEmail';
import copy2CoreList from './copy2CoreList';
import events from './events';
import isKeycloakReady from './isKeycloakReady';
import isReleaseNoteShown from './isReleaseNoteShown';
import deletedFileList from './deletedFileList';
import uploadFileManifest from './uploadFileManifest';
import fileExplorer from './fileExplorer';
import serviceRequestRedDot from './serviceRequest';
import user from './user';
import { datasetData } from './datasetData';
import { myDatasetList } from './myDatasetList';
import { datasetInfo } from './datasetInfo';
import { datasetFileOperations } from './datasetFileOperations';
import { schemaTemplatesInfo } from './schemaTemplatesInfo';
import { fileExplorerTable } from './fileExplorerTable';
import request2Core from './request2Core';
import notifications from './notification';

const appReducer = combineReducers({
  datasetList,
  userList,
  tags,
  metadatas,
  personalDatasetId,
  containersPermission,
  role,
  uploadList,
  newUploadIndicator,
  refreshTokenModal,
  project,
  copy2CoreList,
  downloadList,
  clearId,
  isLogin,
  username,
  successNum,
  downloadClearId,
  panelActiveKey,
  email,
  events,
  isKeycloakReady,
  isReleaseNoteShown,
  deletedFileList,
  uploadFileManifest,
  fileExplorer,
  serviceRequestRedDot,
  user,
  datasetData,
  myDatasetList,
  datasetInfo,
  datasetFileOperations,
  schemaTemplatesInfo,
  fileExplorerTable,
  request2Core,
  notifications,
});

const rootReducer = (state, action) => {
  if (action.type === USER_LOGOUT) {
    state = {};
  }
  return appReducer(state, action);
};

export default rootReducer;
