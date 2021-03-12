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
