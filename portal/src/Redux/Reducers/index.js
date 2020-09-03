import { combineReducers } from "redux";
import datasetList from "./datasetList";
import userList from "./userList";
import { tags } from "./tags";
import { metadatas } from "./metadatas";
import { personalDatasetId } from "./personalDatasetId";
import containersPermission from "./containersPermission";
import role from "./role";
import uploadList from "./uploadList";
import newUploadIndicator from "./newUploadIndicator";
import { USER_LOGOUT } from "../actionTypes";
import refreshTokenModal from "./refreshToken";
import downloadList from './downloadList';
import clearId from './clearId';
import isLogin from './isLogin'
// export default combineReducers({
//   datasetList,
//   userList,
//   tags,
//   metadatas,
//   personalDatasetId,
//   containersPermission,
//   role,
//   uploadList,newUploadIndicator
// });

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
  downloadList,clearId,isLogin
});

const rootReducer = (state, action) => {
  if (action.type === USER_LOGOUT) {
    state = {};
  }
  return appReducer(state, action);
};

export default rootReducer;
