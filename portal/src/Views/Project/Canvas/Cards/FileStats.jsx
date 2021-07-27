import React, { useState, useEffect } from 'react';
import { Row, Col, Card } from 'antd';
import {
  FolderOutlined,
  FolderOpenOutlined,
  CloudUploadOutlined,
  CloudDownloadOutlined,
  CheckOutlined,
} from '@ant-design/icons';
import { projectFileCountTotal } from '../../../../APIs';
import moment from 'moment';
import { useSelector } from 'react-redux';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import styles from './index.module.scss';

function FileStats(props) {
  const [greenRoomCount, setGreenRoomCount] = useState(0);
  const [coreCount, setCoreCount] = useState(0);
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
      projectFileCountTotal(currentDataset.globalEntityId, {
        start_date: moment().startOf('day').unix(),
        end_date: moment().endOf('day').unix(),
      }).then((res) => {
        const statistics = res?.data?.result;
        if (res.status === 200 && statistics) {
          setGreenRoomCount(statistics.greenroom);
          setCoreCount(statistics.core);
          setCopyCount(statistics.approved);
          setDownloadCount(statistics.downloaded);
          setUploadCount(statistics.uploaded);
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
              <span className={styles.fileNumber}>{greenRoomCount}</span>
            </Row>
            <Row>
              <span className={styles.fileFont}>Green Room</span>
            </Row>
          </Col>
        </Row>
      </div>
      {coreCount !== null ? (
        <div size={'small'} className={styles.card}>
          <Row>
            <Col className={styles.iconColumn}>
              <FolderOutlined className={styles.icon} />
            </Col>
            <Col>
              <Row>
                <span className={styles.fileNumber}>{coreCount}</span>
              </Row>
              <Row>
                <span className={styles.fileFont}>Core</span>
              </Row>
            </Col>
          </Row>
        </div>
      ) : null}
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
              <span className={styles.fileFont}>Uploaded (Today)</span>
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
              <span className={styles.fileFont}>Downloaded (Today)</span>
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
                <span className={styles.fileFont}>Approved (Today)</span>
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
