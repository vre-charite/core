import React, { useState } from 'react';
import { FolderAddOutlined } from '@ant-design/icons';
import { Button, message } from 'antd';
import VirtualFolderModal from './VirtualFolderModal';
import i18n from '../../../../../../../i18n';
function VirtualFolderPlugin({ selectedRowKeys, selectedRows }) {
  const [modalVisible, setModalVisible] = useState(false);
  let files = [];
  if (selectedRows) {
    files = selectedRows.map((v) => (v ? v.geid : v));
  }
  files = files.filter((v) => !!v);
  function popCollectionModal() {
    if (selectedRowKeys.length === 0) {
      message.error(
        `${i18n.t('formErrorMessages:addToVfolderModal.files.empty')}`,
        3,
      );
      return;
    }
    setModalVisible(true);
  }
  return (
    <>
      <Button
        type="link"
        onClick={() => {
          popCollectionModal();
        }}
        icon={<FolderAddOutlined />}
        style={{ marginRight: 8 }}
      >
        Add To Collection
      </Button>
      <VirtualFolderModal
        files={files}
        visible={modalVisible}
        setVisible={setModalVisible}
      />
    </>
  );
}
export default VirtualFolderPlugin;
