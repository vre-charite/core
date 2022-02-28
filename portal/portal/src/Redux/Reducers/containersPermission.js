import { SET_CONTAINERS_PERMISSION } from "../actionTypes";

const init = null;

export default function (state = init, action) {
  const { type, payload } = action;
  switch (type) {
    case SET_CONTAINERS_PERMISSION: {
      return payload.containersPermission;
    }
    default:
      return state;
  }
}
