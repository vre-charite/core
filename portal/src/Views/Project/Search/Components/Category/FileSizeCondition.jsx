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

import React, { useState, useEffect } from 'react';
import { Input, Button, Select, Form } from 'antd';
import styles from '../../index.module.scss';
const Option = Select.Option;

const defineDefaulValue = (condition, key) => {
  if (condition.category === 'file_size' && condition[key]) {
    return condition[key];
  } else {
    return '';
  }
}


function FileSizeCondition({ condition, updateCondition, clearTrigger, form, setClearTrigger }) {
  const [changeConditionTimes, setChangeConditionTimes] = useState(1);
  useEffect(() => {
    if (clearTrigger) {
      form.resetFields(['fileSizeCondition', 'fileSize', "fileSize1", "fileSize2", 'fileSizeUnit']);
    }
  }, [clearTrigger]);

  useEffect(() => {
    if (changeConditionTimes) {
      form.resetFields(['fileSize', 'fileSize1', 'fileSize2']);
    }
  }, [changeConditionTimes]);

  return (
    <>
      <Form.Item
        label="Condition"
        name="fileSizeCondition"
        style={{ width: '180px', marginRight: 18 }}
      >
        <Select
          value={condition.condition}
          defaultValue="gte"
          onChange={(value) => {
            setChangeConditionTimes(changeConditionTimes + 1);
            updateCondition(condition.cid, {
              condition: value,
              value: '',
              value2: ''
            });
          }}
        >
          <Option value="gte">{`Larger than(>)`}</Option>
          <Option value="lte">{`Less than(<)`}</Option>
          <Option value="Between">Between</Option>
        </Select>
      </Form.Item>
      {condition.condition !== 'Between' ? (
        <Form.Item
          label="Value"
          name="fileSize"
          initialValue={defineDefaulValue(condition, 'value')}
          onChange={(e) => {
            let conditionType = condition.condition;
            let unit = condition.unit;
            if (!conditionType) conditionType = 'gte';
            if (!unit) unit = 'kb';
            updateCondition(condition.cid, {
              value: e.target.value,
              condition: conditionType,
              unit,
            });
          }}
          rules={[
            {
              required: true,
            },
            {
              pattern: /^[0-9]+$/,
              message: 'Please input numeric characters only'
            },
          ]}
          style={{ width: '20%', display: 'inline-block', marginRight: '18px' }}
        >
          <Input />
        </Form.Item>
      ) : (
        <>
          <Form.Item
            label="Value"
            name="fileSize1"
            initialValue={defineDefaulValue(condition, 'value')}
            rules={[
              {
                required: true,
              },
              {
                pattern: /^[0-9]+$/,
                message: 'Please input numeric characters only'
              },
            ]}
            style={{
              display: 'inline-block',
            }}
            onChange={(e) => {
              let conditionType = condition.condition;
              let unit = condition.unit;
              if (!conditionType) conditionType = 'gte';
              if (!unit) unit = 'kb';
              updateCondition(condition.cid, {
                value: e.target.value,
                condition: conditionType,
                unit,
              });
            }}
          >
            <Input />
          </Form.Item>
          <p style={{padding: '30px 10px 0px 10px'}}>and</p>
          <Form.Item
            className={styles.fileSize2}
            label=" "
            name="fileSize2"
            initialValue={defineDefaulValue(condition, 'value2')}
            rules={[
              {
                required: true,
                message: 'Value is required!',
              },
              {
                pattern: /^[0-9]+$/,
                message: 'Please input numeric characters only'
              },
            ]}
            style={{marginRight: '18px'}}
            onChange={(e) => {
              let conditionType = condition.condition;
              let unit = condition.unit;
              if (!conditionType) conditionType = 'gte';
              if (!unit) unit = 'kb';
              updateCondition(condition.cid, {
                value2: e.target.value,
                condition: conditionType,
                unit,
              });
            }}
          >
            <Input />
          </Form.Item>
        </> 
      )}
      <Form.Item
        label="Unit"
        name="fileSizeUnit"
        style={{ flex: 1, display: 'inline-block' }}
      >
        <Select
          value={condition.condition}
          defaultValue="kb"
          onChange={(value) => {
            updateCondition(condition.cid, {
              unit: value,
            });
          }}
        >
          <Option value="kb">Kb</Option>
          <Option value="mb">Mb</Option>
          <Option value="gb">Gb</Option>
        </Select>
      </Form.Item>
    </>
  );
}

export default FileSizeCondition;
