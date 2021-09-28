import { DATASET_INFO } from '../actionTypes';

const init = {
  basicInfo: {
    timeCreated: '',
    creator: '',
    title: '',
    authors: [],
    type: '',
    modality: [],
    collectionMethod: [],
    license: '',
    code: '',
    projectGeid: '',
    size: 0,
    totalFiles: 0,
    description: '',
    geid: '',
    tags: [],
    bidsLoading: false,
  },
  currentVersion: '',
  projectName: '',
  loading: false,
  hasInit: false,
};

export function datasetInfo(state = init, action) {
  const { type, payload } = action;
  switch (type) {
    case DATASET_INFO.SET_BASIC_INFO: {
      return { ...state, basicInfo: payload };
    }
    case DATASET_INFO.SET_PROJECT_NAME: {
      return { ...state, projectName: payload };
    }
    case DATASET_INFO.SET_LOADING: {
      return { ...state, loading: payload };
    }
    case DATASET_INFO.SET_HAS_INIT: {
      return { ...state, hasInit: payload };
    }
    case DATASET_INFO.SET_VERSION: {
      return { ...state, currentVersion: payload };
    }
    default:
      return state;
  }
}
