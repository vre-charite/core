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
