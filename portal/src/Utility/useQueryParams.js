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

import React from 'react';
import { useLocation } from 'react-router-dom';
import _ from 'lodash';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}


/**
 * get query params on the url.
 * @param {string[]} params the params' name
 * @returns {object} an object,with params' name as its key and the query value as its value
 */
export function useQueryParams(params) {
  if (!_.isArray(params)) {
    throw new TypeError('params should be an array of string');
  }
  const queryObj = useQuery();
  const query = {};
  for (const param of new Set(params)) {
      const res = queryObj.get(param);
      if(res){
        query[param] = res;
      }
      
  };
  return query;
}
