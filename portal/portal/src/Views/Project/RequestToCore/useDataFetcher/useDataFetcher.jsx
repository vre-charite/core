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
