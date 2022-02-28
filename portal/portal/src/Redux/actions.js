import _ from 'lodash';
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
  DATASET_FILE_OPERATION,
  SET_TABLE_RESET,
  SCHEMA_TEMPLATES,
  FILE_EXPLORER_TABLE as FILE_EXPLORER_TABLE,
  COPY_REQUEST,
  NOTIFICATIONS,
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
  resetTreeKey: (payload) => ({
    type: DATASET_DATA.RESET_TREE_KEY,
    payload,
  }),
  setTreeData: (payload) => ({
    type: DATASET_DATA.SET_TREE_DATA,
    payload,
  }),
  setSelectedData: (payload) => ({
    type: DATASET_DATA.SET_SELECTED_DATA,
    payload,
  }),
  setSelectedDataPos: (payload) => ({
    type: DATASET_DATA.SET_SELECTED_DATA_POS,
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
  setTreeLoading: (payload) => ({
    type: DATASET_DATA.SET_TREE_LOADING,
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
  setDatasetVersion: (payload) => ({
    type: DATASET_INFO.SET_VERSION,
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

export const datasetFileOperationsCreators = {
  setMove: (payload) => ({
    type: DATASET_FILE_OPERATION.SET_MOVE,
    payload,
  }),
  setRename: (payload) => ({
    type: DATASET_FILE_OPERATION.SET_RENAME,
    payload,
  }),
  setDelete: (payload) => ({
    type: DATASET_FILE_OPERATION.SET_DELETE,
    payload,
  }),
  setImport: (payload) => ({
    type: DATASET_FILE_OPERATION.SET_IMPORT,
    payload,
  }),
  /**
   *
   * @param {"move"|"rename"|"delete"|"import"} type
   * @param {boolean} payload
   * @returns
   */
  setLoadingStatus: (type, payload) => ({
    type: DATASET_FILE_OPERATION.SET_LOADING_STATUS[_.upperCase(type)],
    payload,
  }),
};

export const schemaTemplatesActions = {
  updateDefaultSchemaList: (payload) => ({
    type: SCHEMA_TEMPLATES.UPDATE_DEFAULT_SCHEMA_LIST,
    payload,
  }),
  updateDefaultSchemaTemplateList: (payload) => ({
    type: SCHEMA_TEMPLATES.UPDATE_DEFAULT_SCHEMA_TEMPLATE_LIST,
    payload,
  }),
  setDefaultActiveKey: (payload) => ({
    type: SCHEMA_TEMPLATES.SET_DEFAULT_SCHEMA_ACTIVE_KEY,
    payload,
  }),
  setCustomActiveKey: (payload) => ({
    type: SCHEMA_TEMPLATES.SET_CUSTOM_SCHEMA_ACTIVE_KEY,
    payload,
  }),
  addDefaultOpenTab: (payload) => ({
    type: SCHEMA_TEMPLATES.ADD_DEFAULT_OPEN_TAB,
    payload,
  }),
  updateDefaultOpenTab: (payload) => ({
    type: SCHEMA_TEMPLATES.UPDATE_DEFAULT_OPEN_TAB,
    payload,
  }),
  clearDefaultOpenTab: () => ({
    type: SCHEMA_TEMPLATES.CLEAR_DEFAULT_OPEN_TAB,
  }),
  addCustomOpenTab: (payload) => ({
    type: SCHEMA_TEMPLATES.ADD_CUSTOM_OPEN_TAB,
    payload,
  }),
  removeDefaultOpenTab: (payload) => ({
    type: SCHEMA_TEMPLATES.REMOVE_DEFAULT_OPEN_TAB,
    payload,
  }),
  removeCustomOpenTab: (payload) => ({
    type: SCHEMA_TEMPLATES.REMOVE_CUSTOM_OPEN_TAB,
    payload,
  }),
  setPreviewSchemaGeid: (payload) => ({
    type: SCHEMA_TEMPLATES.SET_PREVIEW_SCHEMA_GEID,
    payload,
  }),
  setSchemaTypes: (payload) => ({
    type: SCHEMA_TEMPLATES.SET_SCHEMA_TYPES,
    payload,
  }),
  switchTPLManagerMode: (payload) => ({
    type: SCHEMA_TEMPLATES.SWITCH_TEMPLATE_MANAGER_MODE,
    payload,
  }),
  showTplDropdownList: (payload) => ({
    type: SCHEMA_TEMPLATES.SHOW_TEMPLATES_DROPDOWN_LIST,
    payload,
  }),
};

export const fileExplorerTableActions = {
  setLoading: (payload) => ({
    type: FILE_EXPLORER_TABLE.SET_LOADING,
    payload,
  }),
  setCurrentPlugin: (payload) => ({
    type: FILE_EXPLORER_TABLE.SET_CURRENT_PLUGIN,
    payload,
  }),
  setData: (payload) => ({
    type: FILE_EXPLORER_TABLE.SET_DATA,
    payload,
  }),
  setRoute: (payload) => ({
    type: FILE_EXPLORER_TABLE.SET_ROUTE,
    payload,
  }),
  setPage: (payload) => ({
    type: FILE_EXPLORER_TABLE.SET_PAGE,
    payload,
  }),
  setPageSize: (payload) => ({
    type: FILE_EXPLORER_TABLE.SET_PAGE_SIZE,
    payload,
  }),
  setTotal: (payload) => ({
    type: FILE_EXPLORER_TABLE.SET_TOTAL,
    payload,
  }),
  setSortBy: (payload) => ({
    type: FILE_EXPLORER_TABLE.SET_SORT_BY,
    payload,
  }),
  setSortType: (payload) => ({
    type: FILE_EXPLORER_TABLE.SET_SORT_ORDER,
    payload,
  }),
  setFilter: (payload) => ({
    type: FILE_EXPLORER_TABLE.SET_FILTER,
    payload,
  }),
  setSelections: (payload) => ({
    type: FILE_EXPLORER_TABLE.SET_SELECTION,
    payload,
  }),
  setDataOriginal: (payload) => ({
    type: FILE_EXPLORER_TABLE.SET_DATA_ORIGINAL,
    payload,
  }),
  setColumnsCompMap: (payload) => ({
    type: FILE_EXPLORER_TABLE.SET_COLUMNS_COMP_MAP,
    payload,
  }),
  setAdd: (payload) => ({
    type: FILE_EXPLORER_TABLE.ADD,
    payload,
  }),
  clear: (payload) => ({
    type: FILE_EXPLORER_TABLE.REMOVE,
    payload,
  }),
  setPropertyRecord: (payload) => ({
    type: FILE_EXPLORER_TABLE.SET_PROPERTY_RECORD,
    payload,
  }),
  setSidePanelOpen: (payload) => ({
    type: FILE_EXPLORER_TABLE.SET_SIDE_PANEL_OPEN,
    payload,
  }),
  setSourceType: (payload) => ({
    type: FILE_EXPLORER_TABLE.SET_SOURCE_TYPE,
    payload,
  }),
  refreshTable: (payload) => ({
    type: FILE_EXPLORER_TABLE.REFRESH_TABLE,
    payload,
  }),
  setCurrentGeid: (payload) => ({
    type: FILE_EXPLORER_TABLE.SET_CURRENT_GEID,
    payload,
  }),
  setHardFreshKey: (payload) => ({
    type: FILE_EXPLORER_TABLE.SET_HARD_REFRESH_KEY,
    payload,
  }),
};

export const request2CoreActions = {
  setStatus: (payload) => ({
    type: COPY_REQUEST.SET_STATUS,
    payload,
  }),
  setReqList: (payload) => ({
    type: COPY_REQUEST.SET_REQ_LIST,
    payload,
  }),
  setActiveReq: (payload) => ({
    type: COPY_REQUEST.SET_ACTIVE_REQ,
    payload,
  }),
  setPagination: (payload) => ({
    type: COPY_REQUEST.SET_PAGINATION,
    payload,
  }),
};

export const notificationActions = {
  setActiveNotification: (payload) => ({
    type: NOTIFICATIONS.SET_ACTIVE_NOTIFICATION,
    payload,
  }),
  setCreateNewNotificationStatus: (payload) => ({
    type: NOTIFICATIONS.SET_CREATE_NEW_NOTIFICATION_LIST_ITEM__STATUS,
    payload,
  }),
  setUserNotifications: (payload) => ({
    type: NOTIFICATIONS.SET_USER_NOTIFICATIONS,
    payload,
  }),
  setNotificationList: (payload) => ({
    type: NOTIFICATIONS.SET_NOTIFICATION_LIST,
    payload,
  }),
  setUpdateNotificationTimes: (payload) => ({
    type: NOTIFICATIONS.SET_UPDATE_NOTIFICATION_TIMES,
    payload,
  }),
  setEditNotification: (payload) => ({
    type: NOTIFICATIONS.SET_EDIT_NOTIFICATION,
    payload,
  }),
};
