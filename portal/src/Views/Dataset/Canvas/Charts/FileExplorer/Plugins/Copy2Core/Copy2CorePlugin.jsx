import React, { useState } from 'react';
import { CopyOutlined, LeftOutlined, CheckOutlined } from '@ant-design/icons';
import { TABLE_STATE } from '../../RawTableValues';
import { Button, Tooltip, message } from 'antd';
import Copy2CoreModal from './Copy2CoreModal';
function Copy2CorePlugin({
  selectedRowKeys,
  setSelectedRowKeys,
  selectedRows,
  tableState,
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
  function copy2Core(e) {
    if (selectedRowKeys.length == 0) {
      message.error('Please select files to copy.', 3);
      return;
    }
    setTableState(TABLE_STATE.NORMAL);
    setCopyModalVisible(true);
  }
  const CopyToCoreToolTips = (
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
        <Button type="primary" ghost onClick={copy2Core}>
          Copy to Core
        </Button>
      </div>
    </div>
  );
  return (
    <>
      <Tooltip placement="top" title="Copy To Core">
        <Button
          type="primary"
          shape="circle"
          onClick={() => {
            // fake copy data, will be deleted
            // deleteCopiedItemFromSel();
            setTableState(TABLE_STATE.COPY_TO_CORE);
          }}
          icon={<CopyOutlined />}
          style={{ marginRight: 8 }}
        />
      </Tooltip>
      {tableState === TABLE_STATE.COPY_TO_CORE ? CopyToCoreToolTips : null}
      <Copy2CoreModal
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
export default Copy2CorePlugin;
