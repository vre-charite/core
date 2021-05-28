import React, { useState } from 'react';
import { ProfileOutlined, LeftOutlined } from '@ant-design/icons';
import { TABLE_STATE } from '../../RawTableValues';
import { Button, message } from 'antd';
import ManifestManagementModal from './ManifestManagementModal';
import i18n from '../../../../../../../i18n';
import { CheckOutlined } from '@ant-design/icons';
function ManifestManagementPlugin({
  selectedRowKeys,
  clearSelection,
  selectedRows,
  tableState,
  setTableState,
}) {
  const [manifestModalVisible, setManifestModalVisible] = useState(false);

  const selFolders = selectedRows.filter((v) => {
    if (v.nodeLabel.indexOf('Folder') !== -1) {
      return true;
    } else {
      return false;
    }
  });
  const selFilesAll = selectedRows.map((v) => {
    if (!v) return null;
    if (v.nodeLabel.indexOf('Folder') !== -1) {
      return null;
    }
    return {
      input_path: v.name,
      uploader: v.owner,
      guid: v.guid,
      geid: v.geid,
      manifest: v.manifest,
      generate_id:
        v.generateId && v.generateId !== 'undefined' ? v.generateId : null,
    };
  });
  const selFiles = selFilesAll.filter(
    (v) => !!v && (!v.manifest || v.manifest.length === 0),
  );
  const withManifest = selFilesAll.filter(
    (v) => !!v && v.manifest && v.manifest.length,
  );
  const selText =
    withManifest.length || selFolders.length
      ? `${selectedRowKeys.length} Selected - ${
          withManifest.length + selFolders.length
        } Unavailable `
      : `${selectedRowKeys.length} Selected`;

  function attach(e) {
    if (selFiles.length === 0) {
      message.error(
        `${i18n.t('formErrorMessages:attachManifestModal.files.empty')}`,
        3,
      );
      return;
    }
    setTableState(TABLE_STATE.NORMAL);
    setManifestModalVisible(true);
  }
  const ManifestToolTips = (
    <div
      style={{
        width: '100%',
        height: 52,
        position: 'absolute',
        left: 0,
        top: -10,
        zIndex: 100,
        paddingTop: 15,
        background: 'white',
      }}
    >
      <div
        style={{ display: 'inline-block', color: '#1890ff', cursor: 'pointer' }}
        onClick={(e) => {
          setTableState(TABLE_STATE.NORMAL);
          clearSelection();
        }}
      >
        <LeftOutlined fill="#1890ff" /> <span>Back</span>
      </div>
      <div style={{ marginLeft: 40, display: 'inline-block' }}>
        <span style={{ marginRight: 40 }}>
          {selectedRowKeys && selectedRowKeys.length ? selText : ''}
        </span>
        <Button
          type="primary"
          onClick={attach}
          icon={<CheckOutlined />}
          disabled={selFiles.length === 0}
        >
          Confirm
        </Button>
      </div>
    </div>
  );
  return (
    <>
      <Button
        type="link"
        onClick={() => {
          // fake copy data, will be deleted
          // deleteCopiedItemFromSel();
          setTableState(TABLE_STATE.MANIFEST_APPLY);
        }}
        icon={<ProfileOutlined />}
        style={{ marginRight: 8 }}
      >
        Annotate
      </Button>

      {tableState === TABLE_STATE.MANIFEST_APPLY ? ManifestToolTips : null}
      <ManifestManagementModal
        visible={manifestModalVisible}
        setVisible={setManifestModalVisible}
        files={selFiles}
        eraseSelect={() => {
          clearSelection();
        }}
      />
    </>
  );
}

export default ManifestManagementPlugin;
