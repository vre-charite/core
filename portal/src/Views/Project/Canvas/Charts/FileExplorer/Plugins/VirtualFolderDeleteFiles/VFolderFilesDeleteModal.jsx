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

import React, { useEffect, useState } from 'react';
import { Modal, message } from 'antd';
import {
  removeFromVirtualFolder,
  listAllVirtualFolder,
} from '../../../../../../../APIs';
import { useSelector, useDispatch } from 'react-redux';
import { setSuccessNum } from '../../../../../../../Redux/actions';
import i18n from '../../../../../../../i18n';
const VFolderFilesDeleteModal = ({
  visible,
  setVisible,
  files,
  panelKey,
  clearSelection,
}) => {
  const dispatch = useDispatch();
  const successNum = useSelector((state) => state.successNum);
  const project = useSelector((state) => state.project);
  // eslint-disable-next-line
  const [confirmLoading, setConfirmLoading] = React.useState(false);
  const [vfolders, setVFolders] = useState([]);
  function closeModal() {
    setVisible(false);
  }
  async function handleOk() {
    setConfirmLoading(true);
    const vfolderName = panelKey.split('-').slice(1).join('-');
    const vfolder = vfolders.find((v) => v.name === vfolderName);
    if (vfolder) {
      try {
        await removeFromVirtualFolder(vfolder.geid, files);
        clearSelection();
        message.success(`${i18n.t('success:virtualFolder.removeFiles')}`, 3);
        dispatch(setSuccessNum(successNum - files.length));
      } catch (e) {
        message.error(
          `${i18n.t('errormessages:removeFromVirtualFolder.default.0')}`,
          3,
        );
      } finally {
        setConfirmLoading(false);
      }

      closeModal();
    }
  }
  const handleCancel = () => {
    closeModal();
  };
  useEffect(() => {
    async function loadVFolders() {
      const res = await listAllVirtualFolder(project.profile?.globalEntityId);
      const virualFolders = res.data.result;
      setVFolders(virualFolders);
    }
    loadVFolders();
    // eslint-disable-next-line
  }, []);

  return (
    <Modal
      width={350}
      centered
      title="Remove Files"
      visible={visible}
      onOk={handleOk}
      onCancel={handleCancel}
      confirmLoading={confirmLoading}
    >
      Removing files from collection will not delete the original files.
    </Modal>
  );
};

export default VFolderFilesDeleteModal;
