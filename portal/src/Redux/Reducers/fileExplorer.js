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
  SET_SELECTED_FILES,
  SET_SELECTED_FILES_KEYS,
  CLEAN_FILES_SELECTION,
  SET_FOLDER_ROUTING,
  SET_TABLE_RESET,
} from '../actionTypes';
import _ from 'lodash';
const init = {
  selFiles: [],
  selFilesKeys: [],
  folderRouting: {},
  tableResetMap: {},
};
export default function (state = init, action) {
  const { type, payload } = action;
  switch (type) {
    case SET_SELECTED_FILES: {
      return { ...state, selFiles: payload };
    }
    case SET_SELECTED_FILES_KEYS: {
      return { ...state, selFilesKeys: payload };
    }
    case CLEAN_FILES_SELECTION: {
      return {
        ...state,
        selFilesKeys: [],
        selFiles: [],
      };
    }
    case SET_FOLDER_ROUTING: {
      return Object.assign(
        { ...state },
        { folderRouting: _.cloneDeep(payload) },
      );
    }
    case SET_TABLE_RESET: {
      let tableResetMap = { ...state.tableResetMap };
      if (tableResetMap[payload]) {
        tableResetMap[payload] = tableResetMap[payload] + 1;
      } else {
        tableResetMap[payload] = 1;
      }

      return Object.assign({ ...state }, { tableResetMap: tableResetMap });
    }
    default: {
      return state;
    }
  }
}
