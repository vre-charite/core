import React, { useState, useEffect } from 'react';
import styles from './DatasetData.module.scss';
import DatasetDataExplorer from './Components/DatasetDataExplorer/DatasetDataExplorer';
import DatasetDataPreviewer from './Components/DatasetDataPreviewer/DatasetDataPreviewer';
import { datasetDataActions } from '../../../Redux/actions';
import { useSelector, useDispatch } from 'react-redux';
export default function DatasetData() {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(datasetDataActions.clearData());
  }, []);
  return (
    <div className={styles['container']}>
      <div className={styles['explorer']}>
        <DatasetDataExplorer />
      </div>{' '}
      <div className={styles['previewer']}>
        <DatasetDataPreviewer />
      </div>{' '}
    </div>
  );
}
