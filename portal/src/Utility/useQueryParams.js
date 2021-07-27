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
