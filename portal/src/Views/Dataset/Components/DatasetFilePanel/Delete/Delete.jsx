import React, { useEffect, useCallback } from 'react';
import { List } from 'antd';
import { FilePanelItem } from '../../FilePanelItem/FilePanelItem';
import { DeleteOutlined } from '@ant-design/icons';
import { countStatus, parsePath, fetchFileOperations } from '../utility';
import { useSelector, useDispatch } from 'react-redux';

export function Delete(props) {
  const { geid } = props;
  const { delete: deleteOperations } = useSelector(
    (state) => state.datasetFileOperations,
  );

  const dispatch = useCallback(useDispatch(), []);

  useEffect(() => {
    fetchFileOperations('delete', geid, dispatch);
  }, [geid, dispatch]);

  const [runningCount, errorCount, finishCount, initCount, cancelCount] =
    countStatus(deleteOperations);

  return (
    <>
      <div className={'list-header'}>
        {' '}
        {initCount} waiting, {runningCount} running, {errorCount} error,{' '}
        {finishCount} finish, {cancelCount} cancelled
      </div>
      <List
        dataSource={deleteOperations}
        renderItem={(record, index) => {
          const itemProps = {
            originalFullPath: parsePath(record.payload),
            status: record.status,
            icon: <DeleteOutlined />,
          };
          return <FilePanelItem {...itemProps} />;
        }}
      ></List>
    </>
  );
}
