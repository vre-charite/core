// Copyright 2022 Indoc Research
// 
// Licensed under the EUPL, Version 1.2 or – as soon they
// will be approved by the European Commission - subsequent
// versions of the EUPL (the "Licence");
// You may not use this work except in compliance with the
// Licence.
// You may obtain a copy of the Licence at:
// 
// https://joinup.ec.europa.eu/collection/eupl/eupl-text-eupl-12
// 
// Unless required by applicable law or agreed to in
// writing, software distributed under the Licence is
// distributed on an "AS IS" basis,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
// express or implied.
// See the Licence for the specific language governing
// permissions and limitations under the Licence.
// 

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
