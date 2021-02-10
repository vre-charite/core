import React, { useState } from 'react';
import { ProfileOutlined, LeftOutlined } from '@ant-design/icons';
import { TABLE_STATE } from '../../RawTableValues';
import { Button, message } from 'antd';
import ManifestManagementModal from './ManifestManagementModal';
import i18n from '../../../../../../../i18n';
function ManifestManagementPlugin({
  selectedRowKeys,
  setSelectedRowKeys,
  selectedRows,
  tableState,
  setTableState,
}) {
  const [manifestModalVisible, setManifestModalVisible] = useState(false);
  const selFiles = selectedRows
    .map((v) => {
      if (!v) return null;
      return {
        input_path: v.name,
        uploader: v.owner,
        guid: v.guid,
        geid: v.geid,
        generate_id:
          v.generateId && v.generateId !== 'undefined' ? v.generateId : null,
      };
    })
    .filter((v) => !!v);
  function attach(e) {
    if (selectedRowKeys.length === 0) {
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
          setSelectedRowKeys([]);
        }}
      >
        <LeftOutlined fill="#1890ff" /> <span>Back</span>
      </div>
      <div style={{ marginLeft: 40, display: 'inline-block' }}>
        <span style={{ marginRight: 40 }}>
          {selectedRowKeys && selectedRowKeys.length
            ? `Selected ${selectedRowKeys.length} items`
            : ''}
        </span>
        <Button type="primary" ghost onClick={attach}>
          Attach Manifest
        </Button>
      </div>
    </div>
  );
  return (
    <>
      {selectedRowKeys.length === 0 ? (
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
          Manifest Management
        </Button>
      ) : null}

      {tableState === TABLE_STATE.MANIFEST_APPLY ? ManifestToolTips : null}
      <ManifestManagementModal
        visible={manifestModalVisible}
        setVisible={setManifestModalVisible}
        files={selFiles}
        eraseSelect={() => {
          setSelectedRowKeys([]);
        }}
      />
    </>
  );
}

export default ManifestManagementPlugin;
