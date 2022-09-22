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

import React, { useState } from "react";
import { Form, Button, Input, Space } from "antd";

import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import _ from "lodash";

/**
 * Dynamic key value fields
 * @returns a series of form item
 */

function DynamicKeyValue({ name }) {
  return (
    <Form.List name={name} label={name}>
      {(fields, { add, remove }) => {
        return (
          <div>
            {fields.map(field => (
              <Space
                key={field.key}
                style={{ display: "flex", marginBottom: 8 }}
                align="start"
              >
                <Form.Item
                  {...field}
                  name={[field.name, "key"]}
                  fieldKey={[field.fieldKey, "key"]}
                  rules={[{ required: true, message: "Missing key" }]}
                >
                  <Input placeholder="Key" />
                </Form.Item>
                <Form.Item
                  {...field}
                  name={[field.name, "value"]}
                  fieldKey={[field.fieldKey, "value"]}
                  rules={[{ required: true, message: "Missing value" }]}
                >
                  <Input placeholder="Value" />
                </Form.Item>

                <MinusCircleOutlined
                  onClick={() => {
                    remove(field.name);
                  }}
                />
              </Space>
            ))}

            <Form.Item>
              <Button
                type="dashed"
                onClick={() => {
                  add();
                }}
                block
              >
                <PlusOutlined /> Add field
              </Button>
            </Form.Item>
          </div>
        );
      }}
    </Form.List>
  );
}

export default DynamicKeyValue;
