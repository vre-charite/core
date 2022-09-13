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
