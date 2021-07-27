import { SET_USER_NAME } from '../actionTypes';

const init = null;
function username(state = init, action) {
  const { type, payload } = action;
  switch (type) {
    case SET_USER_NAME: {
      return payload;
    }
    default: {
      return state;
    }
  }
}

export default username;
