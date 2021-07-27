import React, { useState, useEffect } from 'react';
import { Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import CreateFolderModal from './CreateFolderModal';

function CreateFolderPlugin(props) {
  
  const [visible, setVisible] = useState(false);
  const hideModal = () => {
    setVisible(false);
  };
  return (
    <>
      <Button
        onClick={() => {
          setVisible(true);
        }}
        type="link"
        icon={<PlusOutlined />}
      >
        New Folder
      </Button>
      <CreateFolderModal {...props}  hideModal={hideModal} visible={visible} />
    </>
  );
}

export default CreateFolderPlugin;
