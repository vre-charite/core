import { UPDATE_COPY2CORE_LIST } from '../actionTypes';

const init = [];
function copy2CoreList(state = init, action) {
  const { type, payload } = action;
  switch (type) {
    case UPDATE_COPY2CORE_LIST: {
      return payload;
    }
    default: {
      return state;
    }
  }
}

export default copy2CoreList;
