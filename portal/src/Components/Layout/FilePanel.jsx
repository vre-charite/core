import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Button,
  Tooltip,
  Collapse,
  Tag,
  List,
  Progress,
  Badge,
  Spin,
} from 'antd';
import { FileTextOutlined } from '@ant-design/icons';
import styles from './index.module.scss';
import {
  setUploadListCreator,
  setPanelActiveKey,
  setDownloadListCreator,
  updateCopy2CoreList,
  setSuccessNum,
  setCurrentProjectTreeGreenRoom,
  setCurrentProjectTreeCore,
} from '../../Redux/actions';
import {
  useIsMount,
  getGreenRoomTreeNodes,
  getCoreTreeNodes,
} from '../../Utility';
import {
  deleteUploadStatus,
  deleteDownloadStatus,
  listAllCopy2CoreFiles,
  traverseFoldersContainersAPI,
} from '../../APIs';
import { CheckCircleOutlined, LoadingOutlined } from '@ant-design/icons';

const { Panel } = Collapse;

function FilePanel() {
  const [visibility, setVisibility] = useState(false);
  const [isActive, setIsActive] = useState(false);

  const uploadList = useSelector((state) => state.uploadList);
  const downloadList = useSelector((state) => state.downloadList);
  const copy2CoreList = useSelector((state) => state.copy2CoreList);
  const panelActiveKey = useSelector((state) => state.panelActiveKey);
  const successNum = useSelector((state) => state.successNum);
  const project = useSelector((state) => state.project);
  const loadCopyEvent = useSelector((state) => state.events.LOAD_COPY_LIST);
  const dispatch = useDispatch();
  const isMount = useIsMount();
  let refreshJobStart = false;
  async function loadCopy2CoreList() {
    if (project && project.profile) {
      const projectCode = project.profile.code;
      const sessionId = localStorage.getItem('sessionId');
      let res = await listAllCopy2CoreFiles(projectCode, sessionId);
      dispatch(updateCopy2CoreList(res.data.result));
      if (res.data.result.length) {
        if (
          res.data.result.filter((v) => v.status === 'running').length !== 0
        ) {
          refreshJobStart = true;
          setTimeout(() => {
            loadCopy2CoreList();
          }, 3 * 1000);
        } else {
          // last call
          if (refreshJobStart) {
            dispatch(setSuccessNum(successNum + 1));
            updateFolders();
            refreshJobStart = false;
          }
        }
      }
    }
  }
  async function updateFolders() {
    const allFolders = await traverseFoldersContainersAPI(project.profile.id);
    const greenRoomTree = getGreenRoomTreeNodes(allFolders);
    const coreTreeData = getCoreTreeNodes(allFolders);
    dispatch(setCurrentProjectTreeGreenRoom(greenRoomTree));
    dispatch(setCurrentProjectTreeCore(coreTreeData));
  }
  useEffect(() => {
    if (loadCopyEvent !== 0) {
      refreshJobStart = false;
      loadCopy2CoreList();
    }
  }, [loadCopyEvent]);

  useEffect(() => {
    if (isMount) {
      setVisibility(true);
      setIsActive(true);
    }
  }, [uploadList.length, downloadList.length, copy2CoreList.length]);

  useEffect(() => {
    if (isMount) {
      if (!visibility) {
        dispatch(setPanelActiveKey(['upload']));
      } else {
        dispatch(
          setPanelActiveKey([...new Set([...panelActiveKey, 'upload'])]),
        );
      }
    }
  }, [uploadList.length]);

  useEffect(() => {
    if (isMount) {
      if (!visibility) {
        dispatch(setPanelActiveKey(['download']));
      } else {
        dispatch(
          setPanelActiveKey([...new Set([...panelActiveKey, 'download'])]),
        );
      }
    }
  }, [downloadList.length]);

  useEffect(() => {
    if (isMount) {
      if (!visibility) {
        dispatch(setPanelActiveKey(['copy2core']));
      } else {
        dispatch(
          setPanelActiveKey([...new Set([...panelActiveKey, 'copy2core'])]),
        );
      }
    }
  }, [copy2CoreList.length]);

  function callback(key) {
    console.log(key);
    dispatch(setPanelActiveKey(key));
  }

  function toggleVisibility() {
    setVisibility(!visibility);
  }
  const statusTags = (status, type) => {
    if (type == 'copy2core') {
      switch (status) {
        case 'running': {
          return (
            <LoadingOutlined style={{ color: '#1b90fe', marginRight: 10 }} />
          );
        }
        case 'succeed': {
          return (
            <CheckCircleOutlined
              style={{ color: '#52c41a', marginRight: 10 }}
            />
          );
        }
        default: {
          return null;
        }
      }
    }
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
        if (type === 'download') return <Tag color="yellow">Downloading</Tag>;
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

  const cleanUploadList = async () => {
    const sessionId = localStorage.getItem('sessionId');

    const res = await deleteUploadStatus(0, sessionId);

    if (res.status === 200 && res.data.code === 200) {
      dispatch(setUploadListCreator([]));
    }
  };

  const cleanDownloadList = async () => {
    const sessionId = localStorage.getItem('sessionId');
    const res = await deleteDownloadStatus(sessionId);

    if (res.status === 200) {
      dispatch(setDownloadListCreator([]));
    }
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

  const isDownloadCleanButtonDisabled = () => {
    if (downloadList.length === 0) {
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

    if (uploadList.length === 1) {
      uploadHeader = `${uploadList.length - waitingUploadList.length}/${
        uploadList.length
      } file is uploading`;
    }
  }

  if (
    waitingUploadList &&
    uploadingList &&
    waitingUploadList.length === 0 &&
    uploadingList.length === 0
  ) {
    const failedList = uploadList.filter((el) => el.status === 'error');
    const successList = uploadList.filter((el) => el.status === 'success');

    if (
      uploadingList.length === 0 &&
      (processingList.length > 0 || failedList.length > 0)
    ) {
      if (uploadList.length - successList.length > 1) {
        uploadHeader = `${
          uploadList.length - successList.length
        } files are being uploaded`;

        if (failedList.length > 0)
          uploadHeader = `${
            uploadList.length - successList.length - failedList.length
          } files are being uploaded. ${failedList.length} files failed`;
      } else {
        uploadHeader = `${
          uploadList.length - successList.length
        } file is being uploaded`;

        if (failedList.length > 0)
          uploadHeader = `${
            uploadList.length - successList.length - failedList.length
          } file is being uploaded. ${failedList.length} files failed`;
      }
    }

    if (
      successList &&
      failedList &&
      successList.length &&
      failedList.length + successList.length === uploadList.length
    ) {
      let suceessLetters = `${successList.length} files uploaded successfully. `;
      let failLetters = `${failedList.length} files failed`;

      if (successList.length === 1)
        suceessLetters = `${successList.length} file uploaded successfully. `;
      if (failedList.length === 1)
        failLetters = `${failedList.length} file failed.`;
      uploadHeader = `${suceessLetters}${failLetters}`;
    }
  }

  let downloadHeader = 'No file is downloading';
  const processDownloadList = downloadList.filter(
    (el) => el.status === 'pending',
  );
  const successDownloadList = downloadList.filter(
    (el) => el.status === 'success',
  );

  if (processDownloadList && processDownloadList.length > 0)
    downloadHeader = `${processDownloadList.length} file is being downloaded`;
  if (processDownloadList && processDownloadList.length > 1)
    downloadHeader = `${processDownloadList.length} files are being downloaded`;

  if (successDownloadList && successDownloadList.length > 0)
    downloadHeader = `${successDownloadList.length} file downloaded successfully`;
  if (successDownloadList && successDownloadList.length > 1)
    downloadHeader = `${successDownloadList.length} files downloaded successfully`;

  if (processDownloadList.length && successDownloadList.length) {
    downloadHeader = `${processDownloadList.length} ${
      processDownloadList.length === 1 ? 'file is' : 'files are'
    } being downloaded. ${successDownloadList.length}  ${
      successDownloadList.length === 1 ? 'file is' : 'files are'
    } downloaded successfully`;
  }

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
        activeKey={panelActiveKey}
        onChange={callback}
        className={styles.fileCollapse + ' ' + (visibility && styles.active)}
      >
        <Panel id={`file_panel_upload`} header={uploadHeader} key="upload">
          <List
            size="small"
            dataSource={uploadList}
            className={styles.download_list}
            renderItem={(item) => (
              <>
                <List.Item
                  id={`upload_item_${item.fileName}`}
                  style={{ overflowWrap: 'anywhere' }}
                >
                  <List.Item.Meta
                    title={
                      <>
                        {/* <Tag color="blue">{item.projectCode}</Tag> */}
                        {statusTags(item.status, 'upload')}
                        {item.fileName}
                      </>
                    }
                    description={
                      <>
                        {item.status === 'uploading' && (
                          <Progress
                            status="active"
                            percent={Math.floor(100 * item.progress)}
                            size="small"
                          />
                        )}
                        <small style={{ float: 'right' }}>
                          Project: {item.projectCode}
                        </small>
                      </>
                    }
                  />
                </List.Item>
              </>
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
        <Panel
          id={`file_panel_download`}
          header={downloadHeader}
          key="download"
        >
          <List
            size="small"
            dataSource={downloadList}
            className={styles.download_list}
            renderItem={(item) => (
              <List.Item
                id={`upload_item_${item.filename}`}
                style={{ overflowWrap: 'anywhere' }}
              >
                <List.Item.Meta
                  title={
                    <>
                      {statusTags(item.status, 'download')}
                      {item.filename}
                    </>
                  }
                  description={
                    <>
                      <small style={{ float: 'right' }}>
                        Project: {item.container}
                      </small>
                    </>
                  }
                />
              </List.Item>
            )}
          />
          <Button
            danger
            disabled={isDownloadCleanButtonDisabled()}
            onClickCapture={cleanDownloadList}
            size="small"
            style={{ marginTop: 8, marginLeft: 16 }}
          >
            Clear Download history
          </Button>
        </Panel>
        <Panel
          id={`file_panel_copy2core`}
          header={'Data copying'}
          key="copy2core"
        >
          <p style={{ paddingLeft: 16 }}>
            {copy2CoreList.length}{' '}
            {copy2CoreList.length > 1 ? 'files ' : 'file '}
            in list,{' '}
            {copy2CoreList.filter((v) => v.status === 'succeed').length}{' '}
            {copy2CoreList.filter((v) => v.status === 'succeed').length > 1
              ? 'files '
              : 'file '}
            succeed.
          </p>
          {copy2CoreList && copy2CoreList.length ? (
            <List
              size="small"
              dataSource={copy2CoreList}
              className={styles.copy_list}
              renderItem={(item) => {
                const filePaths = item.source.split('/');
                const fileName = filePaths[filePaths.length - 1];
                return (
                  <>
                    <List.Item
                      id={`copy2core_item_${fileName}`}
                      style={{ overflowWrap: 'anywhere' }}
                    >
                      <List.Item.Meta
                        title={
                          <>
                            <Tooltip placement="bottom" title={item.status}>
                              {statusTags(item.status, 'copy2core')}
                            </Tooltip>
                            {fileName}
                          </>
                        }
                      />
                    </List.Item>
                  </>
                );
              }}
            />
          ) : null}
        </Panel>
      </Collapse>
    </>
  );
}

export default FilePanel;
