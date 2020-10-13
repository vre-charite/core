import React, { useState, useEffect } from 'react';
import {  Statistic,  Timeline, Tabs } from 'antd';
import { CloudUploadOutlined, CloudDownloadOutlined } from '@ant-design/icons';
import { projectFileCountToday } from '../../../../APIs';

import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

import styles from './index.module.scss';
const { TabPane } = Tabs;

function UserStats(props) {
  const [uploadCount, setUploadCount] = useState(0);
  const [downloadCount, setDownloadCount] = useState(0);
  const [uploadLog, setUploadLog] = useState([]);
  const [downloadLog, setDownloadLog] = useState([]);

  const {
    match: {
      params: { datasetId },
    },
  } = props;


  useEffect(() => {
    projectFileCountToday(datasetId).then((res) => {
      setUploadCount(res.data.result['uploadCount']);
      setDownloadCount(res.data.result['downloadCount']);
      setUploadLog(res.data.result.recentUpload);
      setDownloadLog(res.data.result['recentDownload']);
    });
  }, [datasetId, props.successNum]);
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
  successNum: state.successNum,
}))(withRouter(UserStats));
