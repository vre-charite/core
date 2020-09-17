import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Button, Tooltip, Collapse, Tag, List, Progress, Badge } from 'antd';
import { FileTextOutlined, DeleteOutlined } from '@ant-design/icons';
import styles from './index.module.scss';
import { setUploadListCreator } from '../../Redux/actions';

const { Panel } = Collapse;

function callback(key) {
  console.log(key);
}

const text = `
  A dog is a type of domesticated animal.
  Known for its loyalty and faithfulness,
  it can be found as a welcome guest in many households across the world.
`;

function FilePanel() {
  const [visibility, setVisibility] = useState(false);
  const [isActive, setIsActive] = useState(false);

  const uploadList = useSelector((state) => state.uploadList);
  const downloadList = useSelector((state) => state.downloadList);

  const mounted = useRef(false);
  const dispatch = useDispatch();

  useEffect(() => {
    if (mounted.current) {
      setVisibility(true);
      setIsActive(true);
    } else mounted.current = true;
  }, [uploadList.length, downloadList.length]);

  function toggleVisibility() {
    setVisibility(!visibility);
  }
  const statusTags = (status) => {
    switch (status) {
      case 'waiting': {
        return <Tag color="default">Waiting</Tag>;
      }
      case 'uploading': {
        return <Tag color="blue">Uploading</Tag>;
      }
      case 'error': {
        return <Tag color="red">Error</Tag>;
      }
      case 'pending': {
        return <Tag color="yellow">Uploading</Tag>;
      }
      case 'success': {
        return <Tag color="green">Success</Tag>;
      }

      default: {
        return null;
      }
    }
  };
  const cleanUploadList = () => {
    dispatch(setUploadListCreator([])); //TODO
  };
  const isCleanButtonDisabled = () => {
    if (uploadList.length === 0) {
      return true;
    }
    const uploadingList = uploadList.filter(
      (item) => item.status === 'uploading',
    );
    if (uploadingList.length !== 0) {
      return true;
    }
    return false;
  };

  let uploadHeader = 'No file is uploading';

  const waitingUploadList = uploadList.filter((el) => el.status === 'waiting');
  const uploadingList = uploadList.filter((el) => el.status === 'uploading');
  const processingList = uploadList.filter((el) => el.status === 'pending');

  if (uploadList.length > 0) {
    uploadHeader = `${uploadList.length - waitingUploadList.length}/${
      uploadList.length
    } files are uploading`;
  }

  if (
    waitingUploadList &&
    uploadingList &&
    waitingUploadList.length === 0 &&
    uploadingList.length === 0
  ) {
    const failedList = uploadList.filter((el) => el.status === 'error');
    const successList = uploadList.filter((el) => el.status === 'success');

    if (uploadingList.length === 0 && processingList.length > 0) {
      uploadHeader = `${
        uploadList.length - successList.length
      } files are being uploaded`;

      if (failedList.length > 0)
        uploadHeader = `${
          uploadList.length - successList.length - failedList.length
        } files are being uploaded. ${failedList.length} files failed`;
    }

    if (successList && failedList && (failedList.length + successList.length) === uploadList.length) {
      uploadHeader = `${successList.length} files succeed. ${failedList.length} files failed`;
    }
  }

  let downloadHeader = 'No file is downloading';
  const processDownloadList = downloadList.filter(
    (el) => el.status === 'pending',
  );

  if (processDownloadList && processDownloadList.length > 0)
    downloadHeader = `${processDownloadList.length} file is being downloaded`;
  if (processDownloadList && processDownloadList.length > 1)
    downloadHeader = `${processDownloadList.length} files are being downloaded`;

  let defaultKey = ['upload'];

  if (processDownloadList && processDownloadList.length > 0)
    defaultKey = ['download'];
  if (uploadingList && uploadingList.length > 0) defaultKey = ['upload'];

  return (
    <>
      <Tooltip title={!visibility && 'Files Panel'} placement="left">
        <Button
          type="primary"
          ghost
          shape="circle"
          icon={
            <Badge
              dot={
                isActive && (uploadList.length > 0 || downloadList.length > 0)
              }
            >
              <FileTextOutlined />
            </Badge>
          }
          className={styles.trigger + ' ' + (visibility && styles.active)}
          onClick={toggleVisibility}
        />
      </Tooltip>
      <Collapse
        defaultActiveKey={defaultKey}
        onChange={callback}
        className={styles.fileCollapse + ' ' + (visibility && styles.active)}
      >
        <Panel header={uploadHeader} key="upload">
          <List
            size="small"
            dataSource={uploadList}
            className={uploadList.length > 0 ? styles.download_list : ''}
            renderItem={(item) => (
              <List.Item style={{ overflowWrap: 'anywhere' }}>
                <List.Item.Meta
                  title={
                    <>
                      {item.fileName} {statusTags(item.status)}
                    </>
                  }
                  description={
                    item.status === 'uploading' && (
                      <Progress
                        status="active"
                        percent={Math.floor(100 * item.progress)}
                        size="small"
                      />
                    )
                  }
                />
              </List.Item>
            )}
          />
          <Button
            danger
            disabled={isCleanButtonDisabled()}
            onClickCapture={cleanUploadList}
            size="small"
            style={{ marginTop: 8, marginLeft: 16 }}
          >
            Clear Upload history
          </Button>
        </Panel>
        <Panel header={downloadHeader} key="download">
          <List
            size="small"
            dataSource={downloadList}
            renderItem={(item) => (
              <List.Item>
                <List.Item.Meta
                  title={
                    <>
                      {item.downloadKey} {statusTags(item.status)}
                    </>
                  }
                />
              </List.Item>
            )}
          />
        </Panel>
      </Collapse>
    </>
  );
}

export default FilePanel;
