import { FILE_EXPLORER_TABLE } from '../actionTypes';
import _ from 'lodash';
/* const init = {
  loading: false,
  currentPlugin: '',
  route: [], // current geid can be found in the last item of the array,
  page: 0,
  total: 0,
  pageSize: 10,
  sortBy: 'createTime',
  sortOrder: 'desc',
  filter: {},
  columnsComponentMap: {},
  dataOriginal: [],
  data: [],
  selection: [],
}; */

const getInit = () => {
  return {
    loading: false,
    currentPlugin: '',
    route: [], // current geid can be found in the last item of the array,
    page: 0,
    total: 0,
    pageSize: 10,
    sortBy: 'createTime',
    sortOrder: 'desc',
    filter: {},
    columnsComponentMap: null,
    dataOriginal: [],
    data: [],
    selection: [],
    propertyRecord: null,
    isSidePanelOpen: false,
    refreshNum: 0,
    sourceType: 'Project', //"Project"|"Folder"|"TrashFile"
    currentGeid: '',
    hardFreshKey: 0,
  };
};

/* the key will be the geid, the value format will be the object above */
const init = {};

export function fileExplorerTable(state = init, action) {
  const { type, payload } = action;
  if (!Object.values(FILE_EXPLORER_TABLE).includes(type)) {
    return state;
  }
  const { geid, param } = payload;
  if (!geid) return state;
  switch (type) {
    case FILE_EXPLORER_TABLE.ADD: {
      const newState = _.cloneDeep(state);
      newState[geid] = getInit();
      return newState;
    }
    case FILE_EXPLORER_TABLE.REMOVE: {
      const newState = _.cloneDeep(state);
      delete newState[geid];
      return newState;
    }
    case FILE_EXPLORER_TABLE.SET_LOADING: {
      const newState = _.cloneDeep(state);
      if (!newState[geid]) {
        newState[geid] = getInit();
      }
      newState[geid].loading = param;
      return newState;
    }
    case FILE_EXPLORER_TABLE.SET_CURRENT_PLUGIN: {
      const newState = _.cloneDeep(state);
      if (!newState[geid]) {
        newState[geid] = getInit();
      }
      newState[geid].currentPlugin = param;
      return newState;
    }
    case FILE_EXPLORER_TABLE.SET_DATA: {
      const newState = _.cloneDeep(state);
      if (!newState[geid]) {
        newState[geid] = getInit();
      }
      newState[geid].data = param;
      return newState;
    }
    case FILE_EXPLORER_TABLE.SET_DATA_ORIGINAL: {
      const newState = _.cloneDeep(state);
      if (!newState[geid]) {
        newState[geid] = getInit();
      }
      newState[geid].dataOriginal = param;
      return newState;
    }
    case FILE_EXPLORER_TABLE.SET_COLUMNS_COMP_MAP: {
      const newState = _.cloneDeep(state);
      if (!newState[geid]) {
        newState[geid] = getInit();
      }
      newState[geid].columnsComponentMap = param;
      return newState;
    }
    case FILE_EXPLORER_TABLE.SET_ROUTE: {
      const newState = _.cloneDeep(state);
      if (!newState[geid]) {
        newState[geid] = getInit();
      }
      newState[geid].route = param;
      return newState;
    }
    case FILE_EXPLORER_TABLE.SET_PAGE: {
      const newState = _.cloneDeep(state);
      if (!newState[geid]) {
        newState[geid] = getInit();
      }
      newState[geid].page = param;
      return newState;
    }
    case FILE_EXPLORER_TABLE.SET_TOTAL: {
      const newState = _.cloneDeep(state);
      if (!newState[geid]) {
        newState[geid] = getInit();
      }
      newState[geid].total = param;
      return newState;
    }
    case FILE_EXPLORER_TABLE.SET_PAGE_SIZE: {
      const newState = _.cloneDeep(state);
      if (!newState[geid]) {
        newState[geid] = getInit();
      }
      newState[geid].pageSize = param;
      return newState;
    }
    case FILE_EXPLORER_TABLE.SET_SORT_BY: {
      const newState = _.cloneDeep(state);
      if (!newState[geid]) {
        newState[geid] = getInit();
      }
      newState[geid].sortBy = param;
      return newState;
    }

    case FILE_EXPLORER_TABLE.SET_SORT_ORDER: {
      const newState = _.cloneDeep(state);
      if (!newState[geid]) {
        newState[geid] = getInit();
      }
      newState[geid].sortOrder = param;
      return newState;
    }
    case FILE_EXPLORER_TABLE.SET_FILTER: {
      const newState = _.cloneDeep(state);
      if (!newState[geid]) {
        newState[geid] = getInit();
      }
      newState[geid].filter = param;
      return newState;
    }
    case FILE_EXPLORER_TABLE.SET_PROPERTY_RECORD: {
      const newState = _.cloneDeep(state);
      if (!newState[geid]) {
        newState[geid] = getInit();
      }
      newState[geid].propertyRecord = param;
      return newState;
    }
    case FILE_EXPLORER_TABLE.SET_SIDE_PANEL_OPEN: {
      const newState = _.cloneDeep(state);
      if (!newState[geid]) {
        newState[geid] = getInit();
      }
      newState[geid].isSidePanelOpen = param;
      return newState;
    }
    case FILE_EXPLORER_TABLE.SET_SELECTION: {
      const newState = _.cloneDeep(state);
      if (!newState[geid]) {
        newState[geid] = getInit();
      }
      newState[geid].selection = param;
      return newState;
    }
    case FILE_EXPLORER_TABLE.SET_SOURCE_TYPE: {
      const newState = _.cloneDeep(state);
      if (!newState[geid]) {
        newState[geid] = getInit();
      }
      newState[geid].sourceType = param;
      return newState;
    }
    case FILE_EXPLORER_TABLE.REFRESH_TABLE: {
      const newState = _.cloneDeep(state);
      if (!newState[geid]) {
        newState[geid] = getInit();
      }
      newState[geid].refreshNum = newState[geid].refreshNum + 1;
      return newState;
    }

    case FILE_EXPLORER_TABLE.SET_CURRENT_GEID: {
      const newState = _.cloneDeep(state);
      if (!newState[geid]) {
        newState[geid] = getInit();
      }
      newState[geid].currentGeid = param;
      return newState;
    }

    case FILE_EXPLORER_TABLE.SET_HARD_REFRESH_KEY: {
      const newState = _.cloneDeep(state);
      if (!newState[geid]) {
        newState[geid] = getInit();
      }
      newState[geid].hardFreshKey = newState[geid].hardFreshKey + 1;
      return newState;
    }

    default:
      return state;
  }
}
