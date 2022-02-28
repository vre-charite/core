import { SET_IS_RELEASE_NOTE_SHOWN } from "../actionTypes";


const init = false;
function isReleaseNoteShown(state = init, action) {
  let { type, payload } = action;
  if(typeof payload!=='boolean'){
    payload = false;
  }
  switch (type) {
    case SET_IS_RELEASE_NOTE_SHOWN: {
      return payload;
    }
    default: {
      return state;
    }
  }
}

export default isReleaseNoteShown;
