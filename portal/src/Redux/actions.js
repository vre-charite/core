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
  SET_REFRESH_MODAL, APPEND_DOWNLOAD_LIST,
  REMOVE_DOWNLOAD_LIST,
  UPDATE_DATASET_LIST,
  UPDATE_CLEAR_ID,SET_IS_LOGIN,
  SET_USER_NAME,CLEAR_DOWNLOAD_LIST,
  SET_SUCCESS_NUM,
  SET_DOWNLOAD_CLEAR_ID,SET_PANEL_ACTIVE_KEY
} from "./actionTypes";

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

export const appendDownloadListCreator = (downloadItem)=>({
  type:APPEND_DOWNLOAD_LIST,
  payload:downloadItem
});

export const removeDownloadListCreator = (downloadKey)=>({
  type:REMOVE_DOWNLOAD_LIST,
  payload:downloadKey
})

export const clearDownloadListCreator = ()=>({
  type:CLEAR_DOWNLOAD_LIST,
})

export const updateClearIdCreator = (clearId)=>({
  type:UPDATE_CLEAR_ID,
  payload:clearId,
})

export const setIsLoginCreator = (isLogin)=>({
  type:SET_IS_LOGIN,
  payload:isLogin
})

export const setUsernameCreator = (username)=>({
  type:SET_USER_NAME,
  payload:username
})
export const setSuccessNum = (num) => ({
  type:SET_SUCCESS_NUM,
  payload:num
})

export const setDonwloadClearIdCreator = (downloadClearId) =>({
  type:SET_DOWNLOAD_CLEAR_ID,
  payload:downloadClearId,
})

export const setPanelActiveKey = (key)=>({
  type:SET_PANEL_ACTIVE_KEY,
  payload:key
})
