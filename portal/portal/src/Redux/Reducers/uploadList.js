import {
  SET_UPLOAD_LIST,
  APPEND_UPLOAD_LIST,
  UPDATE_UPLOAD_LIST_ITEM,
} from "../actionTypes";

const init = [];
function uploadList(state = init, action) {
  const { type, payload } = action;
  switch (type) {
    case SET_UPLOAD_LIST: {
      return payload.list;
    }
    case APPEND_UPLOAD_LIST: {
      const { appendContent } = payload;
      if (appendContent instanceof Array) {
        return [...state, ...appendContent];
      } else {
        return [...state, appendContent];
      }
    }
    case UPDATE_UPLOAD_LIST_ITEM: {
      const { item } = payload;
      const currentItem = state.find((ele) => {
        return ele.uploadKey === item.uploadKey;
      });
      if(!currentItem){
        return state;
      }
      if (currentItem.status === "error" || currentItem.status === "success")
        return [...state];
      currentItem["progress"] = item["progress"];
      currentItem["status"] = item["status"];
      currentItem["jobId"] = item["jobId"];
      currentItem['uploadedTime'] = item["uploadedTime"]
      return [...state];
    }
    default: {
      return state;
    }
  }
}

export default uploadList;
