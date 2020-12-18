import React, { useEffect, useState } from 'react';
import { Modal, Button, Input, message, Form, Select } from 'antd';
import {
  deleteVirtualFolder,
  listAllVirtualFolder,
} from '../../../../../../../APIs';
import { useDispatch, useSelector } from 'react-redux';
import { setCurrentProjectTreeVFolder } from '../../../../../../../Redux/actions';
import CollectionIcon from '../../../../../../../Components/Icons/Collection';

const VFolderFilesDeleteModal = ({
  visible,
  setVisible,
  panelKey,
  removePanel,
}) => {
  const project = useSelector((state) => state.project);
  const [confirmLoading, setConfirmLoading] = React.useState(false);
  const [vfolders, setVFolders] = useState([]);
  const dispatch = useDispatch();
  function closeModal() {
    setVisible(false);
  }
  function updateVFolder(vfolders) {
    const vfoldersNodes = vfolders.map((folder) => {
      return {
        title: folder.name,
        key: 'vfolder-' + folder.name,
        icon: <CollectionIcon width={14} style={{ color: '#1b90fe' }} />,
        disabled: false,
        children: null,
      };
    });
    dispatch(setCurrentProjectTreeVFolder(vfoldersNodes));
    removePanel(panelKey);
  }
  async function handleOk() {
    const vfolderName = panelKey.split('-')[1];
    const vfolder = vfolders.find((v) => v.name === vfolderName);
    if (vfolder) {
      setConfirmLoading(true);
      try {
        await deleteVirtualFolder(vfolder.id);
      } catch (e) {
        message.error('Network error. Please try again later', 3);
        setConfirmLoading(false);
        return;
      }
      message.success('Collection has been deleted successfully', 3);
      setConfirmLoading(false);
      closeModal();
      updateVFolder(vfolders.filter((v) => v.id !== vfolder.id));
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
      setVFolders(virualFolders);
    }
    loadVFolders();
  }, []);

  return (
    <Modal
      width={350}
      centered
      title="Delete Collection"
      visible={visible}
      onOk={handleOk}
      onCancel={handleCancel}
      confirmLoading={confirmLoading}
    >
      Are you sure you want to delete this collection?
    </Modal>
  );
};

export default VFolderFilesDeleteModal;
