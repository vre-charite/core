import React, { useEffect, useCallback } from 'react';
import { List } from 'antd';
import { FilePanelItem } from '../../FilePanelItem/FilePanelItem';
import { SyncOutlined } from '@ant-design/icons';
import { countStatus, parsePath, fetchFileOperations } from '../utility';
import { useSelector, useDispatch } from 'react-redux';

export function Import(props) {
  const { geid } = props;

  const { import: importOperations } = useSelector(
    (state) => state.datasetFileOperations,
  );
  const dispatch = useCallback(useDispatch(), []);

  useEffect(() => {
    fetchFileOperations('import', geid, dispatch);
  }, [geid, dispatch]);

  const [runningCount, errorCount, finishCount, initCount, cancelCount] =
    countStatus(importOperations);

  return (
    <>
      <div className={'list-header'}>
        {' '}
        {initCount} waiting, {runningCount} running, {errorCount} error,{' '}
        {finishCount} finish, {cancelCount} cancelled
      </div>
      <List
        dataSource={importOperations}
        renderItem={(record, index) => {
          const itemProps = {
            originalFullPath: record.payload.name,
            status: record.status,
            icon: <SyncOutlined />,
          };
          return <FilePanelItem {...itemProps} />;
        }}
      ></List>
    </>
  );
}
