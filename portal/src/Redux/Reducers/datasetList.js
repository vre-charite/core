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

import { ADD_DATASET_LIST,CLEAN_DATASET_LIST, SET_DATASET_LIST, UPDATE_DATASET_LIST } from "../actionTypes";
//const _ = require('lodash');


export default function (state = [], action) {
  switch (action.type) {
    case ADD_DATASET_LIST: {
      const { datasetList, title } = action.payload;
      if (!state.length) {
        return [
          {
            datasetList,
            title: "All Projects",
            key: 0,
          },
        ];
      } else {
        const newState = state.slice(0);

        newState.push({
          datasetList,
          key: state[newState.length - 1].key + 1,
          title: title || `query${state[newState.length - 1].key + 1}`,
        });
        return newState;
      }
      //if we will change anything inside programsList, we may need deepClone
    }
    case UPDATE_DATASET_LIST: {
      const { datasetList, title } = action.payload;
      const newState = [];

      if (state.length) {  
        for (const item of state) {
          if (item.title === title) {
            item.datasetList = datasetList;
          }
          newState.push(item);
        }
      }

      return newState;
    }
    case CLEAN_DATASET_LIST:{
      return [];
    }
    case  SET_DATASET_LIST:{
      const {  allDatasetLists} = action.payload;
      return  allDatasetLists;
    }
    default:
      return state;
  }
}
