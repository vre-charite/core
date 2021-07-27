import { DATASET_DATA } from '../actionTypes';

export const EDIT_MODE = {
  DISPLAY: 'display',
  EIDT_INDIVIDUAL: 'edit_individual',
};
const init = {
  treeData: [],
  selectedData: [],
  uniqeSelectedData: [],
  mode: EDIT_MODE.DISPLAY,
  hightLighted: null,
  previewFile: {},
};

export function datasetData(state = init, action) {
  const { type, payload } = action;

  switch (type) {
    case DATASET_DATA.SET_TREE_DATA: {
      return { ...state, treeData: payload };
    }
    case DATASET_DATA.SET_SELECTED_DATA: {
      return { ...state, selectedData: payload };
    }
    case DATASET_DATA.SET_UNIQE_SELECTED_DATA: {
      return { ...state, uniqeSelectedData: payload };
    }
    case DATASET_DATA.SET_HIGHLIGHTED: {
      return { ...state, hightLighted: payload };
    }

    case DATASET_DATA.CLEAR_DATA: {
      return init;
    }
    case DATASET_DATA.SET_MODE: {
      return { ...state, mode: payload };
    }

    case DATASET_DATA.SET_PREVIEW_FILE: {
      return { ...state, previewFile: payload };
    }

    default:
      return state;
  }
}
