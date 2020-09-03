import { SET_IS_LOGIN } from "../actionTypes";
import getcard from "../../Views/Dataset/Canvas/getCard";

function getCookie(cname) {
    var name = cname + '=';
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for (var i = 0; i < ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) == ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
      }
    }
    return undefined;
  }

const init = Boolean(getCookie('isLogin'));
function isLogin(state = init, action) {
  const { type, payload } = action;
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
