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

import { TRIGGER_EVENT } from '../actionTypes';

const init = {
  LOAD_COPY_LIST: 0,
  LOAD_DELETED_LIST: 0,
};
function events(state = init, action) {
  const { type, payload } = action;
  switch (type) {
    case TRIGGER_EVENT: {
      if (typeof state[payload] !== 'undefined') {
        state[payload] = state[payload] + 1;
      }
      return state;
    }
    default: {
      return state;
    }
  }
}

export default events;
