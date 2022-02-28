import React, { useState, useEffect } from 'react';
import { Form, Skeleton, Input, message } from 'antd';
import styles from './DatasetHomeDescription.module.scss';
import { DatasetCard as Card } from '../../Components/DatasetCard/DatasetCard';
import { validators } from '../../../DatasetLandingPage/Components/CreateDatasetPanel/createDatasetValidators';
import { useSelector, useDispatch } from 'react-redux';

export default function DatasetHomeDescription(props) {
  const [form] = Form.useForm();
  const {
    loading,
    hasInit,
    basicInfo: { geid, description },
  } = useSelector((state) => state.datasetInfo);
  useEffect(() => {
    if (hasInit) {
      form.setFieldsValue({ description });
    }
  }, [hasInit, geid]);

  return (
    <Card title="Description">
      {' '}
      <Skeleton loading={loading}>
        <Form className={styles['form']} form={form}>
          <Form.Item rules={validators.description} name="description">
            <div className={styles['description-paragraph']}>
              {description?.split('\n').map((item) => (
                <>
                  {item}
                  <br></br>
                </>
              ))}
            </div>
          </Form.Item>
        </Form>
      </Skeleton>
    </Card>
  );
}
