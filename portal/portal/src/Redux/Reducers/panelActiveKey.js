import { SET_PANEL_ACTIVE_KEY } from "../actionTypes";

const init = [];
function panelActiveKey(state = init, action) {
  const { type, payload } = action;
  switch (type) {
    case SET_PANEL_ACTIVE_KEY: {
      return payload;
    }
    default: {
      return state;
    }
  }
}

export default panelActiveKey;
