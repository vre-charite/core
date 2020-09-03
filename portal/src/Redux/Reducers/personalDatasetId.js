import { SET_PERSONAL_DATASET_ID } from "../actionTypes";

const init = null;
function personalDatasetId(state = init, action) {
  const { type, payload } = action;
  switch (type) {
    case SET_PERSONAL_DATASET_ID: {
      return payload.id;
    }
    default: {
      return state;
    }
  }
}

export { personalDatasetId };
