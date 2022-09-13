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
