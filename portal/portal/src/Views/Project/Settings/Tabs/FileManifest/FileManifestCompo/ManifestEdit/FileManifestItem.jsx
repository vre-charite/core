import React, { useState } from 'react';
import {
  EditOutlined,
  DeleteOutlined,
  DownloadOutlined,
  SaveOutlined,
  RedoOutlined,
  ExportOutlined,
} from '@ant-design/icons';
import { Button, Input, Modal, message } from 'antd';
import { useCurrentProject } from '../../../../../../../Utility';
import { deleteManifest, updateManifest } from '../../../../../../../APIs';
import FileManifestExistentTable from './FileManifestExistentTable';
import { validateManifestName } from '../../Utils/FormatValidators';
import i18n from '../../../../../../../i18n';
import styles from '../../../../index.module.scss';
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
      title="Delete Attribute Template"
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
        Deleting attribute template is unrecoverable, are you sure you want to
        proceed?
      </p>
    </Modal>
  );

  return (
    <div key={mItem.id} className={styles.manifestList}>
      {renameManifest ? (
        <>
          <Input
            value={renameStr}
            style={{ width: 145, display: 'inline-block', marginLeft: 28 }}
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
              className={styles.button}
              loading={loadingRename}
              icon={<SaveOutlined />}
            >
              Save
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
          <b style={{ marginLeft: 24 }}>{mItem.name}</b>
          <div
            style={{
              display: 'inline-block',
              marginLeft: 20,
            }}
          >
            <Button
              type="link"
              icon={<RedoOutlined />}
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
        icon={<ExportOutlined />}
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
