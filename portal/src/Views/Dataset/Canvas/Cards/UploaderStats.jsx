import React, { useState, useEffect } from 'react';
import { Typography, Statistic, Row, Col, Timeline, Tabs } from 'antd';
import { CloudUploadOutlined, CloudDownloadOutlined } from '@ant-design/icons';
import { projectFileCountToday } from '../../../../APIs';

import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import _ from 'lodash';
import styles from './index.module.scss';
const { Title } = Typography;
const { TabPane } = Tabs;

function UserStats(props) {
  const [uploadCount, setUploadCount] = useState(0);
  const [downloadCount, setDownloadCount] = useState(0);
  const [uploadLog, setUploadLog] = useState([]);
  const [downloadLog, setDownloadLog] = useState([]);

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
    projectFileCountToday(datasetId, false).then((res) => {
      setUploadCount(res.data.result['upload_count']);
      setDownloadCount(res.data.result['download_count']);
      setUploadLog(res.data.result['recent_upload']);
      setDownloadLog(res.data.result['recent_download']);
    });
  }, []);
  return (
    <>
      <div className={styles.userStats}>
        <Statistic
          title="Uploads (today)"
          value={uploadCount}
          prefix={<CloudUploadOutlined />}
          valueStyle={{
            color: '#13c2c2',
            fontWeight: 'bold',
            fontSize: '32px',
          }}
          style={{ paddingRight: '36px' }}
        />
        <Statistic
          title="Downloads (today)"
          value={downloadCount}
          prefix={<CloudDownloadOutlined />}
          valueStyle={{
            color: '#a0d911',
            fontWeight: 'bold',
            fontSize: '32px',
          }}
        />
      </div>
      <br />
      <Tabs defaultActiveKey="1">
        <TabPane tab="Upload Logs" key="1">
          <Timeline>
            {uploadLog.map((i) => {
              let { owner, createTime, fileName } = i['attributes'];
              return (
                <Timeline.Item color="green">
                  {owner} uploaded {fileName} at {createTime}
                </Timeline.Item>
              );
            })}
          </Timeline>
        </TabPane>
        <TabPane tab="Download Logs" key="2">
          <Timeline>
            {downloadLog.map((i) => {
              let { downloader, createTime, fileName } = i['attributes'];
              return (
                <Timeline.Item color="green">
                  {downloader} downloaded {fileName} at {createTime}
                </Timeline.Item>
              );
            })}
          </Timeline>
        </TabPane>
      </Tabs>
    </>
  );
}

export default connect((state) => ({
  containersPermission: state.containersPermission,
  datasetList: state.datasetList,
}))(withRouter(UserStats));
