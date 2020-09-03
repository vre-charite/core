import React, { useState, useEffect } from 'react';
import { Typography, Statistic, Row, Col } from 'antd';
import {
  FileOutlined,
  FolderOpenOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { projectFileCountTotal, getUsersOnDatasetAPI } from '../../../../APIs';

import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import _ from 'lodash';
import styles from './index.module.scss';
const { Title } = Typography;
function FileStats(props) {
  const [rawCount, setRawCount] = useState(0);
  const [processedCount, setProcessedCount] = useState(0);
  const [adminCount, setAdminCount] = useState(0);
  const [uploaderCount, setUploaderCount] = useState(0);

  const {
    containersPermission,
    match: {
      params: { datasetId },
    },
    content,
    datasetList,
  } = props;

  const currentContainer =
    containersPermission &&
    containersPermission.find((ele) => {
      return parseInt(ele.container_id) === parseInt(datasetId);
    });

  const printDetails = () => {
    if (datasetList.length > 0) {
      const currentDataset = _.find(
        datasetList[0].datasetList,
        (d) => d.id === parseInt(datasetId),
      );
      return;
    }
  };

  useEffect(() => {
    projectFileCountTotal(datasetId).then((res) => {
      setRawCount(res.data.result['raw_file_count']);
      setProcessedCount(res.data.result['process_file_count']);
    });
    getUsersOnDatasetAPI(datasetId).then((res) => {
      let users = res.data.result;
      setAdminCount(users.filter((i) => i.permission === 'admin').length);
      setUploaderCount(users.filter((i) => i.permission === 'uploader').length);
    });
  }, []);

  return (
    <>
      <div className={styles.stats}>
        <Statistic
          title="Raw Files"
          value={rawCount}
          prefix={<FileOutlined />}
          valueStyle={{
            color: '#13c2c2',
            fontWeight: 'bold',
            fontSize: '28px',
          }}
        />
      </div>
      <div className={styles.stats}>
        <Statistic
          title="Processed Files"
          value={processedCount}
          prefix={<FolderOpenOutlined />}
          valueStyle={{
            color: '#08979c',
            fontWeight: 'bold',
            fontSize: '28px',
          }}
        />
      </div>
      <div className={styles.stats}>
        <Statistic
          title="Admins"
          value={adminCount}
          prefix={<UserOutlined />}
          valueStyle={{
            color: '#13c2c2',
            fontWeight: 'bold',
            fontSize: '28px',
          }}
        />
      </div>
      <div className={styles.stats}>
        <Statistic
          title="Uploaders"
          value={uploaderCount}
          prefix={<UserOutlined />}
          valueStyle={{
            color: '#08979c',
            fontWeight: 'bold',
            fontSize: '28px',
          }}
        />
      </div>
    </>
  );
}

export default connect((state) => ({
  containersPermission: state.containersPermission,
  datasetList: state.datasetList,
}))(withRouter(FileStats));
