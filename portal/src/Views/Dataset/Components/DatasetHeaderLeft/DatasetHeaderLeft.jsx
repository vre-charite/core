import React, { useEffect, useState } from 'react';
import {
  PageHeader,
  Tooltip,
  Dropdown,
  Menu,
  Space,
  Button,
  message,
} from 'antd';
import { DownOutlined, DownloadOutlined } from '@ant-design/icons';
import styles from './DatasetHeaderLeft.module.scss';
import { useSelector } from 'react-redux';
import moment from 'moment';
import {
  downloadDataset,
  checkDatasetDownloadStatusAPI,
} from '../../../../APIs';
import { useTranslation } from 'react-i18next';
import { tokenManager } from '../../../../Service/tokenManager';
import { API_PATH, DOWNLOAD_PREFIX_V1 } from '../../../../config';

export default function DatasetHeaderLeft(props) {
  const { setDatasetDrawerVisibility } = props;
  const { t } = useTranslation(['errormessages', 'success']);
  const {
    basicInfo: { title, timeCreated, creator, geid, code },
    projectName,
  } = useSelector((state) => state.datasetInfo);
  const username = useSelector((state) => state.username);
  const [downloading, setDownloading] = useState(false);
  const [downloadHash, setDownloadHash] = useState(null);
  const menu = (
    <Menu>
      <Menu.Item>
        <a
          target="_blank"
          rel="noopener noreferrer"
          href="https://www.antgroup.com"
        >
          1st menu item
        </a>
      </Menu.Item>
    </Menu>
  );

  const downloadEntireDataset = async () => {
    const sessionId = tokenManager.getCookie('sessionId');
    let res;
    setDownloading(true);
    try {
      res = await downloadDataset(geid, username, sessionId);
    } catch (e) {
      message.error(t('errormessages:downloadDataset.default.0'));
      setDownloading(false);
      return;
    }
    if (res?.data?.result?.payload?.hashCode) {
      setDownloadHash(res.data?.result?.payload?.hashCode);
    } else {
      message.error(t('errormessages:downloadDataset.default.0'));
      setDownloading(false);
    }
  };
  const checkDownload = async (timer) => {
    const res = await checkDatasetDownloadStatusAPI(downloadHash);
    const { status } = res.data.result;
    if (status === 'READY_FOR_DOWNLOADING') {
      setDownloadHash(null);
      setDownloading(false);
      clearInterval(timer);
      const hashCode = res.data.result?.payload?.hashCode;
      if (hashCode) {
        const url = API_PATH + DOWNLOAD_PREFIX_V1 + `/` + hashCode;
        window.open(url, '_blank');
      } else {
        message.error(t('errormessages:downloadDataset.default.0'));
      }
    }
  };
  useEffect(() => {
    if (downloadHash) {
      const timer = setInterval(() => {
        checkDownload(timer);
      }, 2 * 1000);
      checkDownload(timer);
    }
  }, [downloadHash]);
  return (
    <>
      <>
        <PageHeader
          ghost={true}
          className={styles['pageHeader']}
          title={getTitle(title, setDatasetDrawerVisibility)}
        ></PageHeader>
        {/*           <Dropdown className={styles['dropdown']} overlay={menu}>
            <span>
              Version 0.4 (Recent) <DownOutlined />
            </span>
          </Dropdown>
          <span className={styles['last-updated']}>(Updated 1 week ago)</span>{' '} */}
      </>

      {/*       <div className={styles['project']}>
        Project:
        <span>{projectName || 'N/A'}</span>{' '}
      </div> */}
      <>
        <div className={styles['createdTime']}>
          <b>
            {' '}
            Dataset Code: {code} / Created on{' '}
            {moment.utc(timeCreated).local().format('YYYY-MM-DD')}
          </b>{' '}
          by {creator || 'N/A'}
        </div>
        <Button
          className={styles['download-button']}
          type="link"
          loading={downloading}
          icon={<DownloadOutlined />}
          onClick={downloadEntireDataset}
        >
          Download
        </Button>
      </>
    </>
  );
}

const getTitle = (title, setDatasetDrawerVisibility) => {
  title = title ? title : 'N/A';
  const titleComponent =
    title.length > 60 ? (
      <div style={{ display: 'flex' }}>
        <Tooltip title={title}>
          <div className={styles['toolTip-div']}>
            <span>{`${title.slice(0, 60)}...`}</span>
          </div>
        </Tooltip>
        <p
          style={{
            cursor: 'pointer',
            margin: '0px 0px 0px 20px',
            fontSize: '14px',
            textDecoration: 'underline',
          }}
          onClick={() => setDatasetDrawerVisibility(true)}
        >
          Versions
        </p>
      </div>
    ) : (
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <div className={styles['no-toolTip-div']}>
          <span>{title}</span>
        </div>
        <p
          style={{
            cursor: 'pointer',
            margin: '0px 0px 0px 20px',
            fontSize: '14px',
            textDecoration: 'underline',
          }}
          onClick={() => setDatasetDrawerVisibility(true)}
        >
          Versions
        </p>
      </div>
    );

  return titleComponent;
};
