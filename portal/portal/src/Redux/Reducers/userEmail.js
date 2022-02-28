import { SET_EMAIL } from "../actionTypes";

const init = null;
function userEmail(state = init, action) {
  const { type, payload } = action;
  switch (type) {
    case SET_EMAIL: {
      return payload;
    }
    default: {
      return state;
    }
  }
}

export default userEmail;