import { SET_USER_ROLE } from "../actionTypes";

const init = null;
function role(state = init, action) {
  const { type, payload } = action;
  switch (type) {
    case SET_USER_ROLE: {
      return payload.role;
    }
    default: {
      return state;
    }
  }
}

export default role;
