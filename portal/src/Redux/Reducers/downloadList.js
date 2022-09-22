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

import { APPEND_DOWNLOAD_LIST, REMOVE_DOWNLOAD_LIST,CLEAR_DOWNLOAD_LIST, UPDATE_DOWNLOAD_ITEM, SET_DOWNLOAD_LIST } from '../actionTypes';

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
    case UPDATE_DOWNLOAD_ITEM: {
      const newDownloadList = state.map((el) => {
        if (el.downloadKey === payload.key) el.status = payload.status;
        
        return el;
      });

      return newDownloadList;
    }
    case SET_DOWNLOAD_LIST: {
      return payload;
    }
    default: {
      return state;
    }
  }
}

export default downloadList;
