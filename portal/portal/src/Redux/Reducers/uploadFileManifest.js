import { SET_UPLOAD_FILE_MANIFEST } from '../actionTypes';

const init = [];
function uploadFileManifest(state = init, action) {
  const { type, payload } = action;
  switch (type) {
    case SET_UPLOAD_FILE_MANIFEST: {
      state.push(payload);
      return state;
    }
    default: {
      return state;
    }
  }
}

export default uploadFileManifest;
