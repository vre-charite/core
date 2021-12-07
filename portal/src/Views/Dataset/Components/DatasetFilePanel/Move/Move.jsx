import React, { useEffect, useCallback } from 'react';
import { List } from 'antd';
import { FilePanelItem } from '../../FilePanelItem/FilePanelItem';
import { SwapOutlined } from '@ant-design/icons';
import { countStatus, parsePath, fetchFileOperations } from '../utility';
import { useSelector, useDispatch } from 'react-redux';

export function Move(props) {
  const { geid } = props;

  const {
    move: moveOperations,
    loadingStatus: { move: moveLoadingStatus },
  } = useSelector((state) => state.datasetFileOperations);

  const dispatch = useCallback(useDispatch(), []);

  useEffect(() => {
    fetchFileOperations('move', geid, dispatch);
  }, [geid, dispatch]);

  const [runningCount, errorCount, finishCount, initCount, cancelCount] =
    countStatus(moveOperations);

  return (
    <>
      <div className={'list-header'}>
        {initCount} waiting, {runningCount} running, {errorCount} error,{' '}
        {finishCount} finish, {cancelCount} cancelled
      </div>
      <List
        dataSource={moveOperations}
        loading={moveLoadingStatus}
        renderItem={(record, index) => {
          const itemProps = {
            originalFullPath: parsePath(record.payload),
            status: record.status,
            icon: <SwapOutlined />,
          };
          return <FilePanelItem {...itemProps} />;
        }}
      ></List>
    </>
  );
}
