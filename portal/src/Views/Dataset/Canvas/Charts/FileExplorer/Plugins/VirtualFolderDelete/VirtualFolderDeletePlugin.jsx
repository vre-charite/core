import React, { useState } from 'react';
import { Button, Tooltip, message } from 'antd';

import VFolderDeleteModal from './VFolderDeleteModal';
function VirtualFolderDeletePlugin({
  selectedRows,
  panelKey,
  setSelectedRowKeys,
  removePanel,
}) {
  const [modalVisible, setModalVisible] = useState(false);
  const files = selectedRows.map((v) => v.guid);
  return (
    <>
      <Button
        danger
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
        setSelectedRowKeys={setSelectedRowKeys}
      />
    </>
  );
}
export default VirtualFolderDeletePlugin;
