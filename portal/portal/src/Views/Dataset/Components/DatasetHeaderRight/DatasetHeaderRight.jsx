import React, { useState } from 'react';
import { Tag, Button } from 'antd';
import styles from './DatasetHeaderRight.module.scss';
import { useSelector } from 'react-redux';
import { getFileSize, getTags } from '../../../../Utility';
import DatasetFilePanel from '../DatasetFilePanel/DatasetFilePanel';
import { RocketOutlined } from '@ant-design/icons';
import PublishNewVersion from '../PublishNewVersion/PublishNewVersion';

export default function DatasetHeaderRight(props) {
  const [newVersionModalVisibility, setNewVersionModalVisibility] = useState(false);
  const {
    basicInfo: { size, totalFiles, tags },
  } = useSelector((state) => state.datasetInfo);

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <div style={{ marginRight: '20px' }}>
          <Statistics label="Files">{totalFiles}</Statistics>
          <Statistics label="Size">{getFileSize(size)}</Statistics>
        </div>
        <div style={{ marginTop: '-4px' }}>
          <DatasetFilePanel />
        </div>
      </div>
      <div className={styles['tags-container']}>{getTags(tags)}</div>
      <Button
        icon={<RocketOutlined />}
        type="primary"
        style={{
          position: 'absolute',
          top: '104px',
          right: '0px',
          borderRadius: '6px',
          padding: '0px',
          height: '27px',
          width: '188px',
        }}
        onClick={() => setNewVersionModalVisibility(true)}
      >
        Release new version
      </Button>
      <PublishNewVersion 
        newVersionModalVisibility={newVersionModalVisibility}
        setNewVersionModalVisibility={setNewVersionModalVisibility}
      />
    </>
  );
}

const Statistics = (props) => {
  const { label, children } = props;
  return (
    <span className={styles['statistics']}>
      <span className={styles['statistics-title']}>{label}</span>
      <span className={styles['statistics-value']}>{children}</span>
    </span>
  );
};
