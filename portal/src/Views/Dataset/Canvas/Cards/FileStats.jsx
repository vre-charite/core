import React, { useState, useEffect } from 'react';
import { Statistic } from 'antd';
import {
  FileOutlined,
  FolderOpenOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { projectFileCountTotal, getUsersOnDatasetAPI } from '../../../../APIs';

import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import styles from './index.module.scss';
function FileStats(props) {
  const [rawCount, setRawCount] = useState(0);
  const [processedCount, setProcessedCount] = useState(0);
  const [adminCount, setAdminCount] = useState(0);
  const [uploaderCount, setUploaderCount] = useState(0);

  const {
    match: {
      params: { datasetId },
    },
  } = props;

  useEffect(() => {
    projectFileCountTotal(datasetId).then((res) => {
      setRawCount(res.data.result['rawFileCount']);
      setProcessedCount(res.data.result['processFileCount']);
    });
    getUsersOnDatasetAPI(datasetId).then((res) => {
      let users = res.data.result;
      setAdminCount(users.filter((i) => i.permission === 'admin').length);
      setUploaderCount(
        users.filter((i) => i.permission === 'contributor').length,
      );
    });
  }, [datasetId]);

  return (
    <div style={{ marginTop: 0 }}>
      <div className={styles.stats}>
        <Statistic
          title="Raw Files"
          value={rawCount}
          className={styles.antStatistic}
          prefix={<FileOutlined />}
          valueStyle={{
            color: '#13c2c2',
            fontSize: '20px',
          }}
        />
      </div>
      <div className={styles.stats}>
        <Statistic
          title="Processed Files"
          className={styles.antStatistic}
          value={processedCount}
          prefix={<FolderOpenOutlined />}
          valueStyle={{
            color: '#13c2c2',
            fontSize: '20px',
          }}
        />
      </div>
      <div className={styles.stats}>
        <Statistic
          className={styles.antStatistic}
          title="Administrators"
          value={adminCount}
          prefix={<UserOutlined />}
          valueStyle={{
            color: '#13c2c2',
            fontSize: '20px',
          }}
        />
      </div>
      <div className={styles.stats}>
        <Statistic
          title="Contributors"
          className={styles.antStatistic}
          value={uploaderCount}
          prefix={<UserOutlined />}
          valueStyle={{
            color: '#13c2c2',
            fontSize: '20px',
          }}
        />
      </div>
    </div>
  );
}

export default connect((state) => ({
  containersPermission: state.containersPermission,
  datasetList: state.datasetList,
}))(withRouter(FileStats));
