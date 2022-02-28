import React, { useState, useRef } from 'react';
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
  const attrBtnRef = useRef(null);
  let leftOffset = 0;
  const foldersPath =
    attrBtnRef?.current?.parentNode.querySelectorAll('.ant-breadcrumb');
  if (foldersPath && foldersPath[0] && foldersPath[0].offsetWidth) {
    leftOffset = foldersPath[0].offsetWidth + 40;
  }
  const selFilesAll = selectedRows.map((v) => {
    if (!v) return null;
    if (v.nodeLabel.indexOf('Folder') !== -1) {
      return {
        geid: v.geid,
        nodeLabel: v.nodeLabel,
        fileName: v.fileName,
        manifest: null,
      };
    }
    return {
      // input_path: v.name,
      // uploader: v.owner,
      // guid: v.guid,
      geid: v.geid,
      manifest: v.manifest,
      nodeLabel: v.nodeLabel,
      fileName: v.fileName,
    };
  });
  const selFiles = selFilesAll.filter(
    (v) => !!v && (!v.manifest || v.manifest.length === 0),
  );
  const withManifest = selFilesAll.filter(
    (v) => !!v && v.manifest && v.manifest.length,
  );
  const selText = withManifest.length
    ? `${selectedRowKeys.length} Selected - ${withManifest.length} Unavailable `
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
        height: 52,
        position: 'absolute',
        left: leftOffset,
        top: -11,
        right: 0,
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
        <span style={{ marginRight: 70 }}>
          {selectedRowKeys && selectedRowKeys.length ? selText : ''}
        </span>
        <Button
          type="primary"
          ghost
          style={{
            borderRadius: '6px',
            height: '27px',
            width: '138px',
            padding: '0px',
          }}
          onClick={attach}
          icon={<ProfileOutlined />}
          disabled={selFiles.length === 0}
        >
          Add Attributes
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
        ref={attrBtnRef}
        icon={<ProfileOutlined />}
        style={{ marginRight: 8 }}
      >
        Add Attributes
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
