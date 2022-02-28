import React from 'react';
import styles from './DatasetHome.module.scss';
import DatasetHomeInfo from './DatasetHomeInfo/DatasetHomeInfo';
import DatasetHomeTags from './DatasetHomeTags/DatasetHomeTags';
import DatasetHomeDescription from './DatasetHomeDescription/DatasetHomeDescription';

export default function DatasetHome(props) {
  return (
    <div className={styles['container']}>
      <div className={styles['info']}>
        <DatasetHomeInfo />
      </div>
      <div className={styles['tags']}>
        <DatasetHomeTags />
      </div>
      <div className={styles['description']}>
        <DatasetHomeDescription />
      </div>
    </div>
  );
}
