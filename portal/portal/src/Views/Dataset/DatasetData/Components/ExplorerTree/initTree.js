import { listDatasetFiles } from '../../../../../APIs';
import { datasetDataActions } from '../../../../../Redux/actions';
import { store } from '../../../../../Redux/store';
const page = 0,
  pageSize = 10000,
  orderBy = 'create_time',
  orderType = 'desc';

async function initTree() {
  const datasetInfo = store.getState().datasetInfo.basicInfo;
  const datasetGeid = datasetInfo.geid;

  const res = await listDatasetFiles(
    datasetGeid,
    null,
    page,
    pageSize,
    orderBy,
    orderType,
    {},
  );
  store.dispatch(datasetDataActions.resetTreeKey());
  store.dispatch(datasetDataActions.setTreeData(res?.data?.result?.data));
  store.dispatch(datasetDataActions.setTreeLoading(false));
}

export { initTree };
