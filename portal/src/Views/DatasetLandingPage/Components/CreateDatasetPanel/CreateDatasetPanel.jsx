import React, { useState } from 'react';
import {
  Form,
  Card,
  Input,
  Checkbox,
  Select,
  Button,
  Space,
  Row,
  Col,
  message,
} from 'antd';
import { useSelector } from 'react-redux';
import styles from './CreateDatasetPanel.module.scss';
import { createDatasetApi } from '../../../../APIs';
import { validators } from './createDatasetValidators';
import { modalityOptions } from './selectOptions';
import { fetchMyDatasets } from '../../Components/MyDatasetList/fetchMyDatasets';
import { useTranslation } from 'react-i18next';
import { useQueryParams } from '../../../../Utility';

const { Option } = Select;

const layout = {
  labelCol: { xs: 4, md: 4, lg: 4, xl: 3 },
};

export default function CreateDatasetPanel(props) {
  const { ACTIONS, action, setAction } = props;
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const { username } = useSelector((state) => state);
  const { t } = useTranslation(['errormessages']);
  const { page = 1, pageSize = 10 } = useQueryParams(['pageSize', 'page']);

  const onCancel = () => {
    setAction(ACTIONS.default);
  };

  const onSubmit = async () => {
    setSubmitting(true);
    try {
      const values = await form.validateFields();
      const {
        title,
        code,
        authors,
        type,
        modality,
        collectionMethod,
        license,
        tags,
        description,
      } = values;

      const res = await createDatasetApi(
        username,
        title,
        code,
        authors,
        type?'BIDS':"GENERAL",
        modality,
        collectionMethod,
        license,
        tags,
        description,
      );
      setAction(ACTIONS.default);
      message.success(t('success:createDataset'));
      fetchMyDatasets(username, parseInt(page), parseInt(pageSize));
    } catch (error) {
      if (error.response?.status === 409) {
        message.error(t('errormessages:createDataset.409.0'));
      } else {
        message.error(t('errormessages:createDataset.default.0'));
      }
    } finally {
      setSubmitting(false);
    }
  };

  const CollectionMethodLabel = () => (
    <>
      <span>
        Collection<br></br>Method
      </span>{' '}
    </>
  );

  return (
    <Card className={styles['card']}>
      <Form form={form} colon={false} {...layout} className={styles['form']}>
        <h2>Define Dataset</h2>
        <Form.Item rules={validators.title} name="title" label="Title" required>
          <Input className={styles['input']} placeholder="Enter title"></Input>
        </Form.Item>
        <Row>
          {' '}
          <Col span={12}>
            <Form.Item
              required
              labelCol={{ xs: 20, sm: 8, lg: 8, xl: 6 }}
              name="code"
              label="Dataset Code"
              rules={validators.datasetCode}
            >
              <Input className={styles['input']}></Input>
            </Form.Item>
          </Col>{' '}
          <Col span={12}>
            <Form.Item
              labelCol={{ xs: 20, sm: 8, lg: 8, xl: 4 }}
              name="authors"
              label="Authors"
              required
              rules={validators.authors}
              allowClear
            >
              <Select placeholder="Input authors" mode="tags" />
            </Form.Item>
          </Col>{' '}
        </Row>

        <Form.Item valuePropName="checked" name="type" label="Type">
          <Checkbox value="BIDS">BIDS</Checkbox>
        </Form.Item>

        <div className={styles['spacing']}></div>

        <h2>Description</h2>
        <Form.Item
          rules={validators.description}
          name="description"
          label="Description"
          required
        >
          <Input.TextArea
            className={styles['input']}
            placeholder="Enter description"
          ></Input.TextArea>
        </Form.Item>
        <Form.Item rules={validators.modality} name="modality" label="Modality">
          <Select
            mode="multiple"
            className={styles['select']}
            placeholder="Enter Modality"
            allowClear
          >
            {modalityOptions.map((value) => (
              <Option key={value} value={value}>
                {value}
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item
          className={styles['collection-method']}
          name="collectionMethod"
          label={<CollectionMethodLabel />}
          rules={validators.collectionMethod}
        >
          <Select
            className={styles['select']}
            placeholder="Input Collection Method"
            mode="tags"
            allowClear
          ></Select>
        </Form.Item>
        <Form.Item rules={validators.license} name="license" label="License">
          <Input
            className={styles['input']}
            placeholder="Enter License"
          ></Input>
        </Form.Item>

        <div className={styles['spacing']}></div>

        <h2>Tags</h2>
        <Form.Item rules={validators.tags} name="tags" label="Tags">
          <Select placeholder="Enter tag" mode="tags"></Select>
        </Form.Item>
      </Form>

      <div className={styles['button-group']}>
        <Space>
          <Button disabled={submitting} onClick={onCancel} type="link">
            {' '}
            Cancel
          </Button>
          <Button loading={submitting} onClick={onSubmit} type="primary">
            Create
          </Button>
        </Space>
      </div>
    </Card>
  );
}
