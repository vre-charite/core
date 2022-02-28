import { Form, Space, Input, Button, Select } from 'antd';
import React, { useState, useEffect } from 'react';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import SchemaItem from '../SchemaItem/SchemaItem';
import styles from './SchemaFormInternal.module.scss';
import { validators } from './validators';
import {useSelector} from 'react-redux'
export default function SchemaFormInternal(props) {
  const { form, templateManagerMode } = props;
  const {schemaTPLs} = useSelector(state=>state.schemaTemplatesInfo);
  return (
    <>
      <Form.Item
        rules={validators.templateName(schemaTPLs)}
        className={`${styles['a-row']} ${styles['template-name']}`}
        label={
          <>
            <span>Template Name</span>{' '}
            <span className={styles['required-mark']}>*</span>
          </>
        }
        name="templateName"
        colon={false}
      >
        <Input className={styles['input']}></Input>
      </Form.Item>
      <>
        <Form.Item className={`${styles['column-1']} ${styles['header']}`}>
          Type
        </Form.Item>
        <Form.Item className={`${styles['column-2']} ${styles['header']}`}>
          Title
        </Form.Item>
        <Form.Item className={`${styles['column-3']} ${styles['header']}`}>
          Value
        </Form.Item>
        <Form.Item className={`${styles['column-4']} ${styles['header']}`}>
          Optional
        </Form.Item>
        <Form.Item className={`${styles['column-5']} ${styles['header']}`}>
          
        </Form.Item>
      </>

      <Form.List name="templateItems">
        {(fields, { add, remove }) => (
          <>
            {fields.map((field) => (
              <SchemaItem
                templateManagerMode={templateManagerMode}
                key={field.key}
                remove={remove}
                field={field}
                form={form}
              />
            ))}
            <Form.Item
              className={`${styles['a-row']} ${styles['submit-form-item']}`}
            >
              <Button
                type="primary"
                onClick={() => add()}
                icon={<PlusOutlined />}
                className={styles['button']}
              >
                Add field
              </Button>
            </Form.Item>
          </>
        )}
      </Form.List>
    </>
  );
}
