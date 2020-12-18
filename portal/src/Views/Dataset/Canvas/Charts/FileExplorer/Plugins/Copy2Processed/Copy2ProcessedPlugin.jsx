import React, { useState } from 'react';
import { CopyOutlined, LeftOutlined, CheckOutlined } from '@ant-design/icons';
import { TABLE_STATE } from '../../RawTableValues';
import { Button, Tooltip, message } from 'antd';
import Copy2ProcessedModal from './Copy2ProcessedModal';
function Copy2Processed({
  selectedRowKeys,
  setSelectedRowKeys,
  selectedRows,
  setTableState,
}) {
  const [copyModalVisible, setCopyModalVisible] = useState(false);
  const copyFiles = selectedRows
    .map((v) => {
      if (!v) return null;
      return {
        input_path: v.name,
        uploader: v.owner,
        generate_id:
          v.generateId && v.generateId !== 'undefined' ? v.generateId : null,
      };
    })
    .filter((v) => !!v);
  function copy2Processed(e) {
    if (selectedRowKeys.length == 0) {
      message.error('Please select files to copy.', 3);
      return;
    }
    setTableState(TABLE_STATE.NORMAL);
    setCopyModalVisible(true);
  }
  return (
    <>
      <Tooltip placement="top" title="Copy To Green Room Processed">
        <Button
          type="primary"
          shape="circle"
          onClick={() => {
            copy2Processed();
          }}
          icon={<CopyOutlined />}
          style={{ marginRight: 8 }}
        />
      </Tooltip>
      <Copy2ProcessedModal
        visible={copyModalVisible}
        setVisible={setCopyModalVisible}
        files={copyFiles}
        eraseSelect={() => {
          setSelectedRowKeys([]);
        }}
      />
    </>
  );
}
export default Copy2Processed;
