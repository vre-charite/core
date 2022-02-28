import { getMyDatasetsApi } from '../../../../APIs';
import { store } from '../../../../Redux/store';
import { myDatasetListCreators } from '../../../../Redux/actions';
import { message } from 'antd';
import i18n from '../../../../i18n';
import _ from 'lodash';

const dispatch = store.dispatch;

/**
 *
 * @param {string} username
 * @param {number} page the frontend starts from 1, the backend starts from 0
 * @param {number} pageSize
 */
export const fetchMyDatasets = (username, page = 1, pageSize) => {
  if (!_.isNumber(page)) {
    throw new TypeError('page should be a number');
  }
  if (!_.isNumber(pageSize)) {
    throw new TypeError('pageSize should be a number');
  }
  dispatch(myDatasetListCreators.setLoading(true));

  getMyDatasetsApi(username, page - 1, pageSize)
    .then((res) => {
      dispatch(myDatasetListCreators.setDatasets(res.data.result));
      dispatch(myDatasetListCreators.setTotal(res.data.total));
    })
    .catch((err) => {
      if (err.response?.status === 500) {
        message.error(i18n.t('errormessages:getDatasets.500.0'));
      } else {
        message.error(i18n.t('errormessages:getDatasets.default.0'));
      }
    })
    .finally(() => {
      dispatch(myDatasetListCreators.setLoading(false));
    });
};
