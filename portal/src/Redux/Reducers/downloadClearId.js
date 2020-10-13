import { SET_DOWNLOAD_CLEAR_ID } from "../actionTypes";

const init = '';
function downloadClearId(state = init, action) {
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

export default downloadClearId;
