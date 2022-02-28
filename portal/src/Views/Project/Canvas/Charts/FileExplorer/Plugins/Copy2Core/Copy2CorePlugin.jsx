import React, { useState, useRef } from 'react';
import { CopyOutlined, LeftOutlined } from '@ant-design/icons';
import { TABLE_STATE } from '../../RawTableValues';
import { useSelector } from 'react-redux';
import { Button, message, Modal } from 'antd';
import Copy2CoreModal from './Copy2CoreModal';
import i18n from '../../../../../../../i18n';
function Copy2CorePlugin({
  selectedRowKeys,
  clearSelection,
  selectedRows,
  tableState,
  setTableState,
}) {
  const [copyModalVisible, setCopyModalVisible] = useState(false);
  const copyBtnRef = useRef(null);
  let leftOffset = 0;
  const copyFiles = selectedRows
    .map((v) => {
      if (!v) return null;
      return {
        file_name: v.fileName,
        input_path: v.name,
        uploader: v.owner,
        geid: v.geid,
        nodeLabel: v.nodeLabel,
        dcm_id:
          v["dcmId"] && v["dcmId"] !== 'undefined' ? v["dcmId"] : null,
      };
    })
    .filter((v) => !!v);
  async function copy2Core(e) {
    if (selectedRowKeys.length === 0) {
      message.error(
        `${i18n.t('formErrorMessages:copyFilesModal.files.empty')}`,
        3,
      );
      return;
    }
    setTableState(TABLE_STATE.NORMAL);
    setCopyModalVisible(true);
  }
  const foldersPath =
    copyBtnRef?.current?.parentNode.querySelectorAll('.ant-breadcrumb');
  if (foldersPath && foldersPath[0] && foldersPath[0].offsetWidth) {
    leftOffset = foldersPath[0].offsetWidth + 20;
  }

  const CopyToCoreToolTips = (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        height: 52,
        position: 'absolute',
        left: leftOffset,
        top: -10,
        zIndex: 100,
        background: 'white',
      }}
    >
      <div
        style={{
          display: 'inline-block',
          color: '#1890ff',
          cursor: 'pointer',
          marginLeft: 40,
        }}
        onClick={(e) => {
          setTableState(TABLE_STATE.NORMAL);
        }}
      >
        <LeftOutlined fill="#1890ff" /> <span>Back</span>
      </div>
      <div style={{ marginLeft: 60, display: 'inline-block' }}>
        <Button type="primary" ghost onClick={copy2Core}>
          Copy to Core
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
          setTableState(TABLE_STATE.COPY_TO_CORE);
        }}
        icon={<CopyOutlined />}
        style={{ marginRight: 8 }}
        ref={copyBtnRef}
      >
        Copy To Core
      </Button>
      {tableState === TABLE_STATE.COPY_TO_CORE ? CopyToCoreToolTips : null}
      <Copy2CoreModal
        visible={copyModalVisible}
        setVisible={setCopyModalVisible}
        files={copyFiles}
        selectedRows={selectedRows}
        eraseSelect={() => {
          clearSelection();
        }}
      />
    </>
  );
}
export default Copy2CorePlugin;
