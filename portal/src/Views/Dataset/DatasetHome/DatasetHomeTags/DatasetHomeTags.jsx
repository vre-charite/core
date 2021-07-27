import React, { useEffect, useState } from 'react';
import { Skeleton, Form, Tag, message } from 'antd';
import { CardExtra } from '../Components/CardExtra/CardExtra';
import { TagsInput } from '../Components/TagsInput/TagsInput';
import { DatasetCard as Card } from '../../Components/DatasetCard/DatasetCard';
import { validators } from '../../../DatasetLandingPage/Components/CreateDatasetPanel/createDatasetValidators';
import { datasetInfoCreators } from '../../../../Redux/actions';
import { useSelector, useDispatch } from 'react-redux';
import { generateSubmitData } from '../valueMapping';
import { updateDatasetInfo } from '../../../../APIs';
import { useTranslation } from 'react-i18next';

export default function DatasetHomeTags(props) {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const [editMode, setEditMode] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const {
    loading,
    hasInit,
    basicInfo: { geid, tags },
  } = useSelector((state) => state.datasetInfo);
  const { t } = useTranslation(['errormessages']);
  
  useEffect(() => {
    if (hasInit) {
      form.setFieldsValue({ tags });
    }
  }, [hasInit, geid]);

  const onClickEditButton = () => {
    setEditMode(true);
  };

  const onCancel = () => {
    setEditMode(false);
    form.setFieldsValue({ tags });
  };

  const onClickSubmit = async () => {
    setSubmitting(true);
    try {
      const values = await form.validateFields();
      const submitData = generateSubmitData({ tags }, values, ['tags']);
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
    <Card title="Tags" extra={<CardExtra {...extraProps} />}>
      <Skeleton loading={loading}>
        {' '}
        <Form form={form}>
          <Form.Item rules={validators.tags} name="tags">
            {editMode ? <TagsInput /> : tags?.map((tag) => <Tag>{tag}</Tag>)}
          </Form.Item>
        </Form>
      </Skeleton>
    </Card>
  );
}
