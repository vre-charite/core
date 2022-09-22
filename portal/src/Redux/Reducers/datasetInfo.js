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
