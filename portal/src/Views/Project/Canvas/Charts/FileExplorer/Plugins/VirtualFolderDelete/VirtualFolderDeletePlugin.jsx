import React, { useState } from 'react';
import { Button } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import VFolderDeleteModal from './VFolderDeleteModal';
function VirtualFolderDeletePlugin({
  selectedRows,
  panelKey,
  clearSelection,
  removePanel,
}) {
  const [modalVisible, setModalVisible] = useState(false);
  const files = selectedRows.map((v) => v.guid);
  return (
    <>
      <Button
        type="link"
        icon={<DeleteOutlined />}
        onClick={() => {
          setModalVisible(true);
        }}
      >
        Delete Collection
      </Button>
      <VFolderDeleteModal
        visible={modalVisible}
        setVisible={setModalVisible}
        files={files}
        panelKey={panelKey}
        removePanel={removePanel}
        clearSelection={clearSelection}
      />
    </>
  );
}
export default VirtualFolderDeletePlugin;
