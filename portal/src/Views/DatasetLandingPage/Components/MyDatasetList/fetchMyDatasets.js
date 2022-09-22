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
