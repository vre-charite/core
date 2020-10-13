import { UPDATE_CLEAR_ID } from "../actionTypes";

const init = '';
function clearId(state = init, action) {
  const { type, payload } = action;
  switch (type) {
    case UPDATE_CLEAR_ID: {
      return payload;
    }
    default: {
      return state;
    }
  }
}

export default clearId;
