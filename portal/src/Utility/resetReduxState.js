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

import {
  updateClearIdCreator,
  setContainersPermissionCreator,
  cleanDatasetCreator,
  clearDownloadListCreator,
  setMetadatasCreator,
  setNewUploadIndicator,
  setPersonalDatasetIdCreator,
  setRefreshModal,
  setUserRoleCreator,
  setTagsCreator,
  setUploadListCreator,
  setUserListCreator,
} from '../Redux/actions';
import reduxActionWrapper from './reduxActionWrapper';

const [
  updateClearIdDispatcher,
  setContainersPermissionDispatcher,
  cleanDatasetDispatcher,
  clearDownloadListDispatcher,

  setMetadatasDispatcher,
  setNewUploadIndicatorDispatcher,
  setPersonalDatasetIdDispatcher,
  setRefreshModalDispatcher,
  setUserRoleDispatcher,
  setTagsDispatcher,
  setUploadListDispatcher,
  setUserListDispatcher,
] = reduxActionWrapper([
  updateClearIdCreator,
  setContainersPermissionCreator,
  cleanDatasetCreator,
  clearDownloadListCreator,
  setMetadatasCreator,
  setNewUploadIndicator,
  setPersonalDatasetIdCreator,
  setRefreshModal,
  setUserRoleCreator,
  setTagsCreator,
  setUploadListCreator,
  setUserListCreator,
]);
/**
 * reset all redux states to the init
 * @param {boolean} shouldClearUsername if true, clean the username. by default true. only if login different account in another tab will set this false;
 */
function resetReduxState() {
  updateClearIdDispatcher('');
  setContainersPermissionDispatcher(null);
  cleanDatasetDispatcher();
  clearDownloadListDispatcher();
  setMetadatasDispatcher({ metadatas: null });
  setNewUploadIndicatorDispatcher(0);
  setPersonalDatasetIdDispatcher(null);
  setRefreshModalDispatcher(false);
  setUserRoleDispatcher(null);
  setTagsDispatcher(null);
  setUploadListDispatcher([]);
  setUserListDispatcher(null);
}

export { resetReduxState };
