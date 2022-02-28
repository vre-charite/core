import React, { useState } from 'react';
import { List } from 'antd';
import styles from './NewRequestsList.module.scss';
import { timeConvert } from '../../../../Utility';
import moment from 'moment-timezone';
import { useSelector, useDispatch } from 'react-redux';
import { request2CoreActions } from '../../../../Redux/actions';
import { listAllCopyRequests } from '../../../../APIs';
import { useCurrentProject } from '../../../../Utility';
const NewRequestList = (props) => {
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
      renderItem={(item, index) => (
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
          {item.submittedBy +
            ' / ' +
            moment(item.submittedAt).format('YYYY-MM-DD HH:mm:ss')}
        </List.Item>
      )}
    />
  );
};

export default NewRequestList;
