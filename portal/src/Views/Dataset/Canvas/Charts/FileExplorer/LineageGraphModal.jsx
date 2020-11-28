import React from 'react';
import { Modal, Button } from 'antd';

import LineageGraph from './LineageGraph';

function LineageGraphModal(props) {
  return (
    <>
      <Modal
        title="Data Lineage Graph"
        visible={props.visible}
        onOk={props.handleLineageCancel}
        onCancel={props.handleLineageCancel}
        footer={[
          <Button key="back" onClick={props.handleLineageCancel}>
            OK
          </Button>,
        ]}
      >
        <LineageGraph type={props.type} record={props.record} width={472} />
      </Modal>
    </>
  );
}

export default LineageGraphModal;
