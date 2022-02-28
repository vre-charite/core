import { SET_METADATAS } from "../actionTypes";

const init = null;
function metadatas(state = init, action) {
  const { type, payload } = action;
  switch (type) {
    case SET_METADATAS: {
      return payload.metadatas;
    }
    default: {
      return state;
    }
  }
}

export { metadatas };
