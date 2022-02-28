import React, { useEffect, useRef, useCallback } from 'react';
import { Badge, Popover, Tooltip, message } from 'antd';
import DatasetFilePanelContent from './DatasetFilePanelContent';
import { countStatus, fetchFileOperations } from './utility';
import Icon from '@ant-design/icons';
import styles from './DatasetFilePanel.module.scss';
import { useSelector, useDispatch } from 'react-redux';

const DatasetFilePanel = () => {
  const {
    import: importDataset,
    rename,
    delete: deleteDataset,
    move,
  } = useSelector((state) => state.datasetFileOperations);
  /* const geid = useSelector((state) => state.datasetInfo.basicInfo.geid);
  const isCancelCountInit = useRef(false);

  const dispatch = useCallback(useDispatch(), []);

  useEffect(() => {
    fetchFileOperations('rename', geid, dispatch);
  }, [geid, dispatch]); */

  const allOperationList = [
    ...importDataset,
    ...rename,
    ...deleteDataset,
    ...move,
  ];
  /* const [runningCount, errorCount, finishCount, initCount, cancelCount] =
    countStatus(rename);

  useEffect(() => {
    if (cancelCount > 0 && isCancelCountInit.current) {
      message.warning('The operation has been cancelled!');
    }
  }, [cancelCount]);

  useEffect(() => {
    setTimeout(() => {
      isCancelCountInit.current = true;
    }, 5000);
  }, []); */

  const filePanelStatus = (allOperationList) => {
    if (allOperationList.length === 0) {
      return '';
    }
    const failedList = allOperationList.filter((el) => el.status === 'ERROR');
    if (failedList.length > 0) {
      return 'error';
    } else {
      return 'success';
    }
  };

  return (
    <Tooltip title={'Dataset Status'} placement="top">
      <Popover
        className={styles.file_panel}
        placement="bottomRight"
        content={<DatasetFilePanelContent />}
        trigger="click"
        getPopupContainer={(trigger) => {
          return document.getElementById('global_site_header');
        }}
      >
        <div>
          <Badge
            className={styles.badge}
            status={filePanelStatus(allOperationList)}
          >
            <Icon
              style={{ padding: '15px 15px 5px 15px' }}
              component={() => (
                <img
                  className="pic"
                  src={require('../../../../Images/FilePanel.png')}
                />
              )}
            />
          </Badge>
        </div>
      </Popover>
    </Tooltip>
  );
};

export default DatasetFilePanel;
