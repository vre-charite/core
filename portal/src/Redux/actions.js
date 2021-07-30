import {
  ADD_DATASET_LIST,
  SET_USER_LIST,
  SET_TAGS,
  SET_METADATAS,
  CLEAN_DATASET_LIST,
  SET_DATASET_LIST,
  SET_PERSONAL_DATASET_ID,
  SET_CONTAINERS_PERMISSION,
  SET_USER_ROLE,
  SET_UPLOAD_LIST,
  APPEND_UPLOAD_LIST,
  UPDATE_UPLOAD_LIST_ITEM,
  SET_UPLOAD_INDICATOR,
  USER_LOGOUT,
  SET_REFRESH_MODAL,
  APPEND_DOWNLOAD_LIST,
  REMOVE_DOWNLOAD_LIST,
  UPDATE_DATASET_LIST,
  UPDATE_CLEAR_ID,
  SET_IS_LOGIN,
  SET_USER_NAME,
  CLEAR_DOWNLOAD_LIST,
  SET_SUCCESS_NUM,
  SET_DOWNLOAD_CLEAR_ID,
  SET_PANEL_ACTIVE_KEY,
  UPDATE_DOWNLOAD_ITEM,
  SET_DOWNLOAD_LIST,
  SET_CURRENT_PROJECT_PROFILE,
  SET_CURRENT_PROJECT_MANIFEST,
  SET_CURRENT_PROJECT_TREE,
  SET_CURRENT_PROJECT_TREE_VFOLDER,
  SET_CURRENT_PROJECT_TREE_GREEN_ROOM,
  SET_CURRENT_PROJECT_TREE_CORE,
  SET_CURRENT_PROJECT_ACTIVE_PANE,
  SET_EMAIL,
  UPDATE_COPY2CORE_LIST,
  TRIGGER_EVENT,
  SET_IS_KEYCLOAK_READY,
  SET_IS_RELEASE_NOTE_SHOWN,
  SET_DELETE_LIST,
  SET_UPLOAD_FILE_MANIFEST,
  UPDATE_DELETE_LIST,
  SET_SELECTED_FILES,
  SET_SELECTED_FILES_KEYS,
  CLEAN_FILES_SELECTION,
  SET_FOLDER_ROUTING,
  SHOW_SERVICE_REQUEST_RED_DOT,
  CLEAR_CURRENT_PROJECT,
  SET_USER_STATUS,
  SET_PROJECT_WORKBENCH,
  DATASET_DATA,
  MY_DATASET_LIST,
  DATASET_INFO,
  SET_TABLE_RESET,
} from './actionTypes';

export const AddDatasetCreator = (datasetList, title) => ({
  type: ADD_DATASET_LIST,
  payload: {
    datasetList,
    title,
  },
});

export const UpdateDatasetCreator = (datasetList, title) => ({
  type: UPDATE_DATASET_LIST,
  payload: {
    datasetList,
    title,
  },
});

export const cleanDatasetCreator = () => ({
  type: CLEAN_DATASET_LIST,
});

export const setUserListCreator = (userList) => ({
  type: SET_USER_LIST,
  payload: {
    userList,
  },
});

export const setDatasetCreator = (allDatasetLists) => ({
  type: SET_DATASET_LIST,
  payload: {
    allDatasetLists,
  },
});

export const setTagsCreator = (tags) => ({
  type: SET_TAGS,
  payload: {
    tags,
  },
});

export const setMetadatasCreator = (metadatas) => ({
  type: SET_METADATAS,
  payload: {
    metadatas,
  },
});

export const setPersonalDatasetIdCreator = (id) => ({
  type: SET_PERSONAL_DATASET_ID,
  payload: {
    id,
  },
});

export const setContainersPermissionCreator = (containersPermission) => ({
  type: SET_CONTAINERS_PERMISSION,
  payload: {
    containersPermission,
  },
});

export const setUserRoleCreator = (role) => ({
  type: SET_USER_ROLE,
  payload: {
    role,
  },
});

export const setUploadListCreator = (list) => ({
  type: SET_UPLOAD_LIST,
  payload: {
    list,
  },
});

/**
 *
 * @param {T | Array<T>} appendContent
 */
export const appendUploadListCreator = (appendContent) => ({
  type: APPEND_UPLOAD_LIST,
  payload: {
    appendContent,
  },
});

export const updateUploadItemCreator = (item) => ({
  type: UPDATE_UPLOAD_LIST_ITEM,
  payload: {
    item,
  },
});

export const setNewUploadIndicator = () => ({
  type: SET_UPLOAD_INDICATOR,
  payload: {},
});

export const userLogoutCreator = () => ({
  type: USER_LOGOUT,
  payload: {},
});

export const setRefreshModal = (status) => ({
  type: SET_REFRESH_MODAL,
  payload: status,
});

export const appendDownloadListCreator = (downloadItem) => ({
  type: APPEND_DOWNLOAD_LIST,
  payload: downloadItem,
});

export const removeDownloadListCreator = (downloadKey) => ({
  type: REMOVE_DOWNLOAD_LIST,
  payload: downloadKey,
});

export const clearDownloadListCreator = () => ({
  type: CLEAR_DOWNLOAD_LIST,
});

export const updateDownloadItemCreator = (payload) => ({
  type: UPDATE_DOWNLOAD_ITEM,
  payload,
});

export const setDownloadListCreator = (list) => ({
  type: SET_DOWNLOAD_LIST,
  payload: list,
});

export const updateCopy2CoreList = (list) => ({
  type: UPDATE_COPY2CORE_LIST,
  payload: list,
});

export const updateClearIdCreator = (clearId) => ({
  type: UPDATE_CLEAR_ID,
  payload: clearId,
});

export const setIsLoginCreator = (isLogin) => ({
  type: SET_IS_LOGIN,
  payload: isLogin,
});

export const setUsernameCreator = (username) => ({
  type: SET_USER_NAME,
  payload: username,
});
export const setSuccessNum = (num) => ({
  type: SET_SUCCESS_NUM,
  payload: num,
});

export const setDonwloadClearIdCreator = (downloadClearId) => ({
  type: SET_DOWNLOAD_CLEAR_ID,
  payload: downloadClearId,
});

export const setPanelActiveKey = (key) => ({
  type: SET_PANEL_ACTIVE_KEY,
  payload: key,
});

export const clearCurrentProject = () => ({
  type: CLEAR_CURRENT_PROJECT,
});

export const setCurrentProjectProfile = (profile) => ({
  type: SET_CURRENT_PROJECT_PROFILE,
  payload: profile,
});

export const setCurrentProjectManifest = (manifest) => ({
  type: SET_CURRENT_PROJECT_MANIFEST,
  payload: manifest,
});

export const setCurrentProjectTree = (tree) => ({
  type: SET_CURRENT_PROJECT_TREE,
  payload: tree,
});

export const setCurrentProjectWorkbench = () => ({
  type: SET_PROJECT_WORKBENCH,
});

export const setCurrentProjectTreeVFolder = (vfolders) => ({
  type: SET_CURRENT_PROJECT_TREE_VFOLDER,
  payload: vfolders,
});

export const setCurrentProjectTreeGreenRoom = (folders) => ({
  type: SET_CURRENT_PROJECT_TREE_GREEN_ROOM,
  payload: folders,
});

export const setCurrentProjectTreeCore = (folders) => ({
  type: SET_CURRENT_PROJECT_TREE_CORE,
  payload: folders,
});

export const setCurrentProjectActivePane = (folders) => ({
  type: SET_CURRENT_PROJECT_ACTIVE_PANE,
  payload: folders,
});

export const setEmailCreator = (email) => ({
  type: SET_EMAIL,
  payload: email,
});

export const triggerEvent = (eventType) => ({
  type: TRIGGER_EVENT,
  payload: eventType,
});

export const setIsKeycloakReady = (isKeycloakReady) => ({
  type: SET_IS_KEYCLOAK_READY,
  payload: isKeycloakReady,
});

export const setIsReleaseNoteShownCreator = (isReleaseNoteShown) => ({
  type: SET_IS_RELEASE_NOTE_SHOWN,
  payload: isReleaseNoteShown,
});

export const setDeletedFileList = (payload) => ({
  type: SET_DELETE_LIST,
  payload,
});

export const setUploadFileManifest = (payload) => ({
  type: SET_UPLOAD_FILE_MANIFEST,
  payload,
});

export const updateDeletedFileList = (payload) => ({
  type: UPDATE_DELETE_LIST,
  payload,
});

export const setSelectedFiles = (payload) => ({
  type: SET_SELECTED_FILES,
  payload,
});

export const setSelectedFilesKeys = (payload) => ({
  type: SET_SELECTED_FILES_KEYS,
  payload,
});

export const clearFilesSelection = (payload) => ({
  type: CLEAN_FILES_SELECTION,
  payload,
});

export const setFolderRouting = (payload) => ({
  type: SET_FOLDER_ROUTING,
  payload,
});
export const setTableLayoutReset = (payload) => ({
  type: SET_TABLE_RESET,
  payload,
});
export const setServiceRequestRedDot = (payload) => ({
  type: SHOW_SERVICE_REQUEST_RED_DOT,
  payload,
});

export const setUserStatus = (payload) => ({
  type: SET_USER_STATUS,
  payload,
});

export const datasetDataActions = {
  setTreeData: (payload) => ({
    type: DATASET_DATA.SET_TREE_DATA,
    payload,
  }),
  setSelectedData: (payload) => ({
    type: DATASET_DATA.SET_SELECTED_DATA,
    payload,
  }),
  setUniqeSelectedData: (payload) => ({
    type: DATASET_DATA.SET_UNIQE_SELECTED_DATA,
    payload,
  }),
  setMode: (payload) => ({
    type: DATASET_DATA.SET_MODE,
    payload,
  }),
  setHightLighted: (payload) => ({
    type: DATASET_DATA.SET_HIGHLIGHTED,
    payload,
  }),
  setPreviewFile: (payload) => ({
    type: DATASET_DATA.SET_PREVIEW_FILE,
    payload,
  }),
  clearData: (payload) => ({
    type: DATASET_DATA.CLEAR_DATA,
    payload,
  }),
};

export const myDatasetListCreators = {
  setLoading: (payload) => ({
    type: MY_DATASET_LIST.SET_LOADING,
    payload,
  }),
  setDatasets: (payload) => ({
    type: MY_DATASET_LIST.SET_DATASETS,
    payload,
  }),
  setTotal: (payload) => ({
    type: MY_DATASET_LIST.SET_TOTAL,
    payload,
  }),
};

export const datasetInfoCreators = {
  setBasicInfo: (payload) => ({
    type: DATASET_INFO.SET_BASIC_INFO,
    payload,
  }),
  setProjectName: (payload) => ({
    type: DATASET_INFO.SET_PROJECT_NAME,
    payload,
  }),
  setLoading: (payload) => ({
    type: DATASET_INFO.SET_LOADING,
    payload,
  }),
  setHasInit: (payload) => ({
    type: DATASET_INFO.SET_HAS_INIT,
    payload,
  }),
};
