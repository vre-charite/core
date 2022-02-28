import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Tooltip, List, Progress, Badge, Popover, Card, Tabs } from 'antd';
import Icon from '@ant-design/icons';
import {
  ProfileOutlined,
  CloseOutlined,
  SyncOutlined,
  CloudUploadOutlined,
  DownloadOutlined,
  RestOutlined,
  CheckOutlined,
  CopyOutlined,
} from '@ant-design/icons';
import _ from 'lodash';
import styles from '../index.module.scss';
import {
  setUploadListCreator,
  setDownloadListCreator,
  updateCopy2CoreList,
  setSuccessNum,
  setDeletedFileList,
  updateDeletedFileList,
} from '../../../Redux/actions';
import { useIsMount, keepAlive } from '../../../Utility';
import {
  deleteUploadStatus,
  deleteDownloadStatus,
  listAllCopy2CoreFiles,
  loadDeletedFiles,
} from '../../../APIs';
import { tokenManager } from '../../../Service/tokenManager';
import { JOB_STATUS } from './jobStatus';

const { TabPane } = Tabs;

const format = 'YYYY-MM-DD';

function FilePanel(props) {
  const sessionId = tokenManager.getCookie('sessionId');
  const [visibility, setVisibility] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const uploadListGlobal = useSelector((state) => state.uploadList);
  const downloadList = useSelector((state) => state.downloadList);
  let copy2CoreList = useSelector((state) => state.copy2CoreList);
  const successNum = useSelector((state) => state.successNum);
  const project = useSelector((state) => state.project);
  const loadCopyEvent = useSelector((state) => state.events.LOAD_COPY_LIST);
  const loadDeletedEvent = useSelector(
    (state) => state.events.LOAD_DELETED_LIST,
  );
  let deletedFileList = useSelector((state) => state.deletedFileList);

  const projectCode = props.projectCode;
  const uploadList = uploadListGlobal.filter(
    (el) => el.projectCode === projectCode,
  );

  deletedFileList = deletedFileList.filter((el) => el.code === projectCode);
  deletedFileList = _.orderBy(deletedFileList, ['updateTimestamp'], ['desc']);

  const dispatch = useDispatch();
  const isMount = useIsMount();
  let refreshJobStart = false;

  async function loadCopy2CoreList() {
    if (project && project.profile) {
      const projectCode = project.profile.code;

      let res = await listAllCopy2CoreFiles(projectCode, sessionId);
      const result = res.map((el) => {
        return {
          ...el,
          createdTime: Date.now(),
        };
      });
      dispatch(updateCopy2CoreList(result));
      if (result.length) {
        if (
          result.filter((v) => v.status === JOB_STATUS.RUNNING).length !== 0
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
            (el) => el.fileName === fileName && el.source === item.source,
          );

        files.push({
          ...item,
          panelKey: file && file.panelKey,
          fileName,
        });
      }

      if (deletedFileList.length) {
        dispatch(updateDeletedFileList(files));
      } else {
        dispatch(setDeletedFileList(files));
      }

      if (res.data.result.length) {
        if (
          res.data.result.filter((v) => v.status === JOB_STATUS.RUNNING)
            .length !== 0
        ) {
          refreshJobStart = true;
          keepAlive();
          setTimeout(() => {
            loadDeletedFilesList();
          }, 3 * 1000);
        } else {
          if (refreshJobStart) {
            dispatch(setSuccessNum(successNum + 1));
            refreshJobStart = false;
          }
        }
      }
    }
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

  const clearTabPane = () => {
    cleanUploadList();
    cleanDownloadList();
  };

  let uploadHeader = `You haven't uploaded any files yet!`;

  const waitingUploadList = uploadList.filter((el) => el.status === 'waiting');
  const uploadingList = uploadList.filter((el) => el.status === 'uploading');
  const processingList = uploadList.filter((el) => el.status === 'pending');

  if (uploadList.length > 0) {
    uploadHeader = `${uploadList.length - waitingUploadList.length}/${
      uploadList.length
    } files are uploading.`;

    if (uploadList.length === 1) {
      uploadHeader = `${uploadList.length - waitingUploadList.length}/${
        uploadList.length
      } file is uploading.`;
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
        } files are being uploaded.`;

        if (failedList.length > 0)
          uploadHeader = `${
            uploadList.length - successList.length - failedList.length
          } files are being uploaded. ${failedList.length} files failed.`;
      } else {
        uploadHeader = `${
          uploadList.length - successList.length
        } file is being uploaded.`;

        if (failedList.length > 0)
          uploadHeader = `${
            uploadList.length - successList.length - failedList.length
          } file is being uploaded. ${failedList.length} files failed.`;
      }
    }

    if (
      successList &&
      failedList &&
      successList.length &&
      failedList.length + successList.length === uploadList.length
    ) {
      let suceessLetters = `${successList.length} files uploaded successfully.`;
      let failLetters = `${failedList.length} files failed.`;

      if (successList.length === 1)
        suceessLetters = `${successList.length} file uploaded successfully.`;
      if (failedList.length === 1)
        failLetters = `${failedList.length} file failed.`;
      uploadHeader = `${suceessLetters}${failLetters}`;
    }
  }

  let downloadHeader = `You haven't downloaded any files yet!`;
  const processDownloadList = downloadList.filter(
    (el) => el.status === 'pending',
  );
  const successDownloadList = downloadList.filter(
    (el) => el.status === 'success',
  );

  if (processDownloadList && processDownloadList.length > 0)
    downloadHeader = `${processDownloadList.length} file is being downloaded.`;
  if (processDownloadList && processDownloadList.length > 1)
    downloadHeader = `${processDownloadList.length} files are being downloaded.`;

  if (successDownloadList && successDownloadList.length > 0)
    downloadHeader = `${successDownloadList.length} file downloaded successfully.`;
  if (successDownloadList && successDownloadList.length > 1)
    downloadHeader = `${successDownloadList.length} files downloaded successfully.`;

  if (processDownloadList.length && successDownloadList.length) {
    downloadHeader = `${processDownloadList.length} ${
      processDownloadList.length === 1 ? 'file is' : 'files are'
    } being downloaded ${successDownloadList.length}  ${
      successDownloadList.length === 1 ? 'file is' : 'files are'
    } downloaded successfully.`;
  }
  // eslint-disable-next-line
  let defaultKey = ['upload'];
  if (processDownloadList && processDownloadList.length > 0)
    defaultKey = ['download'];
  if (uploadingList && uploadingList.length > 0) defaultKey = ['upload'];
  // eslint-disable-next-line
  copy2CoreList = copy2CoreList.filter((item) => {
    if (item.code === projectCode) return true;
  });

  const title = (
    <div>
      <span className={styles.fileStatusTitle}>File Status</span>
      <span
        style={{
          marginLeft: '20px',
          marginRight: '20px',
          color: '#595959',
          fontWeight: 'lighter',
        }}
      >
        |
      </span>
      <CloseOutlined className={styles.closeIcon} onClick={clearTabPane} />
      <span className={styles.clearSessionHistory}>Clear Session History</span>
    </div>
  );

  const tabTitle = (tabName) => {
    switch (tabName) {
      case 'progress':
        return (
          <span className={styles.tabTitle}>
            <SyncOutlined />
            <span className={styles.tabName}>In Progress</span>
          </span>
        );
      case 'upload':
        return (
          <span className={styles.tabTitle}>
            <CloudUploadOutlined />
            <span className={styles.tabName}>Uploaded</span>
          </span>
        );
      case 'download':
        return (
          <span className={styles.tabTitle}>
            <DownloadOutlined />
            <span className={styles.tabName}>Downloaded</span>
          </span>
        );
      case 'approved':
        return (
          <span className={styles.tabTitle}>
            <CheckOutlined />
            <span className={styles.tabName}>Approved</span>
          </span>
        );
      case 'trashBin':
        return (
          <span className={styles.tabTitle}>
            <RestOutlined />
            <span className={styles.tabName}>Trash Bin</span>
          </span>
        );
      default:
        return null;
    }
  };

  const displayName = (fileName) => {
    if (fileName.length > 40) {
      return (
        <Tooltip title={fileName}>{`${fileName.slice(0, 32)}...`}</Tooltip>
      );
    } else {
      return fileName;
    }
  };

  const listItemTitle = (item, tabName) => {
    let copyFileName = '';
    if (item && item.source) {
      copyFileName = item.source.split('/')[item.source.split('/').length - 1];
    }
    if (item.status === 'waiting' && tabName === 'progress') {
      return (
        <span>
          <Tooltip title="file upload">
            <CloudUploadOutlined className={styles.icons} />
          </Tooltip>
          {displayName(item.fileName)}
          {'-'}{' '}
          <span style={{ fontStyle: 'Italic', color: '#A5B0B6' }}>Waiting</span>
        </span>
      );
    } else if (item.status === JOB_STATUS.RUNNING && tabName === 'progress') {
      if (item.action === 'data_transfer') {
        return (
          <span>
            <Tooltip title="file copy">
              <CopyOutlined className={styles.icons} />
            </Tooltip>
            {displayName(copyFileName)}
            {'-'}{' '}
            <span style={{ fontStyle: 'Italic', color: '#A5B0B6' }}>
              Waiting
            </span>
          </span>
        );
      } else if (item.action === 'data_delete') {
        return (
          <span>
            <Tooltip title="file delete">
              <RestOutlined className={styles.icons} />
            </Tooltip>
            {displayName(item.fileName)} {'-'}{' '}
            <span style={{ fontStyle: 'Italic', color: '#A5B0B6' }}>
              Waiting
            </span>
          </span>
        );
      }
    } else if (item.status === 'pending' && tabName === 'progress') {
      if (item.action === 'data_download') {
        return (
          <span>
            <Tooltip title="file download">
              <DownloadOutlined style={{ marginRight: '2%' }} />
            </Tooltip>
            {displayName(item.filename)}
            {'-'}{' '}
            <span style={{ fontStyle: 'Italic', color: '#A5B0B6' }}>
              Waiting
            </span>
          </span>
        );
      } else if (item.action === 'data_upload') {
        return (
          <span>
            <Tooltip title="file upload">
              <CloudUploadOutlined style={{ marginRight: '2%' }} />
            </Tooltip>
            {displayName(item.fileName)}
            {'-'}{' '}
            <span style={{ fontStyle: 'Italic', color: '#A5B0B6' }}>
              pending
            </span>
          </span>
        );
      }
    } else if (item.status === 'uploading' && tabName === 'progress') {
      return (
        <span>
          <Tooltip title="file upload">
            <CloudUploadOutlined className={styles.icons} />
          </Tooltip>
          {displayName(item.fileName)}
        </span>
      );
    } else if (item.status === 'error' && tabName === 'progress') {
      if (item.action === 'data_upload') {
        return (
          <span style={{ color: '#FF6D72' }}>
            <Tooltip title="file upload">
              <CloudUploadOutlined style={{ marginRight: '2%' }} />
            </Tooltip>
            {displayName(item.fileName)}
            {'-'} <span style={{ fontStyle: 'Italic' }}>Failed</span>
          </span>
        );
      }
      if (item.action === 'data_download') {
        return (
          <span style={{ color: '#FF6D72' }}>
            <Tooltip title="file download">
              <DownloadOutlined style={{ marginRight: '2%' }} />
            </Tooltip>
            {displayName(item.filename)}
            {'-'} <span style={{ fontStyle: 'Italic' }}>Failed</span>
          </span>
        );
      }
      if (item.action === 'data_transfer') {
        return (
          <span style={{ color: '#FF6D72' }}>
            <Tooltip title="file copy">
              <CopyOutlined style={{ marginRight: '2%' }} />
            </Tooltip>
            {displayName(copyFileName)}
            {'-'} <span style={{ fontStyle: 'Italic' }}>Failed</span>
          </span>
        );
      }
      if (item.action === 'data_delete') {
        return (
          <span style={{ color: '#FF6D72' }}>
            <Tooltip title="file delete">
              <RestOutlined style={{ marginRight: '2%' }} />
            </Tooltip>
            {displayName(item.fileName)}
            {'-'} <span style={{ fontStyle: 'Italic' }}>Failed</span>
          </span>
        );
      }
    } else if (item.status === 'success' && tabName === 'upload') {
      return (
        <span>
          <Icon
            style={{ marginRight: '2%' }}
            component={() => (
              <img
                alt="Approved"
                style={{ marginTop: '-25%' }}
                src={require('../../../Images/Approved.png')}
              />
            )}
          />
          <span className={styles.fileName}>{displayName(item.fileName)}</span>
        </span>
      );
    } else if (item.status === 'success' && tabName === 'download') {
      const nameZone = (item) => {
        if (!item.payload) {
          if (item.namespace === 'greenroom') return 'Green Room';
          return 'Core';
        }

        if (item.payload.frontendZone === 'Core') {
          return 'Core';
        }

        return item.payload.frontendZone;
      };
      return (
        <span>
          <Icon
            style={{ marginRight: '2%' }}
            component={() => (
              <img
                alt="Approved"
                style={{ marginTop: '-25%' }}
                src={require('../../../Images/Approved.png')}
              />
            )}
          />
          <span className={styles.fileName}>{displayName(item.filename)}</span>{' '}
          {'-'} <span>{nameZone(item)}</span>
        </span>
      );
    } else if (item.status === JOB_STATUS.SUCCEED && tabName === 'approved') {
      return (
        <span>
          <Icon
            style={{ marginRight: '2%' }}
            component={() => (
              <img
                alt="Approved"
                style={{ marginTop: '-25%' }}
                src={require('../../../Images/Approved.png')}
              />
            )}
          />
          <span className={styles.fileName}>{displayName(copyFileName)}</span>
          <span className={styles.slash}>/</span>
          <span style={{ fontStyle: 'Italic', color: '#A5B0B6' }}>
            {item.copyTag}
          </span>
        </span>
      );
    } else if (
      item.status === JOB_STATUS.TERMINATED &&
      tabName === 'approved'
    ) {
      return (
        <span>
          <Icon
            style={{ marginRight: '2%' }}
            component={() => (
              <img
                alt="Approved"
                style={{ marginTop: '-25%' }}
                src={require('../../../Images/Fail-X.png')}
              />
            )}
          />
          <span className={styles.fileName}>{displayName(copyFileName)}</span>
          <span className={styles.slash}>/</span>
          <span style={{ fontStyle: 'Italic', color: '#A5B0B6' }}>
            {item.copyTag}
          </span>
        </span>
      );
    } else if (item.status === JOB_STATUS.SUCCEED && tabName === 'trashBin') {
      return (
        <span>
          {
            <Tooltip title="file delete">
              <RestOutlined className={styles.icons} />
            </Tooltip>
          }
          <span className={styles.fileName}>{displayName(item.fileName)}</span>{' '}
          {'-'} <span>{item.payload.frontendZone}</span>
        </span>
      );
    } else if (
      item.status === JOB_STATUS.TERMINATED &&
      tabName === 'trashBin'
    ) {
      return (
        <span>
          {
            <Tooltip title="failed to delete file">
              <CloseOutlined className={styles['icons-fail']} />
            </Tooltip>
          }
          <span className={styles.fileName}>{displayName(item.fileName)}</span>{' '}
          {'-'} <span>{item.payload.frontendZone}</span>
        </span>
      );
    } else {
      return null;
    }
  };

  let inProgressList;
  const approvedList = copy2CoreList.map((el) => ({
    ...el,
    copyTag: 'Copied to Core',
  }));
  const allFileList = [
    ...uploadList.map((el) => ({ ...el, action: 'data_upload' })),
    ...downloadList.map((el) => ({ ...el, action: 'data_download' })),
    ...approvedList,
    ...deletedFileList,
  ];
  inProgressList = allFileList.filter((el) => {
    if (
      el.status !== 'success' &&
      el.status !== 'succeed' &&
      el.status !== JOB_STATUS.SUCCEED &&
      el.status !== JOB_STATUS.TERMINATED &&
      el.status !== JOB_STATUS.CANCELLED
    ) {
      return true;
    }
  });
  inProgressList = _.orderBy(inProgressList, ['createdTime'], ['desc']);

  const uploadSuccessList = uploadList.filter((el) => el.status === 'success');
  const approvedEndList = approvedList.filter(
    (el) =>
      el.status === JOB_STATUS.SUCCEED || el.status === JOB_STATUS.TERMINATED,
  );
  const downloadSuccessList = downloadList.filter(
    (el) => el.status === 'success' || el.status === JOB_STATUS.SUCCEED,
  );
  const deletedEndList = deletedFileList.filter(
    (el) =>
      el.status === JOB_STATUS.SUCCEED || el.status === JOB_STATUS.TERMINATED,
  );

  // const failedList = allFileList.filter((el) => el.status === 'error');

  const filePanelStatus = (allFileList) => {
    if (allFileList.length === 0) {
      return '';
    }
    const failedList = allFileList.filter((el) => el.status === 'error');
    if (failedList.length > 0) {
      return 'error';
    } else {
      return 'success';
    }
  };

  let uploadSuccessNum = uploadList.filter(
    (el) => el.status === 'success',
  ).length;
  let uploadFailureNum = uploadList.filter(
    (el) => el.status === 'error',
  ).length;
  let approvedSuccessNum = approvedList.filter(
    (el) => el.status === JOB_STATUS.SUCCEED,
  ).length;

  let approvedToCoreNum = approvedList.filter(
    (el) => el.status === JOB_STATUS.SUCCEED && el.copyTag === 'Copied to Core',
  ).length;
  let approvedFailureNum = approvedList.filter(
    (el) => el.status === JOB_STATUS.TERMINATED,
  ).length;
  let deletedSuccessNum = deletedFileList.filter(
    (el) => el.status === JOB_STATUS.SUCCEED,
  ).length;
  let deleteFailureNum = deletedFileList.filter(
    (el) => el.status === JOB_STATUS.TERMINATED,
  ).length;

  const uploadSuccessTitle =
    uploadSuccessNum > 0
      ? `${uploadSuccessNum} ${
          uploadSuccessNum > 1 ? `files` : `file`
        } uploaded sucessfully. ${uploadFailureNum} ${
          uploadFailureNum !== 1 ? `files` : `files`
        } failed. ${uploadList.length - uploadSuccessNum - uploadFailureNum} ${
          uploadList.length - uploadSuccessNum - uploadFailureNum > 1
            ? `files`
            : `file`
        } in progress.`
      : `You haven't uploaded any files yet!`;

  const approvedTitle =
    approvedSuccessNum > 0
      ? `${approvedToCoreNum} ${
          approvedToCoreNum > 1 ? `files` : `file`
        } copied to core. ${approvedFailureNum} ${
          approvedFailureNum !== 1 ? `files` : `file`
        } failed.`
      : `You haven't approved to copy any files to the Core yet!`;

  const deletedTitle =
    deletedSuccessNum > 0
      ? `${deletedSuccessNum} ${
          deletedSuccessNum > 1 ? `files` : `file`
        } deleted. ${deleteFailureNum} ${
          deleteFailureNum !== 1 ? `files` : `file`
        } failed.`
      : `You haven't deleted any files yet!`;
  const content = (
    <Card className={styles.panelCard} title={title}>
      <Tabs className={styles.tab} tabPosition={'left'} tabBarGutter={1}>
        <TabPane tab={tabTitle('progress')} key="inProgress">
          <List
            className={styles.progress_list}
            size="small"
            dataSource={inProgressList}
            split={false}
            renderItem={(item) => {
              if (item.status !== 'success' && item.status !== 'succeed') {
                if (item.progress) {
                  return (
                    <List.Item>
                      <List.Item.Meta
                        title={listItemTitle(item, 'progress')}
                        description={
                          <>
                            {item.status === 'uploading' && (
                              <Progress
                                status="active"
                                percent={Math.floor(100 * item.progress)}
                                size="small"
                              />
                            )}
                          </>
                        }
                      />
                    </List.Item>
                  );
                } else {
                  return (
                    <List.Item>
                      <List.Item.Meta title={listItemTitle(item, 'progress')} />
                    </List.Item>
                  );
                }
              }
            }}
          />
        </TabPane>
        <TabPane tab={tabTitle('upload')} key="uploaded">
          <List
            className={styles.uploaded_list}
            size="small"
            header={
              <span className={styles.listHeader}>{uploadSuccessTitle}</span>
            }
            dataSource={uploadSuccessList}
            split={false}
            renderItem={(item) => (
              <List.Item>
                <List.Item.Meta title={listItemTitle(item, 'upload')} />
              </List.Item>
            )}
          />
        </TabPane>
        <TabPane tab={tabTitle('download')} key="downloaded">
          <List
            className={styles.downloaded_list}
            size="small"
            header={<span className={styles.listHeader}>{downloadHeader}</span>}
            split={false}
            dataSource={downloadSuccessList}
            renderItem={(item) => (
              <List.Item>
                <List.Item.Meta title={listItemTitle(item, 'download')} />
              </List.Item>
            )}
          />
        </TabPane>
        {props.projectRole === 'admin' && (
          <TabPane tab={tabTitle('approved')} key="approved">
            <List
              className={styles.approved_list}
              size="small"
              header={
                <span className={styles.listHeader}>{approvedTitle}</span>
              }
              split={false}
              dataSource={approvedEndList}
              renderItem={(item) => {
                return (
                  <List.Item>
                    <List.Item.Meta title={listItemTitle(item, 'approved')} />
                  </List.Item>
                );
              }}
            />
          </TabPane>
        )}
        <TabPane tab={tabTitle('trashBin')} key="deleted">
          <List
            className={styles.deleted_list}
            size="small"
            header={<span className={styles.listHeader}>{deletedTitle}</span>}
            split={false}
            dataSource={deletedEndList}
            renderItem={(item) => (
              <List.Item>
                <List.Item.Meta title={listItemTitle(item, 'trashBin')} />
              </List.Item>
            )}
          />
        </TabPane>
      </Tabs>
    </Card>
  );

  return (
    <Tooltip title={!visibility && 'Files Panel'} placement="left">
      <Popover
        placement="bottomRight"
        content={content}
        trigger="click"
        getPopupContainer={(trigger) => {
          return document.getElementById('global_site_header');
        }}
      >
        <div>
          <Badge className={styles.badge} status={filePanelStatus(allFileList)}>
            <Icon
              component={() => (
                <img
                  className="pic"
                  src={require('../../../Images/FilePanel.png')}
                />
              )}
            />
          </Badge>
        </div>
      </Popover>
    </Tooltip>
  );
}

export default FilePanel;
