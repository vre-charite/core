import React, { useEffect, useCallback } from 'react';
import { List } from 'antd';
import { FilePanelItem } from '../../FilePanelItem/FilePanelItem';
import { EditOutlined } from '@ant-design/icons';
import { countStatus, parsePath, fetchFileOperations } from '../utility';

import { useSelector, useDispatch } from 'react-redux';

export function Rename(props) {
  const { geid } = props;

  const { rename: renameOperations } = useSelector(
    (state) => state.datasetFileOperations,
  );
  const dispatch = useCallback(useDispatch(), []);

  useEffect(() => {
    fetchFileOperations('rename', geid, dispatch);
  }, [geid, dispatch]);

  const [runningCount, errorCount, finishCount, initCount] =
    countStatus(renameOperations);
  return (
    <>
      <div className={'list-header'}>
        {initCount} waiting, {runningCount} running, {errorCount} error,{' '}
        {finishCount} finish
      </div>
      <List
        dataSource={renameOperations}
        renderItem={(record, index) => {
          const itemProps = {
            originalFullPath: parsePath(record.payload),
            status: record.status,
            icon: <EditOutlined />,
          };
          return <FilePanelItem {...itemProps} />;
        }}
      ></List>
    </>
  );
}
