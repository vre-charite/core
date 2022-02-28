import React, { useState } from 'react';
import { Button } from 'antd';
import { PullRequestOutlined } from '@ant-design/icons';
import RequestToCoreModal from './RequestToCoreModal';

const RequestToCorePlugin = (props) => {
  const [showModal, setShowModal] = useState(false);
  const [sourcePath, setSourcePath] = useState('');
  const { selectedRows, currentRouting, orderRouting } = props;
  const handleOnClick = () => {
    const filePath = selectedRows[0].displayPath.replace(
      `/${selectedRows[0].fileName}`,
      '',
    );
    setSourcePath(`${filePath}`);
    setShowModal(true);
  };
  return (
    <>
      <Button
        type="link"
        icon={<PullRequestOutlined />}
        style={{ marginRight: 8 }}
        onClick={handleOnClick}
      >
        Request to Core
      </Button>
      <RequestToCoreModal
        showModal={showModal}
        setShowModal={setShowModal}
        selectedRows={selectedRows}
        sourcePath={sourcePath}
        currentRouting={currentRouting}
        orderRouting={orderRouting}
      />
    </>
  );
};

export default RequestToCorePlugin;
