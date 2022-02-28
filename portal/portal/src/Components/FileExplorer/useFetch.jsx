import React, { useState, useEffect,useContext } from 'react';
import { useSelector } from 'react-redux';
import {useDispatch} from 'react-redux'

/**
 *
 * @param {string} key the key of this file explorer instance, to get data from redux
 */
function useFetch(key,contextObject) {
    
  const fileExplorerTableState = useSelector(
    (state) => state.fileExplorerTable,
  );
  const dispatch = useDispatch();
  const {
    data,
    loading,
    pageSize,
    page,
    total,
    columnsComponentMap,
    isSidePanelOpen,
    selection,
    currentPlugin,
    refreshNum,
    hardFreshKey,
    currentGeid,
    orderType,
    orderBy,
  } = fileExplorerTableState[key] || {};


  const toPage = (page)=>{
    //disPatch the page to redux
    // call the API
    contextObject.toPage();
  }
  const changePageSize = (pageSize)=>{
      //dispatch the new page size to redux
      // call the API 
  }

  const refresh = ()=>{
      //pure refresh, without changing any parameter
  };

  const hardRefresh = ()=>{
      // reset all parameter and refresh the table
  }

  // this method will only used by customized plugins
  const customizeFetch = (paramsObject)=>{
      // call the API with this params object
      // fetch.customizedFetch({page,pageSize, ...others})
  };

  const fetcher = {
      toPage,
      changePageSize,
      refresh,
      hardRefresh,
      customizeFetch
  }
  return fetcher;
};


// usage
const fetcher = useFetch('1234');

const onChange = (page)=>{
    onEvent({type:'changePage'},null);
    
}
