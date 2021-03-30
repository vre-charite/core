import {
  SET_SELECTED_FILES,
  SET_SELECTED_FILES_KEYS,
  CLEAN_FILES_SELECTION,
  SET_FOLDER_ROUTING,
} from '../actionTypes';
const init = { selFiles: [], selFilesKeys: [], folderRouting: {} };
export default function (state = init, action) {
  const { type, payload } = action;
  switch (type) {
    case SET_SELECTED_FILES: {
      return { ...state, selFiles: payload };
    }
    case SET_SELECTED_FILES_KEYS: {
      return { ...state, selFilesKeys: payload };
    }
    case CLEAN_FILES_SELECTION: {
      return {
        ...state,
        selFilesKeys: [],
        selFiles: [],
      };
    }
    case SET_FOLDER_ROUTING: {
      return { ...state, folderRouting: payload };
    }
    default: {
      return state;
    }
  }
}
