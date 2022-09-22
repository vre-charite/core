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

import { MY_DATASET_LIST } from '../actionTypes';

const init = {
  loading: false,
  datasets: [],
  total: 0,
};

export function myDatasetList(state = init, action) {
  const { type, payload } = action;

  switch (type) {
    case MY_DATASET_LIST.SET_LOADING: {
      return { ...state, loading: payload };
    }

    case MY_DATASET_LIST.SET_DATASETS: {
      return { ...state, datasets: payload };
    }

    case MY_DATASET_LIST.SET_TOTAL: {
      return { ...state, total: payload };
    }

    default:
      return state;
  }
}
