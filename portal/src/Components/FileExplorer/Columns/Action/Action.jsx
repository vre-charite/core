import React, { useContext, useState } from 'react';
import { Button, Menu, Dropdown } from 'antd';
import { MoreOutlined } from '@ant-design/icons';
import FileExplorerContext from '../../FileExplorerContext';
import { fileExplorerTableActions } from '../../../../Redux/actions';
import { useDispatch, useSelector } from 'react-redux';
import {
  downloadFilesAPI,
  getZipContentAPI,
  getFileManifestAttrs,
} from '../../../../APIs';
import { useCurrentProject } from '../../../../Utility';
import { tokenManager } from '../../../../Service/tokenManager';
import {
  appendDownloadListCreator,
  setSuccessNum,
} from '../../../../Redux/actions';
import { ErrorMessager, namespace } from '../../../../ErrorMessages';
import ZipPreviewModal from './ZipPreviewModal';
import _ from 'lodash';
export default function Action({ text, record }) {
  const dispatch = useDispatch();
  const fileExplorerContext = useContext(FileExplorerContext);
  const { username, successNum } = useSelector((state) => state);
  const { activeReq } = useSelector((state) => state.request2Core);
  const [currentProject] = useCurrentProject();
  const [previewModalVisible, setPreviewModalVisible] = useState(false);
  const [zipContent, setZipContent] = useState(null);
  const [currentDataset = {}] = useCurrentProject();
  const columnsDisplayCfg = fileExplorerContext.columnsDisplayCfg;
  function handlePreviewCancel(e) {
    setPreviewModalVisible(false);
  }
  async function updateManifest(record) {
    let attrsMap = await getFileManifestAttrs([record.geid]);
    attrsMap = attrsMap.data.result;
    const recordManifest = attrsMap[record.geid];
    if (!_.isEmpty(recordManifest)) {
      record['manifest'] = recordManifest;
      dispatch(
        fileExplorerTableActions.setPropertyRecord({
          geid: fileExplorerContext.reduxKey,
          param: record,
        }),
      );
    }
  }
  function openFileSider(record) {
    dispatch(
      fileExplorerTableActions.setPropertyRecord({
        geid: fileExplorerContext.reduxKey,
        param: record,
      }),
    );
    dispatch(
      fileExplorerTableActions.setSidePanelOpen({
        geid: fileExplorerContext.reduxKey,
        param: true,
      }),
    );
    updateManifest(record);
  }
  const hide4DeletedRecord =
    columnsDisplayCfg && columnsDisplayCfg.deleteIndicator && record.archived;
  const menu = (
    <Menu>
      <Menu.Item onClick={(e) => openFileSider(record)}>Properties</Menu.Item>
      {!hide4DeletedRecord && <Menu.Divider />}
      {!hide4DeletedRecord && (
        <Menu.Item
          onClick={async (e) => {
            let file = record.name;
            var folder = file && file.substring(0, file.lastIndexOf('/') + 1);
            var filename =
              file && file.substring(file.lastIndexOf('/') + 1, file.length);
            let files = [
              {
                file: filename,
                path: folder,
                geid: record.geid,
                project_code: currentProject.code,
              },
            ];
            const sessionId = tokenManager.getCookie('sessionId');
            console.log(activeReq, 'activeReq');
            downloadFilesAPI(
              fileExplorerContext.projectGeid,
              files,
              () => {},
              (item) => dispatch(appendDownloadListCreator(item)),
              sessionId,
              currentProject.code,
              username,
              'greenroom',
              activeReq.id,
            )
              .then((res) => {
                if (res) {
                  const url = res;
                  window.open(url, '_blank');
                  setTimeout(() => {
                    dispatch(setSuccessNum(successNum + 1));
                  }, 3000);
                }
              })
              .catch((err) => {
                if (err.response) {
                  const errorMessager = new ErrorMessager(
                    namespace.project.files.downloadFilesAPI,
                  );
                  errorMessager.triggerMsg(err.response.status);
                }
                return;
              });
          }}
        >
          Download
        </Menu.Item>
      )}
      {record &&
        record.name &&
        record.name.split('.').pop() === 'zip' &&
        !hide4DeletedRecord && <Menu.Divider />}
      {record &&
        record.name &&
        record.name.split('.').pop() === 'zip' &&
        !hide4DeletedRecord && (
          <Menu.Item
            style={{ textAlign: 'center' }}
            onClick={async () => {
              const { geid } = record;
              const zipRes = await getZipContentAPI(
                geid,
                currentDataset && currentDataset.globalEntityId,
              );
              if (zipRes.status === 200 && zipRes.data) {
                setZipContent(zipRes.data.result);
              }
              setPreviewModalVisible(true);
            }}
          >
            Preview
          </Menu.Item>
        )}
      {record &&
        record.name &&
        record.name.split('.').pop() === 'zip' &&
        !hide4DeletedRecord && (
          <ZipPreviewModal
            record={record}
            zipContent={zipContent}
            visible={previewModalVisible}
            handlePreviewCancel={handlePreviewCancel}
          />
        )}
    </Menu>
  );
  return (
    <>
      <Dropdown overlay={menu} placement="bottomRight">
        <Button shape="circle">
          <MoreOutlined />
        </Button>
      </Dropdown>
    </>
  );
}
