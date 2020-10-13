import { updateClearIdCreator, setContainersPermissionCreator, cleanDatasetCreator, clearDownloadListCreator, setIsLoginCreator, setMetadatasCreator, setNewUploadIndicator, setPersonalDatasetIdCreator, setRefreshModal, setUserRoleCreator, setTagsCreator, setUploadListCreator, setUserListCreator, setUsernameCreator } from '../Redux/actions';
import reduxActionWrapper from './reduxActionWrapper';

const [updateClearIdDispatcher, setContainersPermissionDispatcher, cleanDatasetDispatcher, clearDownloadListDispatcher, setIsLoginDispatcher, setMetadatasDispatcher, setNewUploadIndicatorDispatcher, setPersonalDatasetIdDispatcher, setRefreshModalDispatcher, setUserRoleDispatcher, setTagsDispatcher, setUploadListDispatcher, setUserListDispatcher, setUsernameDispatcher] = reduxActionWrapper([updateClearIdCreator, setContainersPermissionCreator, cleanDatasetCreator, clearDownloadListCreator, setIsLoginCreator, setMetadatasCreator, setNewUploadIndicator, setPersonalDatasetIdCreator, setRefreshModal, setUserRoleCreator, setTagsCreator, setUploadListCreator, setUserListCreator, setUsernameCreator])
/**
 * reset all redux states to the init
 * @param {boolean} shouldClearUsername if true, clean the username. by default true. only if login different account in another tab will set this false;
 */
function resetReduxState(shouldClearUsername=true) {
    updateClearIdDispatcher('');
    setContainersPermissionDispatcher(null);
    cleanDatasetDispatcher();
    clearDownloadListDispatcher();
    setIsLoginDispatcher(false);
    setMetadatasDispatcher({ metadatas: null });
    setNewUploadIndicatorDispatcher(0);
    setPersonalDatasetIdDispatcher(null);
    setRefreshModalDispatcher(false);
    setUserRoleDispatcher(null)
    setTagsDispatcher(null);
    setUploadListDispatcher([]);
    setUserListDispatcher(null);
    shouldClearUsername&&setUsernameDispatcher(null);
}

export { resetReduxState }