import React, { useState, useEffect } from 'react';
import { Statistic, Timeline, Tabs, Button } from 'antd';
import {
  CloudUploadOutlined,
  CloudDownloadOutlined,
  CopyOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import { useSelector } from 'react-redux';

import { projectFileCountToday, fileAuditLogsAPI } from '../../../../APIs';

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
  const [copyCount, setCopyCount] = useState(0);
  const [copyLogs, setCopyLogs] = useState([]);
  const [deleteCount, setDeleteCount] = useState(0);
  const [deleteLogs, setDeleteLogs] = useState([]);

  const {
    match: {
      params: { datasetId },
    },
  } = props;

  const projectInfo = useSelector((state) => state.project);

  const currentDataset = projectInfo.profile;

  const currentPermission =
    props.containersPermission &&
    props.containersPermission.find((el) => el.id === parseInt(datasetId));

  useEffect(() => {
    projectFileCountToday(datasetId).then((res) => {
      let uploadLog = [];
      let downloadLog = [];

      if (res.data.result['recentUpload']) {
        uploadLog = res.data.result['recentUpload'].filter((i) => {
          let { createTime } = i['attributes'];
          const localTime = timeConvert(createTime, 'datetime');

          return (
            moment().startOf('day') < moment(localTime) &&
            moment().endOf('day') > moment(localTime)
          );
        });
      }

      if (res.data.result['recentDownload']) {
        downloadLog = res.data.result['recentDownload'].filter((i) => {
          let { createTime } = i['attributes'];
          const localTime = timeConvert(createTime, 'datetime');

          return (
            moment().startOf('day') < moment(localTime) &&
            moment().endOf('day') > moment(localTime)
          );
        });
      }

      setUploadCount(uploadLog.length);
      setDownloadCount(downloadLog.length);
      setUploadLog(uploadLog);
      setDownloadLog(downloadLog);
    });
    if (currentPermission === undefined) {
      console.err('currentPermission is undefined');
      console.log(
        'props.containersPermission',
        props.containersPermission,
        'datasetId',
        datasetId,
      );
    }

    currentDataset &&
      currentPermission &&
      currentPermission.permission === 'admin' &&
      fileAuditLogsAPI({
        page_size: 50,
        page: 0,
        operation_type: 'data_transfer',
        project_code: currentDataset && currentDataset.code,
        operator: props.isAdmin ? null : props.username,
        container_id: datasetId,
        start_date: moment().startOf('day').unix(),
        end_date: moment().endOf('day').unix(),
      }).then((res) => {
        if (res.status === 200 && res.data) {
          const { result, total } = res.data;

          setCopyCount(total);
          setCopyLogs(result);
        }
      });

    currentDataset &&
      fileAuditLogsAPI({
        page_size: 50,
        page: 0,
        operation_type: 'data_delete',
        project_code: currentDataset && currentDataset.code,
        operator: props.isAdmin ? null : props.username,
        container_id: datasetId,
        start_date: moment().startOf('day').unix(),
        end_date: moment().endOf('day').unix(),
      }).then((res) => {
        if (res.status === 200 && res.data) {
          const { result, total } = res.data;

          setDeleteCount(total);
          setDeleteLogs(result);
        }
      });
    // eslint-disable-next-line
  }, [datasetId, props.successNum, currentDataset?.code]);

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
            fontSize: '22px',
          }}
          style={{ paddingRight: '36px', textAlign: 'center' }}
        />
        <Statistic
          title="Downloads (today)"
          value={downloadCount}
          prefix={<CloudDownloadOutlined />}
          style={{ textAlign: 'center', paddingRight: '36px' }}
          valueStyle={{
            color: '#13c2c2',
            fontSize: '22px',
          }}
        />
        {currentPermission && currentPermission.permission === 'admin' ? (
          <Statistic
            title="Copies (today)"
            value={copyCount}
            prefix={<CopyOutlined />}
            style={{ textAlign: 'center', paddingRight: '36px' }}
            valueStyle={{
              color: '#13c2c2',
              fontSize: '22px',
            }}
          />
        ) : null}
        <Statistic
          title="Deletions (today)"
          value={deleteCount}
          prefix={<DeleteOutlined />}
          style={{ textAlign: 'center' }}
          valueStyle={{
            color: '#13c2c2',
            fontSize: '22px',
          }}
        />
      </div>
      <br />
      <Tabs defaultActiveKey="1" tabBarExtraContent={operations}>
        <TabPane tab="Upload Logs" key="1">
          <Timeline>
            {uploadLog.map((i, ind) => {
              let { owner, createTime, fileName } = i['attributes'];
              return (
                <Timeline.Item color="green" key={createTime + ind}>
                  {owner} uploaded {fileName} at{' '}
                  {timeConvert(createTime, 'datetime')}
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
                  {downloader} downloaded {fileName} at{' '}
                  {timeConvert(createTime, 'datetime')}
                </Timeline.Item>
              );
            })}
          </Timeline>
        </TabPane>
        {currentPermission && currentPermission.permission === 'admin' ? (
          <TabPane tab="Copy Logs" key="3">
            <Timeline>
              {copyLogs.map((i, ind) => {
                let { operator, createTime, fileName } = i['attributes'];
                return (
                  <Timeline.Item color="green" key={ind}>
                    {operator} copied {fileName} at{' '}
                    {moment(createTime * 1000).format('YYYY-MM-DD HH:mm:ss')}
                  </Timeline.Item>
                );
              })}
            </Timeline>
          </TabPane>
        ) : null}

        <TabPane tab="Delete Logs" key="4">
          <Timeline>
            {deleteLogs.map((i, ind) => {
              let { operator, createTime, fileName } = i['attributes'];
              return (
                <Timeline.Item color="green" key={ind}>
                  {operator} deleted {fileName} at{' '}
                  {moment(createTime * 1000).format('YYYY-MM-DD HH:mm:ss')}
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
  successNum: state.successNum,
  username: state.username,
}))(withRouter(UserStats));
