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

import { COPY_REQUEST } from '../actionTypes';
import _ from 'lodash';
const init = {
  reqList: [],
  activeReq: null,
  status: 'pending',
  pageNo: 0,
  pageSize: 10,
  total: 0,
};
export default function (state = init, action) {
  const { type, payload } = action;
  switch (type) {
    case COPY_REQUEST.SET_STATUS: {
      return { ...state, status: payload };
    }
    case COPY_REQUEST.SET_REQ_LIST: {
      return { ...state, reqList: payload };
    }
    case COPY_REQUEST.SET_ACTIVE_REQ: {
      return {
        ...state,
        activeReq: payload,
      };
    }
    case COPY_REQUEST.SET_PAGINATION: {
      return {
        ...state,
        pageNo: payload.pageNo,
        pageSize: payload.pageSize,
        total: payload.total,
      };
    }
    default: {
      return state;
    }
  }
}
