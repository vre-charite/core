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
