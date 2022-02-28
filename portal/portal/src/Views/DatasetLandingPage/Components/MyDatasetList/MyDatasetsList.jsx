import React, { useEffect } from 'react';
import { List } from 'antd';
import DatasetCard from '../DatasetCard/DatasetCard';
import styles from './MyDatasetsList.module.scss';
import { useSelector } from 'react-redux';
import { fetchMyDatasets } from './fetchMyDatasets';
import { useHistory } from 'react-router-dom';
import { useQueryParams } from '../../../../Utility';

function MyDatasetsList() {
  
  const { loading, datasets, total } = useSelector(
    (state) => state.myDatasetList,
  );
  const { username } = useSelector((state) => state);
  const { page = 1, pageSize = 10 } = useQueryParams(['pageSize', 'page']);
  const history = useHistory();

  useEffect(() => {
    username && fetchMyDatasets(username, parseInt(page), parseInt(pageSize));
  }, [username, page, pageSize]);

  const onPageChange = (page, pageSize) => {
    history.push(`/datasets?page=${page}&pageSize=${pageSize}`);
  };

  const onShowSizeChange = (page, pageSize) => {
    history.push(`/datasets?page=${page}&pageSize=${pageSize}`);
  };

  const paginationProps = {
    showSizeChanger: true,
    current: parseInt(page) ,
    pageSize: parseInt(pageSize),
    onChange: onPageChange,
    total,
    onShowSizeChange: onShowSizeChange,
  };

  return (
    <div className={styles['my-dataset-list']}>
      <List
        loading={loading}
        dataSource={datasets}
        renderItem={(item, index) => {
          return <DatasetCard dataset={item} />;
        }}
        pagination={paginationProps}
      ></List>
    </div>
  );
}

export default MyDatasetsList;
