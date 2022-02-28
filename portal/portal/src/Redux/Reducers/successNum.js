import { SET_SUCCESS_NUM } from "../actionTypes";

const init = 0;
function successNum(state = init, action) {
  const { type, payload } = action;
  switch (type) {
    case SET_SUCCESS_NUM: {
      return payload;
    }
    default: {
      return state;
    }
  }
}

export default successNum;
