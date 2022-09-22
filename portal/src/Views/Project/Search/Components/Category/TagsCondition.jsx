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
const Option = Select.Option;

const defaultValues = (condition) => {
  if (condition.category === 'tags' && condition.keywords) {
    return condition.keywords
  } else {
    return []
  }
}

function TagsCondition({ condition, updateCondition, clearTrigger, form }) {
  useEffect(() => {
    if (clearTrigger) {
      form.resetFields(['tagsCondition', 'tagsKeyword']);
    }
  }, [clearTrigger]);
  const children = [];
  return (
    <>
      <Form.Item
        label="Condition"
        name="tagsCondition"
        style={{ width: '200px', marginRight: 18 }}
      >
        <Select defaultValue="contains" disabled showArrow={false}>
          <Option value="contain">Contains</Option>
        </Select>
      </Form.Item>
      <Form.Item
        label="Keyword"
        name="tagsKeyword"
        initialValue={defaultValues(condition)}
        rules={[
          {
            required: true,
          },
        ]}
        style={{ flex: 1, display: 'inline-block' }}
      >
        <Select
          mode="tags"
          style={{ width: '100%' }}
          onChange={(value) => {
            updateCondition(condition.cid, {
              keywords: value,
            });
          }}
        >
          {children}
        </Select>
      </Form.Item>
    </>
  );
}

export default TagsCondition;
