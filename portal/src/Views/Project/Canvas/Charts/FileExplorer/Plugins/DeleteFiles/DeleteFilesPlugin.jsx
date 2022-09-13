// Copyright 2022 Indoc Research
// 
// Licensed under the EUPL, Version 1.2 or – as soon they
// will be approved by the European Commission - subsequent
// versions of the EUPL (the "Licence");
// You may not use this work except in compliance with the
// Licence.
// You may obtain a copy of the Licence at:
// 
// https://joinup.ec.europa.eu/collection/eupl/eupl-text-eupl-12
// 
// Unless required by applicable law or agreed to in
// writing, software distributed under the Licence is
// distributed on an "AS IS" basis,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
// express or implied.
// See the Licence for the specific language governing
// permissions and limitations under the Licence.
// 

import React, { useState } from 'react';
import { DeleteOutlined } from '@ant-design/icons';
import { Button, message } from 'antd';
import { TABLE_STATE } from '../../RawTableValues';
import DeleteFilesModal from './DeleteFilesModal';
import i18n from '../../../../../../../i18n';

const DeleteFilesPlugin = ({
  tableState,
  selectedRowKeys,
  clearSelection,
  selectedRows,
  setTableState,
  panelKey,
  permission,
}) => {
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);

  const deleteFiles = selectedRows
    .map((v) => {
      if (!v) return null;
      return {
        input_path: v.name,
        fileName: v.fileName,
        uploader: v.owner,
        geid: v.geid,
        dcm_id: v["dcmId"] && v["dcmId"] !== 'undefined' ? v["dcmId"] : null,
      };
    })
    .filter((v) => !!v);

  const fileDeletion = (e) => {
    if (selectedRowKeys.length === 0) {
      message.error(
        `${i18n.t('errorMessages:fileOperations.noFileToDelete')}`,
        3,
      );
      return;
    }
    setTableState(TABLE_STATE.NORMAL);
    setDeleteModalVisible(true);
  };

  return (
    <>
      <Button
        type="link"
        onClick={() => {
          fileDeletion();
        }}
        icon={<DeleteOutlined />}
        style={{ marginRight: 8 }}
      >
        Delete
      </Button>

      <DeleteFilesModal
        visible={deleteModalVisible}
        setVisible={setDeleteModalVisible}
        files={deleteFiles}
        eraseSelect={() => {
          clearSelection();
        }}
        panelKey={panelKey}
        permission={permission}
      />
    </>
  );
};

export default DeleteFilesPlugin;
