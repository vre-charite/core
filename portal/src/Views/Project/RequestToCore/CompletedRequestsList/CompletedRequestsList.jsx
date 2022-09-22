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

import React, { useState } from 'react';
import { List } from 'antd';
import styles from './CompletedRequests.module.scss';
import moment from 'moment-timezone';
import { useSelector, useDispatch } from 'react-redux';
import { request2CoreActions } from '../../../../Redux/actions';
import { listAllCopyRequests } from '../../../../APIs';
import { useCurrentProject } from '../../../../Utility';
const CompletedRequestList = (props) => {
  const [currentDataset] = useCurrentProject();
  const projectGeid = currentDataset?.globalEntityId;
  const { activeReq, pageNo, pageSize, total, status } = useSelector(
    (state) => state.request2Core,
  );
  const dispatch = useDispatch();
  const onListClick = (item) => {
    dispatch(request2CoreActions.setActiveReq(item));
  };
  const data = props.reqList ? props.reqList : [];
  async function changePageNo(pageNo) {
    const res = await listAllCopyRequests(projectGeid, status, pageNo, 10);
    if (res.data.result) {
      dispatch(request2CoreActions.setReqList(res.data.result));
      dispatch(
        request2CoreActions.setPagination({
          pageNo: pageNo,
          pageSize,
          total,
        }),
      );
    }
  }
  return (
    <List
      size="large"
      bordered={false}
      dataSource={data}
      pagination={
        total < pageSize
          ? null
          : {
              current: pageNo + 1,
              pageSize,
              total,
              onChange: (page, pageSize) => {
                changePageNo(page - 1);
              },
            }
      }
      renderItem={(item, index) => {
        return (
          <List.Item
            className={`${styles.list_item} ${
              activeReq &&
              activeReq.id === item.id &&
              styles.list_item_backgroundColor
            }`}
            id={item.id}
            style={{ cursor: 'pointer' }}
            onClick={(e) => {
              onListClick(item);
            }}
          >
            <div>
              <p
                style={{
                  margin: 0,
                }}
              >
                {item.submittedBy +
                  ' / ' +
                  moment(item.submittedAt).format('YYYY-MM-DD HH:mm:ss')}
              </p>
              <p
                style={{
                  color: '#818181',
                  fontSize: 12,
                  fontStyle: 'italic',
                  margin: 0,
                }}
              >
                By{' '}
                {item.completedBy && item.completedAt
                  ? item.completedBy +
                    ' / ' +
                    moment(item.submittedAt).format('YYYY-MM-DD HH:mm:ss')
                  : 'N/A'}
              </p>
            </div>
          </List.Item>
        );
      }}
    />
  );
};

export default CompletedRequestList;
