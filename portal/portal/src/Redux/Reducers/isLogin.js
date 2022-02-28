import { SET_IS_LOGIN } from "../actionTypes";

/**
 * the user logout creator may dispatch a action with an empty {}
 */
const init = false;
function isLogin(state = init, action) {
  let { type, payload } = action;
  if(typeof payload!=='boolean'){
    payload = false;
  }
  switch (type) {
    case SET_IS_LOGIN: {
      return payload;
    }
    default: {
      return state;
    }
  }
}

export default isLogin;
