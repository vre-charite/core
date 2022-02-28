import React from 'react';
import { Modal, Button, Select, Spin } from 'antd';
import LineageGraph from './LineageGraph';
import styles from './index.module.scss';


const { Option } = Select;

function LineageGraphModal(props) {
  const handleChange = (value) => {
    props.setLoading(true);
    props.setDirection(value);
    props.updateLineage(props.record, value);
  }

  return (
    <Spin className={styles.lineage_spin} spinning={props.loading}>
      <Modal
        title="Data Lineage Graph"
        visible={props.visible}
        onOk={props.handleLineageCancel}
        onCancel={() => {
          props.handleLineageCancel();
        }}
        footer={[
          <Button key="back" onClick={props.handleLineageCancel}>
            OK
          </Button>,
        ]}
      >
        <div style={{ float: 'right', marginTop: -20 }}> 
          <Select 
            style={{ width: 140, marginLeft: 10 }}
            defaultValue="INPUT"
            onChange={handleChange}
            value={props.direction}
          >
            <Option value="INPUT">Upstream</Option>
            <Option value="OUTPUT">Downstream</Option>
            <Option value="BOTH">All Nodes</Option>
          </Select>
        </div>
        <LineageGraph type={props.type} record={props.record} width={472} />
      </Modal>
    </Spin>
  );
}

export default LineageGraphModal;
