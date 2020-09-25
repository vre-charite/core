import { SET_DOWNLOAD_CLEAR_ID } from "../actionTypes";

const init = null;
function donwloadClearId(state = init, action) {
  const { type, payload } = action;
  switch (type) {
    case SET_DOWNLOAD_CLEAR_ID: {
      return payload;
    }
    default: {
      return state;
    }
  }
}

export default donwloadClearId;
