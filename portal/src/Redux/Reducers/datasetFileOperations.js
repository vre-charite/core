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

import { DATASET_FILE_OPERATION } from '../actionTypes';
import _ from 'lodash';

const init = {
  import: [],
  rename: [],
  delete: [],
  move: [],
  loadingStatus: { import: false, rename: false, delete: false, move: false },
};

/**
 * for dataset file panel, not used yet but already program. keep here and see if it will be useful.
 * @param {*} state
 * @param {*} action
 * @returns
 */
export function datasetFileOperations(state = init, action) {
  const { type, payload } = action;
  switch (type) {
    case DATASET_FILE_OPERATION.SET_IMPORT: {
      const newState = _.cloneDeep(state);
      newState['import'] = payload;
      return newState;
    }

    case DATASET_FILE_OPERATION.SET_DELETE: {
      const newState = _.cloneDeep(state);
      newState['delete'] = payload;
      return newState;
    }

    case DATASET_FILE_OPERATION.SET_RENAME: {
      const newState = _.cloneDeep(state);
      newState['rename'] = payload;
      return newState;
    }

    case DATASET_FILE_OPERATION.SET_MOVE: {
      const newState = _.cloneDeep(state);
      newState['move'] = payload;
      return newState;
    }

    default: {
      return state;
    }
  }
}
