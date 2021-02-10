import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Button, Tooltip, Collapse, Tag, List, Progress, Badge } from 'antd';
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
  setDeletedFileList,
} from '../../Redux/actions';
import {
  useIsMount,
  getGreenRoomTreeNodes,
  getCoreTreeNodes,
  keepAlive,
} from '../../Utility';
import {
  deleteUploadStatus,
  deleteDownloadStatus,
  listAllCopy2CoreFiles,
  traverseFoldersContainersAPI,
  loadDeletedFiles,
} from '../../APIs';
import { tokenManager } from '../../Service/tokenManager';

const { Panel } = Collapse;

function FilePanel() {
  const sessionId = tokenManager.getCookie('sessionId');
  const [visibility, setVisibility] = useState(false);
  const [isActive, setIsActive] = useState(false);

  const uploadList = useSelector((state) => state.uploadList);
  const downloadList = useSelector((state) => state.downloadList);
  let copy2CoreList = useSelector((state) => state.copy2CoreList);
  const panelActiveKey = useSelector((state) => state.panelActiveKey);
  const successNum = useSelector((state) => state.successNum);
  const project = useSelector((state) => state.project);
  const loadCopyEvent = useSelector((state) => state.events.LOAD_COPY_LIST);
  const loadDeletedEvent = useSelector(
    (state) => state.events.LOAD_DELETED_LIST,
  );
  const deletedFileList = useSelector((state) => state.deletedFileList);

  const dispatch = useDispatch();
  const isMount = useIsMount();
  let refreshJobStart = false;

  async function loadCopy2CoreList() {
    if (project && project.profile) {
      const projectCode = project.profile.code;

      let res = await listAllCopy2CoreFiles(projectCode, sessionId);
      dispatch(updateCopy2CoreList(res.data.result));
      if (res.data.result.length) {
        if (
          res.data.result.filter((v) => v.status === 'running').length !== 0
        ) {
          refreshJobStart = true;
          keepAlive();
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

  async function loadDeletedFilesList() {
    if (project && project.profile) {
      const projectCode = project.profile.code;

      let res = await loadDeletedFiles(projectCode, sessionId);

      const files = [];
      for (const item of res.data.result) {
        const filePaths = item.source.split('/');
        const fileName = filePaths[filePaths.length - 1];

        const file =
          deletedFileList &&
          deletedFileList.find(
            (el) => el.fileName === fileName && el.input_path === item.source,
          );

        files.push({
          ...item,
          panelKey: file && file.panelKey,
          fileName,
        });
      }

      dispatch(setDeletedFileList(files));
      if (res.data.result.length) {
        if (
          res.data.result.filter((v) => v.status === 'running').length !== 0
        ) {
          refreshJobStart = true;
          keepAlive();
          setTimeout(() => {
            loadDeletedFilesList();
          }, 3 * 1000);
        } else {
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
      // eslint-disable-next-line
      refreshJobStart = false;
      loadCopy2CoreList();
    }
  }, [loadCopyEvent]);

  useEffect(() => {
    if (loadDeletedEvent !== 0) {
      // eslint-disable-next-line
      refreshJobStart = false;
      loadDeletedFilesList();
    }
  }, [loadDeletedEvent]);

  useEffect(() => {
    if (isMount) {
      setVisibility(true);
      setIsActive(true);
    }
    // eslint-disable-next-line
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
    // eslint-disable-next-line
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
    // eslint-disable-next-line
  }, [downloadList.length]);

  useEffect(() => {
    if (isMount) {
      if (!visibility) {
        // eslint-disable-next-line
        const core2Processed = copy2CoreList.filter((item) => {
          const sourcePath = item.source;
          const pathArray = sourcePath.split('/');

          if (pathArray.includes('vre-storage') && pathArray.includes('raw'))
            return true;
        });
        // eslint-disable-next-line
        const copy2Core = copy2CoreList.filter((item) => {
          const sourcePath = item.source;
          const pathArray = sourcePath.split('/');

          if (
            pathArray.includes('vre-storage') &&
            pathArray.includes('processed') &&
            pathArray.includes('straight_copy')
          )
            return true;
          if (
            pathArray.includes('vre-storage') &&
            pathArray.includes('processed') &&
            pathArray.includes('dicom_edit')
          )
            return true;
        });

        if (core2Processed.length && copy2Core.length)
          dispatch(setPanelActiveKey(['copy2core', 'copy2processed']));
        if (core2Processed.length && copy2Core.length === 0)
          dispatch(setPanelActiveKey(['copy2processed']));
        if (core2Processed.length === 0 && copy2Core.length)
          dispatch(setPanelActiveKey(['copy2core']));
      } else {
        dispatch(
          setPanelActiveKey([
            ...new Set([...panelActiveKey, 'copy2core', 'copy2processed']),
          ]),
        );
      }
    }
    // eslint-disable-next-line
  }, [copy2CoreList.length]);

  function callback(key) {
    dispatch(setPanelActiveKey(key));
  }

  function toggleVisibility() {
    setVisibility(!visibility);
  }
  const statusTags = (status, type) => {
    // if (type == 'copy2core') {
    //   switch (status) {
    //     case 'running': {
    //       return (
    //         <LoadingOutlined style={{ color: '#1b90fe', marginRight: 10 }} />
    //       );
    //     }
    //     case 'succeed': {
    //       return (
    //         <CheckCircleOutlined
    //           style={{ color: '#52c41a', marginRight: 10 }}
    //         />
    //       );
    //     }
    //     default: {
    //       return null;
    //     }
    //   }
    // }
    switch (status) {
      case 'waiting': {
        return <Tag color="default">Waiting</Tag>;
      }
      case 'running': {
        return <Tag color="yellow">Waiting</Tag>;
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
      case 'succeed': {
        return <Tag color="green">Success</Tag>;
      }

      default: {
        return null;
      }
    }
  };

  const cleanUploadList = async () => {
    const res = await deleteUploadStatus(0, sessionId);

    if (res.status === 200 && res.data.code === 200) {
      dispatch(setUploadListCreator([]));
    }
  };

  const cleanDownloadList = async () => {
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
  // eslint-disable-next-line
  let defaultKey = ['upload'];
  if (processDownloadList && processDownloadList.length > 0)
    defaultKey = ['download'];
  if (uploadingList && uploadingList.length > 0) defaultKey = ['upload'];
  // eslint-disable-next-line
  const core2Processed = copy2CoreList.filter((item) => {
    const sourcePath = item.source;
    const pathArray = sourcePath.split('/');

    if (pathArray.includes('vre-storage') && pathArray.includes('raw'))
      return true;
  });
  // eslint-disable-next-line
  copy2CoreList = copy2CoreList.filter((item) => {
    const sourcePath = item.source;
    const pathArray = sourcePath.split('/');

    if (
      pathArray.includes('vre-storage') &&
      pathArray.includes('processed') &&
      pathArray.includes('straight_copy')
    )
      return true;
    if (
      pathArray.includes('vre-storage') &&
      pathArray.includes('processed') &&
      pathArray.includes('dicom_edit')
    )
      return true;
  });

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
        <Panel id={`file_panel_upload`} header="File Upload" key="upload">
          <p style={{ paddingLeft: 16 }}>
            {uploadList && uploadList.length > 0 && uploadHeader}
          </p>
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
        <Panel id={`file_panel_download`} header="File Download" key="download">
          <p style={{ paddingLeft: 16 }}>
            {downloadList && downloadList.length > 0 && downloadHeader}
          </p>
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
          id={`file_panel_copy2processed`}
          header={'Data copying to Processed'}
          key="copy2processed"
        >
          {core2Processed && core2Processed.length ? (
            <p style={{ paddingLeft: 16 }}>
              {core2Processed.length}{' '}
              {core2Processed.length > 1 ? 'files ' : 'file '}
              in list,{' '}
              {core2Processed.filter((v) => v.status === 'succeed').length}{' '}
              {core2Processed.filter((v) => v.status === 'succeed').length > 1
                ? 'files '
                : 'file '}
              succeed.
            </p>
          ) : null}
          {core2Processed ? (
            <List
              size="small"
              dataSource={core2Processed}
              className={styles.copy_list}
              renderItem={(item) => {
                const filePaths = item.source.split('/');
                const fileName = filePaths[filePaths.length - 1];
                return (
                  <>
                    <List.Item
                      id={`copy2processed_item_${fileName}`}
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
        <Panel
          id={`file_panel_copy2core`}
          header={'Data copying to Core'}
          key="copy2core"
        >
          {copy2CoreList && copy2CoreList.length ? (
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
          ) : null}
          {copy2CoreList ? (
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
        <Panel id={`file_panel_delete`} header={'File Deletion'} key="delete">
          {deletedFileList && deletedFileList.length ? (
            <p style={{ paddingLeft: 16 }}>
              {deletedFileList.length}{' '}
              {deletedFileList.length > 1 ? 'files ' : 'file '}
              in list,{' '}
              {
                deletedFileList.filter((v) => v.status === 'succeed').length
              }{' '}
              {deletedFileList.filter((v) => v.status === 'succeed').length > 1
                ? 'files '
                : 'file '}
              succeed.
            </p>
          ) : null}
          {deletedFileList ? (
            <List
              size="small"
              dataSource={deletedFileList}
              className={styles.copy_list}
              renderItem={(item) => {
                const filePaths = item.source
                  ? item.source.split('/')
                  : item.input_path && item.input_path.split('/');
                const fileName = filePaths && filePaths[filePaths.length - 1];
                return (
                  <>
                    <List.Item
                      id={`delete_item_${fileName}`}
                      style={{ overflowWrap: 'anywhere' }}
                    >
                      <List.Item.Meta
                        title={
                          <>
                            <Tooltip placement="bottom" title={item.status}>
                              {statusTags(item.status, 'delete')}
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
