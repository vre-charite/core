import { SET_TAGS } from "../actionTypes";

const init = null;
function tags(state = init, action) {
  const { type, payload } = action;
  switch (type) {
    case SET_TAGS: {
      return payload.tags;
    }
    default: {
      return state;
    }
  }
}

export { tags };
