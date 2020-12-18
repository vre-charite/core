import React, { useState } from 'react';
import { DeleteOutlined } from '@ant-design/icons';
import { Button, Tooltip, message } from 'antd';

import VFolderFilesDeleteModal from './VFolderFilesDeleteModal';
function VirtualFolderFilesDeletePlugin({
  selectedRowKeys,
  selectedRows,
  panelKey,
  setSelectedRowKeys,
}) {
  const [modalVisible, setModalVisible] = useState(false);
  const files = selectedRows.map((v) => v.guid);
  return (
    <>
      <Tooltip placement="top" title="Remove From Collection">
        <Button
          type="primary"
          shape="circle"
          disabled={!selectedRowKeys || selectedRowKeys.length == 0}
          onClick={() => {
            setModalVisible(true);
          }}
          icon={<DeleteOutlined />}
          style={{ marginRight: 8 }}
        />
      </Tooltip>
      <VFolderFilesDeleteModal
        visible={modalVisible}
        setVisible={setModalVisible}
        files={files}
        panelKey={panelKey}
        setSelectedRowKeys={setSelectedRowKeys}
      />
    </>
  );
}
export default VirtualFolderFilesDeletePlugin;
