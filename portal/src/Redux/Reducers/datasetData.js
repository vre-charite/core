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

import { DATASET_DATA } from '../actionTypes';

export const EDIT_MODE = {
  DISPLAY: 'display',
  EIDT_INDIVIDUAL: 'edit_individual',
};
const init = {
  treeData: [],
  selectedData: [],
  selectedDataPos: [],
  mode: EDIT_MODE.DISPLAY,
  hightLighted: null,
  previewFile: {},
  treeLoading: false,
  treeKey: 1,
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
    case DATASET_DATA.SET_SELECTED_DATA_POS: {
      return { ...state, selectedDataPos: payload };
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

    case DATASET_DATA.SET_TREE_LOADING: {
      return { ...state, treeLoading: payload };
    }
    case DATASET_DATA.RESET_TREE_KEY: {
      return { ...state, treeKey: state.treeKey + 1 };
    }
    default:
      return state;
  }
}
