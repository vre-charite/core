import React, { useState } from 'react';
import { CopyOutlined } from '@ant-design/icons';
import { TABLE_STATE } from '../../RawTableValues';
import { Button, message } from 'antd';
import Copy2ProcessedModal from './Copy2ProcessedModal';
import i18n from '../../../../../../../i18n';
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
  return (
    <>
      <Button
        type="link"
        onClick={() => {
          copy2Processed();
        }}
        icon={<CopyOutlined />}
        style={{ marginRight: 8 }}
      >
        Copy To Green Room Processed
      </Button>
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
