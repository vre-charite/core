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

import { useSelector, useDispatch } from 'react-redux';
import { fileExplorerTableActions } from '../../../../Redux/actions';
import { useCurrentProject } from '../../../../Utility';
import { fetchTableData } from './dataFetcher';

export function useDataFetcher(reduxKey) {
  const dispatch = useDispatch();
  const fileExplorerTableState = useSelector(
    (state) => state.fileExplorerTable,
  );
  const { activeReq } = useSelector((state) => state.request2Core);
  const [currentDataset] = useCurrentProject();
  const projectGeid = currentDataset?.globalEntityId;
  if (!fileExplorerTableState[reduxKey]) {
    dispatch(fileExplorerTableActions.setAdd({ geid: reduxKey }));
  }

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
    filter,
  } = fileExplorerTableState[reduxKey] || {};

  return {
    goToRoute(geid, isRoot) {
      return fetchTableData(
        'request',
        isRoot,
        geid,
        0,
        10,
        'uploaded_at',
        'desc',
        {},
        projectGeid,
        dispatch,
        reduxKey,
      );
    },
    init(geid) {
      return fetchTableData(
        'request',
        true,
        geid,
        page,
        pageSize,
        'uploaded_at',
        'desc',
        {},
        projectGeid,
        dispatch,
        reduxKey,
      );
    },
    refresh(geid, isRoot) {
      return fetchTableData(
        'request',
        isRoot,
        geid,
        page,
        pageSize,
        orderType,
        orderBy,
        {},
        projectGeid,
        dispatch,
        reduxKey,
      );
    },
    pageTo(geid, isRoot, page) {
      return fetchTableData(
        'request',
        isRoot,
        geid,
        page,
        pageSize,
        orderBy,
        orderType,
        filter,
        projectGeid,
        dispatch,
        reduxKey,
      );
    },
    changeSorterAndPagination(geid, isRoot, page, sort, order, filter) {
      return fetchTableData(
        'request',
        isRoot,
        geid,
        page,
        pageSize,
        sort,
        order,
        filter,
        projectGeid,
        dispatch,
        reduxKey,
      );
    },
    changePageSize(geid, isRoot, pageSize) {
      return fetchTableData(
        'request',
        isRoot,
        geid,
        page,
        pageSize,
        orderType,
        orderBy,
        {},
        projectGeid,
        dispatch,
        reduxKey,
      );
    },
    goToFolder(geid) {
      return fetchTableData(
        'request',
        false,
        geid,
        0,
        10,
        'uploaded_at',
        'desc',
        {},
        projectGeid,
        dispatch,
        reduxKey,
      );
    },
  };
}
