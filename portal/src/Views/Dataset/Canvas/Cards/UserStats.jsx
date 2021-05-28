import React, { useState, useEffect } from 'react';
import { Col, Row, Empty, Tooltip } from 'antd';
import { useSelector } from 'react-redux';
import {
  CloudUploadOutlined,
  DownloadOutlined,
  CopyOutlined,
  DeleteOutlined,
} from '@ant-design/icons';

import { getAuditLogsApi } from '../../../../APIs';

import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import moment from 'moment';
import styles from './index.module.scss';

function UserStats(props) {
  const [uploadLog, setUploadLog] = useState([]);
  const [downloadLog, setDownloadLog] = useState([]);
  const [copyLogs, setCopyLogs] = useState([]);
  const [deleteLogs, setDeleteLogs] = useState([]);
  const {
    match: {
      params: { datasetId },
    },
  } = props;

  const format = 'YYYY-MM-DD h:mm:ss';

  const checkTimeForToday = (timeStamp) => {
    return (
      moment().startOf('day').unix() < timeStamp &&
      moment().endOf('day').unix() > timeStamp
    );
  };

  const projectInfo = useSelector((state) => state.project);

  const currentDataset = projectInfo.profile;

  const currentPermission =
    props.containersPermission &&
    props.containersPermission.find((el) => el.id === parseInt(datasetId));

  useEffect(() => {
    if (currentDataset) {
      const paginationParams = {
        page_size: 10,
        page: 0,
      };
      const query = {
        project_code: currentDataset && currentDataset.code,
        start_date: moment('19700101', 'YYYYMMDD').unix(),
        end_date: moment().endOf('day').unix(),
        resource: 'file',
      };

      getAuditLogsApi(datasetId, paginationParams, query).then((res) => {
        const { result } = res.data;

        const deleteList = result.reduce((filtered, el) => {
          let { action } = el['source'];

          if (action === 'data_delete') {
            filtered.push({
              ...el['source'],
              tag: 'delete',
              userName: props.username,
            });
          }
          return filtered;
        }, []);

        const copyList = result.reduce((filtered, el) => {
          let { action } = el['source'];

          if (action === 'data_transfer') {
            filtered.push({
              ...el['source'],
              tag: 'copy',
              userName: props.username,
            });
          }
          return filtered;
        }, []);

        const uploadList = result.reduce((filtered, el) => {
          let { action } = el['source'];

          if (action === 'data_upload') {
            filtered.push({
              ...el['source'],
              tag: 'upload',
              userName: props.username,
            });
          }
          return filtered;
        }, []);

        const downloadList = result.reduce((filtered, el) => {
          let { action } = el['source'];

          if (action === 'data_download') {
            filtered.push({
              ...el['source'],
              tag: 'download',
              userName: props.username,
            });
          }
          return filtered;
        }, []);

        setDeleteLogs(deleteList);

        setUploadLog(uploadList);

        setCopyLogs(copyList);

        setDownloadLog(downloadList);
      });
    }
  }, [props.successNum, currentDataset?.code]);

  const allFileStreams = [
    ...uploadLog,
    ...downloadLog,
    ...copyLogs,
    ...deleteLogs,
  ];

  const sortedAllFileStreams = allFileStreams.sort(
    (a, b) => b.createdTime - a.createdTime,
  );
  const fileStreamIcon = (tag) => {
    if (tag === 'upload') {
      return <CloudUploadOutlined />;
    } else if (tag === 'download') {
      return <DownloadOutlined />;
    } else if (tag === 'copy') {
      return <CopyOutlined />;
    } else if (tag === 'delete') {
      return <DeleteOutlined />;
    }
  };

  // get the file's folder path
  const getFolderPath = (fileLog) => {
    if (fileLog.action === 'data_delete') {
      return;
    }
    const wholePathList = fileLog.outcome.split('/');
    const outComePathList = wholePathList.slice(5, wholePathList.length);
    const outComePathStr = outComePathList.join('/');
    const outComePath = outComePathStr.replace(fileLog.displayName, '');

    return outComePath;
  };

  const getFileDisplayName = (fileLog) => {
    if (fileLog.action !== 'data_delete') {
      return fileLog.displayName;
    } else {
      const wholePathList = fileLog.outcome.split('/');
      return wholePathList.pop();
    }
  };

  return (
    <div>
      <Col span={24} style={{ margin: '10px 0' }}>
        {sortedAllFileStreams.length === 0 ? (
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
        ) : (
          sortedAllFileStreams.map((el) => {
            const folderPath = getFolderPath(el);
            return (
              <Row style={{ marginBottom: '2%' }}>
                <span className={styles.fileStreamIcon}>
                  {fileStreamIcon(el.tag)}
                </span>
                <span className={styles.fileName}>
                  <Tooltip title={folderPath}>
                    {el && getFileDisplayName(el)}
                  </Tooltip>
                </span>
                <span className={styles.firstSlash}>/</span>
                <span className={styles.userName}>{el && el.operator}</span>
                <span className={styles.secondSlash}>/</span>
                <span className={styles.time}>
                  {el &&
                    el.createdTime &&
                    moment.unix(el.createdTime).format(format)}
                </span>
              </Row>
            );
          })
        )}
      </Col>
    </div>
  );
}

export default connect((state) => ({
  containersPermission: state.containersPermission,
  successNum: state.successNum,
  username: state.username,
}))(withRouter(UserStats));
