import { SET_UPLOAD_INDICATOR } from "../actionTypes";

const init = 0;
function newUploadIndicator(state = init, action) {
  const { type} = action;
  switch (type) {
    case SET_UPLOAD_INDICATOR : {
      return state+1;
    }
    default: {
      return state;
    }
  }
}

export default newUploadIndicator;
