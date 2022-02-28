import React from 'react';
import { Modal, Button } from 'antd';

import FileBasics from './FileBasics';

function FileBasicsModal(props) {
  const { record } = props;
  return (
    <>
      <Modal
        title="General"
        visible={props.visible}
        onOk={props.handleOk}
        onCancel={props.handleOk}
        footer={[
          <Button key="back" onClick={props.handleOk}>
            OK
          </Button>,
        ]}
      >
        <FileBasics pid={props.projectId} record={record} />
      </Modal>
    </>
  );
}

export default FileBasicsModal;
