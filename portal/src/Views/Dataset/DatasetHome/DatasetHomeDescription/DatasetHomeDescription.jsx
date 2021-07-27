import React, { useState, useEffect } from 'react';
import { Form, Skeleton, Input, message } from 'antd';
import styles from './DatasetHomeDescription.module.scss';
import { CardExtra } from '../Components/CardExtra/CardExtra';
import { DatasetCard as Card } from '../../Components/DatasetCard/DatasetCard';
import { validators } from '../../../DatasetLandingPage/Components/CreateDatasetPanel/createDatasetValidators';
import { datasetInfoCreators } from '../../../../Redux/actions';
import { useSelector, useDispatch } from 'react-redux';
import { generateSubmitData } from '../valueMapping';
import { updateDatasetInfo } from '../../../../APIs';
import { useTranslation } from 'react-i18next';
const { TextArea } = Input;

export default function DatasetHomeDescription(props) {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const [editMode, setEditMode] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const {
    loading,
    hasInit,
    basicInfo: { geid, description },
  } = useSelector((state) => state.datasetInfo);
  const { t } = useTranslation(['errormessages']);
  useEffect(() => {
    if (hasInit) {
      form.setFieldsValue({ description });
    }
  }, [hasInit, geid]);

  const onClickEditButton = () => {
    setEditMode(true);
  };

  const onCancel = () => {
    setEditMode(false);
    form.setFieldsValue({ description });
  };

  const onClickSubmit = async () => {
    setSubmitting(true);
    try {
      const values = await form.validateFields();
      const submitData = generateSubmitData({ description }, values, [
        'description',
      ]);

      const res = await updateDatasetInfo(geid, submitData);
      dispatch(datasetInfoCreators.setBasicInfo(res.data.result));
      setEditMode(false);
    } catch (error) {
      if(error.message){
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
    <Card title="Description" extra={<CardExtra {...extraProps} />}>
      {' '}
      <Skeleton loading={loading}>
        <Form className={styles['form']} form={form}>
          <Form.Item rules={validators.description} name="description">
            {editMode ? (
              <TextArea />
            ) : (
              <div className={styles['description-paragraph']}>
                {description?.split('\n').map((item) => (
                  <>
                    {item}
                    <br></br>
                  </>
                ))}
              </div>
            )}
          </Form.Item>
        </Form>
      </Skeleton>
    </Card>
  );
}
