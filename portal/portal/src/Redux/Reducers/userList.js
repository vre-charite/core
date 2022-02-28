import { SET_USER_LIST } from "../actionTypes";

const init = null;

export default function (state = init, action) {
  const { type, payload } = action;
  switch (type) {
    case SET_USER_LIST: {
      return payload.userList;
    }
    default:
      return state;
  }
}
