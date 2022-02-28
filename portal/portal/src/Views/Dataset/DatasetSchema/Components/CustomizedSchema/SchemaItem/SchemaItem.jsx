import React, { useState, useEffect, Fragment } from 'react';
import { Form, Space, Input, Checkbox, Select, Tag } from 'antd';
import {
  CheckOutlined,
  CloseOutlined,
  DeleteOutlined,
  EditOutlined,
} from '@ant-design/icons';
import styles from './SchemaItem.module.scss';
import { getValidator } from './validators';
import _ from 'lodash';

const display = (value) => {
  if (_.isArray(value)) {
    return (
      <>
        {value.map((item) => (
          <Tag>{item}</Tag>
        ))}{' '}
      </>
    );
  }
  return <span className={styles['display']}>{value}</span>;
};

const typeOptions = {
  text: { label: 'Text', value: 'text' },
  'multiple-choice': { label: 'Multiple Choice', value: 'multiple-choice' },
  numeric: { label: 'Numeric', value: 'numeric' },
  'date-picker': { label: 'Date Picker', value: 'date-picker' },
};

export default function SchemaItem(props) {
  const { key, name, fieldKey, ...restField } = props.field;
  const { remove, form, templateManagerMode } = props;
  const [, reRender] = useState(Math.random());
  const [isEdit, setIsEdit] = useState(
    !Boolean(form.getFieldValue(['templateItems', name])),
  );
  const [cache, setCache] = useState(
    form.getFieldValue(['templateItems', name]),
  );
  const onChange = (value) => {
    reRender(Math.random());
    form.setFields([
      { name: ['templateItems', name, 'value'], value: undefined },
    ]);
  };

  const onConfirm = async () => {
    try {
      await form.validateFields([['templateItems', name, 'type']]);
      await form.validateFields([['templateItems', name, 'title']]);
      await form.validateFields([['templateItems', name, 'value']]);
      await form.validateFields([['templateItems', name, 'optional']]);

      setCache(form.getFieldValue(['templateItems', name]));
      setIsEdit(false);
    } catch (err) {
      console.log(err, 'err on confirm');
    }
  };

  const getField = () => {
    switch (form.getFieldValue(['templateItems', name, 'type'])) {
      case 'text':
        return null;
      case 'multiple-choice':
        return (
          <Select
            disabled={Boolean(cache) && templateManagerMode === 'update'}
            style={{ minWidth: 182 }}
            mode="tags"
          ></Select>
        );
      case 'numeric':
        return null;
      case 'date-picker':
        return null;
      default:
        return null;
    }
  };

  return (
    <Fragment>
      <Form.Item
        className={styles['column-1']}
        {...restField}
        name={[name, 'type']}
        fieldKey={[fieldKey, 'type']}
        rules={
          getValidator(
            form,
            form.getFieldValue(['templateItems', name, 'type']),
            isEdit,
          ).type
        }
      >
        {isEdit ? (
          <Select
            getPopupContainer={(triggerNode) => triggerNode.parentElement}
            options={[
              typeOptions.text,
              typeOptions['multiple-choice'],
              typeOptions.numeric,
              typeOptions['date-picker'],
            ]}
            disabled={Boolean(cache) && templateManagerMode === 'update'}
            onChange={onChange}
            style={{ width: 120 }}
          ></Select>
        ) : (
          display(
            typeOptions[form.getFieldValue(['templateItems', name, 'type'])]
              ?.label,
          )
        )}
      </Form.Item>

      <Form.Item
        className={styles['column-2']}
        {...restField}
        name={[name, 'title']}
        fieldKey={[fieldKey, 'title']}
        rules={getValidator(form, name, isEdit).title}
      >
        {isEdit ? (
          <Input
            disabled={Boolean(cache) && templateManagerMode === 'update'}
            placeholder="title"
            className={styles['input']}
          />
        ) : (
          display(form.getFieldValue(['templateItems', name, 'title']))
        )}
      </Form.Item>

      <Form.Item
        className={styles['column-3']}
        {...restField}
        fieldKey={[fieldKey, 'value']}
        name={[name, 'value']}
        rules={getValidator(form, name, isEdit).value}
      >
        {isEdit
          ? getField()
          : display(form.getFieldValue(['templateItems', name, 'value']))}
      </Form.Item>

      <Form.Item
        className={styles['column-4']}
        {...restField}
        fieldKey={[fieldKey, 'optional']}
        name={[name, 'optional']}
        valuePropName="checked"
      >
        <Checkbox className={styles['checkbox']} disabled={!isEdit}></Checkbox>
      </Form.Item>
      <Form.Item className={`${styles['column-5']} ${styles['action']}`}>
        {isEdit ? (
          <Space size="middle">
            <CheckOutlined
              className={styles['confirm-icon']}
              onClick={onConfirm}
            />
            <CloseOutlined
              className={styles['close-icon']}
              onClick={() => {
                if (!cache) {
                  remove(name);
                } else {
                  form.setFields([
                    { name: ['templateItems', name], value: cache },
                  ]);
                }
                setIsEdit(false);
              }}
            />
          </Space>
        ) : (
          <Space size="middle">
            <DeleteOutlined onClick={() => remove(name)} />
            <EditOutlined onClick={() => setIsEdit(true)} />
          </Space>
        )}
      </Form.Item>
    </Fragment>
  );
}
