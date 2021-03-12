import React, { useState, useEffect } from 'react';
import { Row, Col, Card } from 'antd';
import {
  FolderOutlined,
  FolderOpenOutlined,
  CloudUploadOutlined,
  CloudDownloadOutlined,
  CheckOutlined,
} from '@ant-design/icons';
import {
  projectFileCountTotal,
  projectFileCountToday,
  fileAuditLogsAPI,
} from '../../../../APIs';
import moment from 'moment';
import { useSelector } from 'react-redux';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import styles from './index.module.scss';

function FileStats(props) {
  const [rawCount, setRawCount] = useState(0);
  const [processedCount, setProcessedCount] = useState(0);
  const [uploadCount, setUploadCount] = useState(0);
  const [downloadCount, setDownloadCount] = useState(0);
  const [copyCount, setCopyCount] = useState(0);

  const {
    match: {
      params: { datasetId },
    },
  } = props;

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
      projectFileCountTotal(datasetId).then((res) => {
        setRawCount(res.data.result['rawFileCount']);
        setProcessedCount(res.data.result['processFileCount']);
      });

      projectFileCountToday(datasetId).then((res) => {
        let uploadLog = [];
        let downloadLog = [];

        if (res.data.result['recentUpload']) {
          uploadLog = res.data.result['recentUpload'].filter((el) => {
            return checkTimeForToday(el.attributes.createTime);
          });
        }

        setUploadCount(uploadLog.length);
      });
      fileAuditLogsAPI({
        page_size: 50,
        page: 0,
        operation_type: 'data_transfer',
        project_code: currentDataset && currentDataset.code,
        operator: props.projectRole === 'admin' ? null : props.username,
        container_id: datasetId,
        start_date: moment().startOf('day').unix(),
        end_date: moment().endOf('day').unix(),
      }).then((res) => {
        if (res.status === 200 && res.data) {
          const { total } = res.data;
          setCopyCount(total);
        }
      });

      fileAuditLogsAPI({
        page_size: 50,
        page: 0,
        operation_type: 'data_download',
        project_code: currentDataset && currentDataset.code,
        operator: props.projectRole === 'admin' ? null : props.username,
        container_id: datasetId,
        start_date: moment().startOf('day').unix(),
        end_date: moment().endOf('day').unix(),
      }).then((res) => {
        if (res.status === 200 && res.data) {
          const { total } = res.data;
          setDownloadCount(total);
        }
      });
    }
  }, [currentDataset, props.successNum]);

  return currentDataset ? (
    <div style={{ display: 'flex', flexWrap: 'wrap' }}>
      <div size={'small'} className={styles.card}>
        <Row>
          <Col className={styles.iconColumn}>
            <FolderOpenOutlined className={styles.icon} />
          </Col>
          <Col>
            <Row>
              <span className={styles.fileNumber}>{rawCount}</span>
            </Row>
            <Row>
              <span className={styles.fileFont}>Raw Files</span>
            </Row>
          </Col>
        </Row>
      </div>
      {props.projectRole === 'admin' && (
        <div size={'small'} className={styles.card}>
          <Row>
            <Col className={styles.iconColumn}>
              <FolderOutlined className={styles.icon} />
            </Col>
            <Col>
              <Row>
                <span className={styles.fileNumber}>{processedCount}</span>
              </Row>
              <Row>
                <span className={styles.fileFont}>Processed Files</span>
              </Row>
            </Col>
          </Row>
        </div>
      )}
      <div size={'small'} className={styles.card}>
        <Row>
          <Col className={styles.iconColumn}>
            <CloudUploadOutlined className={styles.icon} />
          </Col>
          <Col>
            <Row>
              <span className={styles.fileNumber}>{uploadCount}</span>
            </Row>
            <Row>
              <span className={styles.fileFont}>Uploaded</span>
            </Row>
          </Col>
        </Row>
      </div>
      <div size={'small'} className={styles.card}>
        <Row>
          <Col className={styles.iconColumn}>
            <CloudDownloadOutlined className={styles.icon} />
          </Col>
          <Col>
            <Row>
              <span className={styles.fileNumber}>{downloadCount}</span>
            </Row>
            <Row>
              <span className={styles.fileFont}>Downloaded</span>
            </Row>
          </Col>
        </Row>
      </div>
      {props.projectRole === 'admin' && (
        <div size={'small'} className={styles.card}>
          <Row>
            <Col className={styles.iconColumn}>
              <CheckOutlined className={styles.icon} />
            </Col>
            <Col>
              <Row>
                <span className={styles.fileNumber}>{copyCount}</span>
              </Row>
              <Row>
                <span className={styles.fileFont}>Approved</span>
              </Row>
            </Col>
          </Row>
        </div>
      )}
    </div>
  ) : null;
}

export default connect((state) => ({
  containersPermission: state.containersPermission,
  datasetList: state.datasetList,
  successNum: state.successNum,
  username: state.username,
  role: state.role,
}))(withRouter(FileStats));
