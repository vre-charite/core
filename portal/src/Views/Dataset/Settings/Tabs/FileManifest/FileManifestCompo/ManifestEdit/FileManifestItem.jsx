import React, { useState } from 'react';
import {
  EditOutlined,
  DeleteOutlined,
  DownloadOutlined,
} from '@ant-design/icons';
import { Button, Input, Modal, message } from 'antd';
import { useCurrentProject } from '../../../../../../../Utility';
import { deleteManifest, updateManifest } from '../../../../../../../APIs';
import FileManifestExistentTable from './FileManifestExistentTable';
import { validateManifestName } from '../../Utils/FormatValidators';
import i18n from '../../../../../../../i18n';
function FileManifestItem(props) {
  const [renameManifest, setRenameManifest] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);

  let mItem = props.manifestList.find((v) => v.id === props.manifestID);

  const [renameStr, setRenameStr] = useState(mItem.name);
  const [currentDataset] = useCurrentProject();

  const [loadingRename, setLoadingRename] = useState(false);

  const exportJson = () => {
    const json = {
      attributes: mItem.attributes.map((item) => ({
        name: item.name,
        value: item.value,
        type: item.type,
        optional: item.optional,
      })),
    };
    const link = document.createElement('a');
    link.download = renameStr + '.json';
    link.href =
      'data:text/json;charset=utf-8,' +
      encodeURIComponent(JSON.stringify(json));
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const deleteConfirm = (
    <Modal
      title="Delete Manifest"
      visible={deleteModalVisible}
      onOk={async () => {
        try {
          await deleteManifest(props.manifestID);
        } catch (e) {
          message.error(`${i18n.t('errormessages:deleteManifest.500.0')}`);
          setDeleteModalVisible(false);
          return;
        }

        await props.loadManifest();
        setDeleteModalVisible(false);
      }}
      onCancel={() => setDeleteModalVisible(false)}
    >
      <p>
        Deleting manifest is unrecoverable, are you sure you want to proceed?
      </p>
    </Modal>
  );

  return (
    <div
      key={mItem.id}
      style={{ padding: 40, borderBottom: '5px solid #f0f2f5' }}
    >
      {renameManifest ? (
        <>
          <Input
            width={200}
            value={renameStr}
            style={{ width: 200, display: 'inline-block' }}
            onChange={(e) => {
              setRenameStr(e.target.value);
            }}
          />
          <div style={{ display: 'inline-block' }}>
            <Button
              style={{ marginLeft: 60 }}
              type="primary"
              onClick={async (e) => {
                const { valid, err } = validateManifestName(
                  renameStr,
                  props.manifestList,
                );
                if (!valid) {
                  message.error(err);
                  return;
                }
                setLoadingRename(true);
                await updateManifest(
                  props.manifestID,
                  renameStr,
                  currentDataset.code,
                );
                await props.loadManifest();
                setLoadingRename(false);
                setRenameManifest(false);
              }}
              loading={loadingRename}
            >
              Rename
            </Button>
            <Button
              type="link"
              onClick={(e) => {
                setRenameManifest(false);
              }}
            >
              Cancel
            </Button>
          </div>
        </>
      ) : (
        <>
          <b>{mItem.name}</b>
          <div
            style={{
              display: 'inline-block',
              marginLeft: 20,
            }}
          >
            {/* <Button type="link" icon={<ExportOutlined />} onClick={(e) => {}}>
            Export To Template
          </Button> */}
            <Button
              type="link"
              icon={<EditOutlined />}
              style={{ color: 'rgba(0,0,0,0.65)' }}
              onClick={(e) => {
                setRenameManifest(true);
              }}
            >
              Rename
            </Button>
            <Button
              type="link"
              icon={<DeleteOutlined />}
              style={{ color: 'rgba(0,0,0,0.65)' }}
              onClick={(e) => {
                setDeleteModalVisible(true);
              }}
            >
              Delete
            </Button>
          </div>
        </>
      )}
      <Button
        type="link"
        icon={<DownloadOutlined />}
        style={{ color: 'rgba(0,0,0,0.65)' }}
        onClick={(e) => {
          exportJson();
        }}
      >
        Export
      </Button>
      <FileManifestExistentTable
        mItem={mItem}
        loadManifest={props.loadManifest}
      ></FileManifestExistentTable>
      {deleteConfirm}
    </div>
  );
}
export default FileManifestItem;
