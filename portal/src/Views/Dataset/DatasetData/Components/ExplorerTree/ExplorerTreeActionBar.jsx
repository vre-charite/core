import React, { useState, useEffect } from 'react';
import {
  FileOutlined,
  FolderOutlined,
  EyeOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
  DownloadOutlined,
  CloseOutlined,
  SaveOutlined,
  LoadingOutlined,
} from '@ant-design/icons';
import { Input, Button, Modal, message } from 'antd';
import { useSelector, useDispatch } from 'react-redux';
import { EDIT_MODE } from '../../../../../Redux/Reducers/datasetData';
import {
  deleteDatasetFiles,
  downloadDatasetFiles,
  checkDatasetDownloadStatusAPI,
} from '../../../../../APIs';
import { datasetDataActions } from '../../../../../Redux/actions';
import { tokenManager } from '../../../../../Service/tokenManager';
import _ from 'lodash';
import { ExplorerTreeDeleteModal } from './ExplorerTreeDeleteModal';
import { useTranslation } from 'react-i18next';
export default function ExplorerTreeActionBar({
  title,
  nodeKey,
  isLeaf,
  createBy,
  fileSize,
}) {
  const username = useSelector((state) => state.username);
  const editorMode = useSelector((state) => state.datasetData.mode);
  const [downloading, setDownloading] = useState(false);
  const [downloadHash, setDownloadHash] = useState(null);
  const hightLighted = useSelector((state) => state.datasetData.hightLighted);
  const datasetInfo = useSelector((state) => state.datasetInfo.basicInfo);
  const [deleteVisible, setDeleteVisible] = useState(false);
  const { t } = useTranslation(['errormessages', 'success']);
  const datasetGeid = datasetInfo.geid;
  const dispatch = useDispatch();
  const previewNode = () => {
    const titleArr = title.split('.');
    const format = titleArr[titleArr.length - 1];
    dispatch(
      datasetDataActions.setPreviewFile({
        type: format.toLowerCase(),
        geid: nodeKey,
        name: title,
        size: fileSize,
      }),
    );
  };
  const downloadNode = async () => {
    const sessionId = tokenManager.getCookie('sessionId');
    let res;
    setDownloading(true);
    try {
      res = await downloadDatasetFiles(
        datasetGeid,
        [{ geid: nodeKey }],
        username,
        sessionId,
      );
    } catch (e) {
      message.error(t('errormessages:datasetDownloadFile.default.0'));
      setDownloading(false);
      return;
    }
    if (res?.data?.result?.payload?.hashCode) {
      setDownloadHash(res.data?.result?.payload?.hashCode);
    } else {
      message.error(t('errormessages:datasetDownloadFile.default.0'));
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
        const url = `/vre/api/vre/portal/download/vre/v1/download/${hashCode}`;
        window.open(url, '_blank');
      } else {
        message.error(t('errormessages:datasetDownloadFile.default.0'));
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
  // const editNode = () => {
  //   const newSelectedData = selectedData.filter((v) => v !== nodeKey);
  //   dispatch(datasetDataActions.setSelectedData(newSelectedData));
  //   dispatch(datasetDataActions.setMode(EDIT_MODE.EIDT_INDIVIDUAL));
  // const newTreeData = updateTreeInfo(_.cloneDeep(treeData), nodeKey, {
  //   disabled: true,
  // });
  // dispatch(datasetDataActions.setTreeData(newTreeData));
  // };
  function displayFileSize() {
    if (fileSize < 1 * 1024) {
      return fileSize + 'B';
    } else if (fileSize < 1 * 1024 * 1024) {
      return (fileSize / 1024.0).toFixed(2) + 'KB';
    } else if (fileSize < 1 * 1024 * 1024 * 1024) {
      return (fileSize / 1024.0 / 1024.0).toFixed(2) + 'MB';
    } else if (fileSize < 1 * 1024 * 1024 * 1024 * 1024) {
      return (fileSize / 1024.0 / 1024.0 / 1024.0).toFixed(2) + 'GB';
    }
  }
  const deleteNode = () => {
    setDeleteVisible(true);
  };
  const cancelEdit = () => {
    // dispatch(datasetDataActions.setMode(EDIT_MODE.DISPLAY));
  };

  const explorerTreeDeleteModalProps = {
    deleteVisible,
    setDeleteVisible,
    datasetGeid,
    nodeKey,
    username,
    title,
  };
  return (
    <>
      <div className={'tree-node-custom-title'}>
        {!isLeaf ? (
          <FolderOutlined className="node-icon" />
        ) : (
          <FileOutlined className="node-icon" />
        )}
        {editorMode === EDIT_MODE.EIDT_INDIVIDUAL &&
        nodeKey === hightLighted ? (
          <div
            className="rename-bar"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <Input value={title} className="rename-input" />
            <Button
              type="primary"
              icon={<SaveOutlined />}
              className="rename-save-btn"
            >
              Save
            </Button>
            <CloseOutlined
              className="rename-close-btn"
              onClick={(e) => cancelEdit()}
            />
          </div>
        ) : (
          <>
            <span className="node-name">{title}</span>
            <span className="uploader">{createBy ? 'by ' + createBy : ''}</span>
            <span className="size">{fileSize ? displayFileSize() : ''}</span>
            <div
              className="actions-bar"
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              {(title.toLowerCase().endsWith('.tsv') ||
                title.toLowerCase().endsWith('.csv') ||
                title.toLowerCase().endsWith('.json')) && (
                // ||title.toLowerCase().endsWith('.txt')
                <EyeOutlined
                  onClick={(e) => {
                    previewNode();
                  }}
                />
              )}
              {downloading ? (
                <LoadingOutlined />
              ) : (
                <DownloadOutlined
                  onClick={(e) => {
                    downloadNode();
                  }}
                />
              )}

              {/* <EditOutlined
              onClick={(e) => {
                editNode();
              }}
            /> */}
              <DeleteOutlined
                onClick={(e) => {
                  deleteNode();
                }}
              />
            </div>
          </>
        )}
      </div>
      <ExplorerTreeDeleteModal {...explorerTreeDeleteModalProps} />
    </>
  );
}
