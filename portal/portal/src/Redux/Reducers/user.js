import { SET_USER_STATUS } from '../actionTypes';

const init = { status: null };

export default function (state = init, action) {
  const { type, payload } = action;
  switch (type) {
    case SET_USER_STATUS: {
      return {
        ...state,
        status: payload,
      };
    }
    default:
      return state;
  }
}
