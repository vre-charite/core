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
  SET_CURRENT_PROJECT_PROFILE,
  SET_CURRENT_PROJECT_MANIFEST,
  SET_CURRENT_PROJECT_TREE,
  SET_CURRENT_PROJECT_TREE_VFOLDER,
  SET_CURRENT_PROJECT_TREE_GREEN_ROOM,
  SET_CURRENT_PROJECT_ACTIVE_PANE,
  SET_CURRENT_PROJECT_TREE_CORE,
  CLEAR_CURRENT_PROJECT,
  SET_PROJECT_WORKBENCH,
} from '../actionTypes';

const init = {
  workbenchDeployedCounter: 0,
};
export default function (state = init, action) {
  const { type, payload } = action;
  switch (type) {
    case CLEAR_CURRENT_PROJECT: {
      return {
        workbenchDeployedCounter: 0,
      };
    }
    case SET_CURRENT_PROJECT_PROFILE: {
      return { ...state, profile: payload };
    }
    case SET_PROJECT_WORKBENCH: {
      return {
        ...state,
        workbenchDeployedCounter: state.workbenchDeployedCounter + 1,
      };
    }
    case SET_CURRENT_PROJECT_MANIFEST: {
      return { ...state, manifest: payload };
    }
    case SET_CURRENT_PROJECT_TREE: {
      return {
        ...state,
        tree: {
          ...state.tree,
          ...payload,
        },
      };
    }
    case SET_CURRENT_PROJECT_TREE_VFOLDER: {
      return {
        ...state,
        tree: {
          ...state.tree,
          vfolders: payload,
        },
      };
    }
    case SET_CURRENT_PROJECT_TREE_GREEN_ROOM: {
      return {
        ...state,
        tree: {
          ...state.tree,
          greenroom: payload,
        },
      };
    }
    case SET_CURRENT_PROJECT_TREE_CORE: {
      return {
        ...state,
        tree: {
          ...state.tree,
          core: payload,
        },
      };
    }
    case SET_CURRENT_PROJECT_ACTIVE_PANE: {
      return {
        ...state,
        tree: {
          ...state.tree,
          active: payload,
        },
      };
    }
    default: {
      return state;
    }
  }
}
