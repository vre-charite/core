import React from 'react';
import styles from './index.module.scss';
import { MANIFEST_ATTR_TYPE } from '../../../Views/Project/Settings/Tabs/manifest.values';
import { Form, Select, Input } from 'antd';
function ManifestForm(props) {
  function renderAttr(attr) {
    if (attr.type === MANIFEST_ATTR_TYPE.MULTIPLE_CHOICE) {
      return (
        <Form.Item
          key={attr.name}
          label={attr.name}
          name={attr.name}
          className={styles.custom_attr_form}
          rules={
            !attr.optional
              ? [
                  {
                    required: true,
                  },
                ]
              : []
          }
        >
          <Select
            allowClear={attr.optional}
            onChange={(e) => {
              const newVal = {
                ...props.attrForm,
              };
              newVal[attr.name] = e ? e : '';
              props.setAttrForm(newVal);
            }}
            getPopupContainer={() => document.getElementById('manifest-form')}
          >
            {attr.value.split(',').length
              ? attr.value.split(',').map((value) => (
                  <Select.Option key={value} value={value}>
                    {value}
                  </Select.Option>
                ))
              : null}
          </Select>
        </Form.Item>
      );
    }
    if (attr.type === MANIFEST_ATTR_TYPE.TEXT)
      return (
        <Form.Item
          key={attr.name}
          label={attr.name}
          name={attr.name}
          className={styles.custom_attr_form}
          rules={
            !attr.optional
              ? [
                  {
                    required: true,
                  },
                ]
              : []
          }
        >
          <Input
            placeholder="max. 100 characters"
            onChange={(e) => {
              const newVal = {
                ...props.attrForm,
              };
              newVal[attr.name] = e.target.value;
              props.setAttrForm(newVal);
            }}
          ></Input>
        </Form.Item>
      );
    return null;
  }

  return (
    <Form
      layout="horizontal"
      labelCol={{ span: 10 }}
      wrapperCol={{ span: 12 }}
      style={{ maxHeight: 195, position: 'relative' }}
      id="manifest-form"
    >
      {props.manifest.attributes.map((attr) => {
        return renderAttr(attr);
      })}
    </Form>
  );
}

export default ManifestForm;
