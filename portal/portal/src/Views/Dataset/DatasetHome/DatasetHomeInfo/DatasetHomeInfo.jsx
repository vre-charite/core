import React, { useState, useEffect } from 'react';
import { Form, Input, Select, Skeleton, message } from 'antd';
import styles from './DatasetHomeInfo.module.scss';
import { DatasetCard as Card } from '../../Components/DatasetCard/DatasetCard';
import { modalityOptions } from '../../../DatasetLandingPage/Components/CreateDatasetPanel/selectOptions';
import { validators } from '../../../DatasetLandingPage/Components/CreateDatasetPanel/createDatasetValidators';
import { useSelector, useDispatch } from 'react-redux';
import { extractValues, generateSubmitData } from '../valueMapping';
const { Option } = Select;

const formItemLayout = {
  labelCol: {
    xs: 24,
    sm: 8,
    md: 8,
    lg: 7,
    xl: 5,
    xxl: 4,
  },
};

const CollectionMethodLabel = () => (
  <>
    <span>
      Collection<br></br>Method
    </span>{' '}
  </>
);

export default function DatasetHomeInfo(props) {
  const [form] = Form.useForm();
  const {
    loading,
    hasInit,
    basicInfo,
    basicInfo: { geid },
  } = useSelector((state) => state.datasetInfo);
  const values = extractValues(basicInfo);
  useEffect(() => {
    if (hasInit) {
      form.setFieldsValue(values);
    }
  }, [hasInit, geid]);

  return (
    <Card title="Dataset Information">
      <Skeleton loading={loading}>
        <Form
          colon={false}
          className={styles['form']}
          {...formItemLayout}
          form={form}
        >
          <Form.Item rules={validators.title} label="Title" name="title">
            <span className={styles['property-value']}>
              {values?.title || 'N/A'}
            </span>
          </Form.Item>

          <Form.Item rules={validators.authors} label="Authors" name="authors">
            <span className={styles['property-value']}>
              {values?.authors ? values?.authors?.join(', ') : 'N/A'}
            </span>
          </Form.Item>

          <Form.Item label="Type" name="type">
            <span className={styles['property-value']}>
              {values?.type || 'N/A'}
            </span>
          </Form.Item>

          <Form.Item
            rules={validators.modality}
            label="Modality"
            name="modality"
          >
            <span className={styles['property-value']}>
              {values?.modality?.length ? values?.modality?.join(', ') : 'N/A'}
            </span>
          </Form.Item>

          <Form.Item
            rules={validators.collectionMethod}
            label={<CollectionMethodLabel />}
            name="collectionMethod"
          >
            <span className={styles['property-value']}>
              {values?.collectionMethod?.length
                ? values?.collectionMethod?.join(', ')
                : 'N/A'}
            </span>
          </Form.Item>

          <Form.Item rules={validators.license} label="License" name="license">
            <span className={styles['property-value']}>
              {values?.license || 'N/A'}
            </span>
          </Form.Item>
        </Form>
      </Skeleton>
    </Card>
  );
}
