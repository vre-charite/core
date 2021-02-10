import { TRIGGER_EVENT } from '../actionTypes';

const init = {
  LOAD_COPY_LIST: 0,
  LOAD_DELETED_LIST: 0,
};
function events(state = init, action) {
  const { type, payload } = action;
  switch (type) {
    case TRIGGER_EVENT: {
      if (typeof state[payload] !== 'undefined') {
        state[payload] = state[payload] + 1;
      }
      return state;
    }
    default: {
      return state;
    }
  }
}

export default events;
