import { APPEND_DOWNLOAD_LIST, REMOVE_DOWNLOAD_LIST,CLEAR_DOWNLOAD_LIST } from '../actionTypes';

const init = [];
function downloadList(state = init, action) {
  const { type, payload } = action;
  switch (type) {
    case APPEND_DOWNLOAD_LIST: {
      return [...state, payload];
    }
    case REMOVE_DOWNLOAD_LIST: {
      const newDownloadList = state.filter(
        (item) => item.downloadKey !== payload,
      );
      return newDownloadList;
    }
    case CLEAR_DOWNLOAD_LIST:{
      return [];
    }
    default: {
      return state;
    }
  }
}

export default downloadList;
