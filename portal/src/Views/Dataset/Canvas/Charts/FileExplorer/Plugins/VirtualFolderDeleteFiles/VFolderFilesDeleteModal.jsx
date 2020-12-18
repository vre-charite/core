import React, { useEffect, useState } from 'react';
import { Modal, message } from 'antd';
import {
  removeFromVirtualFolder,
  listAllVirtualFolder,
} from '../../../../../../../APIs';
import { useSelector, useDispatch } from 'react-redux';
import { setSuccessNum } from '../../../../../../../Redux/actions';

const VFolderFilesDeleteModal = ({
  visible,
  setVisible,
  files,
  panelKey,
  setSelectedRowKeys,
}) => {
  const dispatch = useDispatch();
  const successNum = useSelector((state) => state.successNum);
  const project = useSelector((state) => state.project);
  const [confirmLoading, setConfirmLoading] = React.useState(false);
  const [vfolders, setVFolders] = useState([]);
  function closeModal() {
    setVisible(false);
  }
  async function handleOk() {
    const vfolderName = panelKey.split('-').slice(1).join('-');
    const vfolder = vfolders.find((v) => v.name === vfolderName);
    if (vfolder) {
      try {
        await removeFromVirtualFolder(vfolder.id, files);
        setSelectedRowKeys([]);
      } catch (e) {
        message.error('Network error. Please try again later', 3);
      }
      message.success('Files have been removed successfully', 3);
      dispatch(setSuccessNum(successNum - files.length));
      closeModal();
    }
  }
  const handleCancel = () => {
    closeModal();
  };
  useEffect(() => {
    async function loadVFolders() {
      const containerId = project.profile.id;
      const res = await listAllVirtualFolder(containerId);
      const virualFolders = res.data.result;
      console.log(virualFolders);
      setVFolders(virualFolders);
    }
    loadVFolders();
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
