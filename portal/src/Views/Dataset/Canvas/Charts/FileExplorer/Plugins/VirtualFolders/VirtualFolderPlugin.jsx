import React, { useState } from 'react';
import { FolderAddOutlined } from '@ant-design/icons';
import { Button, Tooltip, message } from 'antd';
import VirtualFolderModal from './VirtualFolderModal';
function VirtualFolderPlugin({ selectedRowKeys, selectedRows }) {
  const [modalVisible, setModalVisible] = useState(false);
  let files = [];
  if (selectedRows) {
    files = selectedRows.map((v) => (v ? v.guid : v));
  }
  files = files.filter((v) => !!v);
  function popCollectionModal() {
    if (selectedRowKeys.length == 0) {
      message.error('Please select files', 3);
      return;
    }
    setModalVisible(true);
  }
  return (
    <>
      <Tooltip placement="top" title="Add To My Collection">
        <Button
          type="primary"
          shape="circle"
          onClick={() => {
            popCollectionModal();
          }}
          icon={<FolderAddOutlined />}
          style={{ marginRight: 8 }}
          disabled={selectedRowKeys.length == 0}
        />
      </Tooltip>
      <VirtualFolderModal
        files={files}
        visible={modalVisible}
        setVisible={setModalVisible}
      />
    </>
  );
}
export default VirtualFolderPlugin;
