import React from 'react';
import { Badge, Popover, Tooltip } from 'antd';
import DatasetFilePanelContent from './DatasetFilePanelContent';
import Icon from '@ant-design/icons';
import styles from './DatasetFilePanel.module.scss';
import { useSelector } from 'react-redux';

const DatasetFilePanel = () => {
  const {
    import: importDataset,
    rename,
    delete: deleteDataset,
    move,
  } = useSelector((state) => state.datasetFileOperations);
  console.log(move);

  const allOperationList = [...importDataset, ...rename, ...deleteDataset, ...move];

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
    <Tooltip title={'Files Panel'} placement="top">
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
