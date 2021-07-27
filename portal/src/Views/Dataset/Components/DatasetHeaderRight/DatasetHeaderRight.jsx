import React, { useState } from 'react';
import { Tag } from 'antd';
import styles from './DatasetHeaderRight.module.scss';
import { useSelector } from 'react-redux';
import { getFileSize } from '../../../../Utility';
import DatasetFilePanel from './DatasetFilePanel/DatasetFilePanel';

export default function DatasetHeaderRight(props) {
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
        {/* <div style={{marginTop: '-4px'}}>
          <DatasetFilePanel />
        </div> */}
      </div>
      <div className={styles['tags-container']}>{getTags(tags)}</div>
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

const getTags = (tags) => {
  if (tags.length <= 3) {
    return tags.map((tag) => <Tag>{tag}</Tag>);
  }

  const hideTags = [...tags.slice(0, 3), `+${tags.length - 3}`];
  return hideTags.map((tag) => <Tag>{tag}</Tag>);
};
