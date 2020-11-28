import React, { useState, useEffect } from 'react';
import { Statistic, Timeline, Tabs, Button } from 'antd';
import { CloudUploadOutlined, CloudDownloadOutlined } from '@ant-design/icons';
import { projectFileCountToday } from '../../../../APIs';

import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import moment from 'moment';

import { timeConvert } from '../../../../Utility';
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
      let uploadLog = [];
      let downloadLog = [];

      if (res.data.result['recentUpload']) {
        uploadLog = res.data.result['recentUpload'].filter((i) => {
          let { createTime} = i['attributes'];
          const localTime = timeConvert(createTime, 'datetime');
          
          return (moment().startOf('day') < moment(localTime) && moment().endOf('day') > moment(localTime)) ;
        })
      }

      if (res.data.result['recentDownload']) {
        downloadLog = res.data.result['recentDownload'].filter((i) => {
          let { createTime} = i['attributes'];
          const localTime = timeConvert(createTime, 'datetime');
          
          return (moment().startOf('day') < moment(localTime) && moment().endOf('day') > moment(localTime)) ;
        })
      }

      setUploadCount(uploadLog.length);
      setDownloadCount(downloadLog.length);
      setUploadLog(uploadLog);
      setDownloadLog(downloadLog);
    });
  }, [datasetId, props.successNum]);

  const operations = (
    <Button type="primary" size="small" onClick={props.onExpand}>
      Advanced Search
    </Button>
  );

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
      <Tabs defaultActiveKey="1" tabBarExtraContent={operations}>
        <TabPane tab="Upload Logs" key="1">
          <Timeline>
            {uploadLog.map((i) => {
              let { owner, createTime, fileName } = i['attributes'];
              return (
                <Timeline.Item color="green" key={createTime}>
                  {owner} uploaded {fileName} at {timeConvert(createTime, 'datetime')}
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
                  {downloader} downloaded {fileName} at {timeConvert(createTime, 'datetime')}
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
