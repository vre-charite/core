import React, { useState, useEffect } from 'react';
import { Form, Input, Select, Skeleton, message } from 'antd';
import styles from './DatasetHomeInfo.module.scss';
import { CardExtra } from '../Components/CardExtra/CardExtra';
import { DatasetCard as Card } from '../../Components/DatasetCard/DatasetCard';
import { modalityOptions } from '../../../DatasetLandingPage/Components/CreateDatasetPanel/selectOptions';
import { validators } from '../../../DatasetLandingPage/Components/CreateDatasetPanel/createDatasetValidators';
import { useSelector, useDispatch } from 'react-redux';
import { extractValues, generateSubmitData } from '../valueMapping';
import { updateDatasetInfo } from '../../../../APIs';
import { datasetInfoCreators } from '../../../../Redux/actions';
import { useTranslation } from 'react-i18next';

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

const typeOptions = ['BIDS', 'GENERAL'];

const CollectionMethodLabel = () => (
  <>
    <span>
      Collection<br></br>Method
    </span>{' '}
  </>
);

export default function DatasetHomeInfo(props) {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const [editMode, setEditMode] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const {
    loading,
    hasInit,
    basicInfo,
    basicInfo: { geid },
  } = useSelector((state) => state.datasetInfo);
  const values = extractValues(basicInfo);
  const { t } = useTranslation(['errormessages']);
  useEffect(() => {
    if (hasInit) {
      form.setFieldsValue(values);
    }
  }, [hasInit, geid]);

  const onClickEditButton = () => {
    setEditMode(true);
  };

  const onCancel = () => {
    setEditMode(false);
    form.setFieldsValue(values);
  };

  const onClickSubmit = async () => {
    setSubmitting(true);
    try {
      const newValues = await form.validateFields();
      const submitData = generateSubmitData(basicInfo, newValues);
      const res = await updateDatasetInfo(geid, submitData);
      dispatch(datasetInfoCreators.setBasicInfo(res.data.result));
      setEditMode(false);
    } catch (error) {
      if (error.message) {
        message.error(t('errormessages:updateDatasetInfo.default.0'));
      }
    } finally {
      setSubmitting(false);
    }
  };

  const extraProps = {
    editMode,
    onCancel,
    submitting,
    onClickSubmit,
    onClickEditButton,
  };

  return (
    <Card title="Dataset Information" extra={<CardExtra {...extraProps} />}>
      <Skeleton loading={loading}>
        <Form
          colon={false}
          className={styles['form']}
          {...formItemLayout}
          form={form}
        >
          <Form.Item rules={validators.title} label="Title" name="title">
            {editMode ? (
              <Input placeholder="please input title"></Input>
            ) : (
              <span className={styles['property-value']}>
                {values?.title || 'N/A'}
              </span>
            )}
          </Form.Item>

          <Form.Item rules={validators.authors} label="Authors" name="authors">
            {editMode ? (
              <Select placeholder="Enter authors" mode="tags" />
            ) : (
              <span className={styles['property-value']}>
                {values?.authors ? values?.authors?.join(', ') : 'N/A'}
              </span>
            )}
          </Form.Item>

          <Form.Item label="Type" name="type">
            {editMode ? (
              <Select disabled>
                {typeOptions.map((item) => (
                  <Option value={item}>{item}</Option>
                ))}
              </Select>
            ) : (
              <span className={styles['property-value']}>
                {values?.type || 'N/A'}
              </span>
            )}
          </Form.Item>

          <Form.Item
            rules={validators.modality}
            label="Modality"
            name="modality"
          >
            {editMode ? (
              <Select
                allowClear
                mode="multiple"
                placeholder="please select modality"
              >
                {modalityOptions.map((modalityOption) => (
                  <Option key={modalityOption} value={modalityOption}>
                    {modalityOption}
                  </Option>
                ))}
              </Select>
            ) : (
              <span className={styles['property-value']}>
                {values?.modality?.length
                  ? values?.modality?.join(', ')
                  : 'N/A'}
              </span>
            )}
          </Form.Item>

          <Form.Item
            rules={validators.collectionMethod}
            label={<CollectionMethodLabel />}
            name="collectionMethod"
          >
            {editMode ? (
              <Select
                className={styles['select']}
                placeholder="Enter Collection Method"
                mode="tags"
                allowClear
              ></Select>
            ) : (
              <span className={styles['property-value']}>
                {values?.collectionMethod?.length
                  ? values?.collectionMethod?.join(', ')
                  : 'N/A'}
              </span>
            )}
          </Form.Item>

          <Form.Item rules={validators.license} label="License" name="license">
            {editMode ? (
              <Input
                className={styles['input']}
                placeholder="Enter License"
              ></Input>
            ) : (
              <span className={styles['property-value']}>
                {values?.license || 'N/A'}
              </span>
            )}
          </Form.Item>
        </Form>
      </Skeleton>
    </Card>
  );
}
