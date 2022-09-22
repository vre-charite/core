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

import { getRequestFiles } from '../../APIs';
import { fileExplorerTableActions } from '../../Redux/actions';
import { getFileManifestAttrs, getRequestFilesDetailByGeid } from '../../APIs';
import _ from 'lodash';
import { message } from 'antd';
class RequestDataSource {
  fetchRoot(
    requstGeid,
    page,
    pageSize,
    order,
    orderType,
    filter,
    partial,
    projectGeid,
  ) {
    return getRequestFiles(
      requstGeid,
      page,
      pageSize,
      order,
      orderType,
      filter,
      partial,
      projectGeid,
      null,
    );
  }
  fetchFolder(
    requstGeid,
    page,
    pageSize,
    order,
    orderType,
    filter,
    partial,
    projectGeid,
    parentGeid,
  ) {
    return getRequestFiles(
      requstGeid,
      page,
      pageSize,
      order,
      orderType,
      filter,
      partial,
      projectGeid,
      parentGeid,
    );
  }
}

const convertSortKey = (sortKey) => {
  const sortKeyMap = {
    fileName: 'name',
    fileSize: 'file_size',
    createTime: 'uploaded_at',
    owner: 'uploaded_by',
  };
  return sortKeyMap[sortKey] || sortKey;
};

export const fetchTableData = async (
  sourceType,
  isRoot,
  geid,
  page,
  pageSize,
  order,
  orderType,
  filter,
  projectGeid,
  dispatch,
  reduxKey,
) => {
  order = convertSortKey(order);
  orderType = orderType === 'ascend' ? 'asc' : 'desc';
  dispatch(
    fileExplorerTableActions.setLoading({ geid: reduxKey, param: true }),
  );
  let res;
  let files, total;
  try {
    if (sourceType === 'request') {
      const dataSource = new RequestDataSource();
      if (isRoot) {
        res = await dataSource.fetchRoot(
          geid,
          page,
          pageSize,
          order,
          orderType,
          filter,
          [],
          projectGeid,
          null,
        );
      } else {
        const requestGeid = reduxKey.split('-').slice(1).join('-');
        res = await dataSource.fetchFolder(
          requestGeid,
          page,
          pageSize,
          order,
          orderType,
          filter,
          [],
          projectGeid,
          geid,
        );
      }

      files = res.data?.result?.entities;
      total = res.data?.result?.approximateCount;
      const filesWithDetail = [];
      try {
        const fileDetailRes = await getRequestFilesDetailByGeid(
          files.map((file) => file['geid']),
        );

        for (let i = 0; i < fileDetailRes.data.result.length; i++) {
          const file = files[i];
          const detail = _.find(
            fileDetailRes.data.result,
            (detail) => detail.globalEntityId === file.geid,
          );
          filesWithDetail.push(_.assign(file, detail));
        }
      } catch (error) {
        if(error.response?.status !== 400){
          message.error(`Failed to get file detail`)
        }
      }

      dispatch(
        fileExplorerTableActions.setData({
          geid: reduxKey,
          param: filesWithDetail,
        }),
      );
      dispatch(
        fileExplorerTableActions.setTotal({ geid: reduxKey, param: total }),
      );

      const routes = res.data?.result?.routing;
      if (routes) {
        dispatch(
          fileExplorerTableActions.setRoute({ geid: reduxKey, param: routes }),
        );
      } else {
        dispatch(
          fileExplorerTableActions.setRoute({ geid: reduxKey, param: [] }),
        );
      }
    }
  } catch (e) {
    console.log(e);
  } finally {
    dispatch(
      fileExplorerTableActions.setLoading({ geid: reduxKey, param: false }),
    );
    if (res) return res;
  }
};
