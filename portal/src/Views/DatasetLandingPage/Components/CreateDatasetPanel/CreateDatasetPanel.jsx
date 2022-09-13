// Copyright 2022 Indoc Research
// 
// Licensed under the EUPL, Version 1.2 or – as soon they
// will be approved by the European Commission - subsequent
// versions of the EUPL (the "Licence");
// You may not use this work except in compliance with the
// Licence.
// You may obtain a copy of the Licence at:
// 
// https://joinup.ec.europa.eu/collection/eupl/eupl-text-eupl-12
// 
// Unless required by applicable law or agreed to in
// writing, software distributed under the Licence is
// distributed on an "AS IS" basis,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
// express or implied.
// See the Licence for the specific language governing
// permissions and limitations under the Licence.
// 

import React, { useState } from 'react';
import {
  Form,
  Card,
  Input,
  Select,
  Button,
  Space,
  Row,
  Col,
  message,
  Tooltip,
} from 'antd';
import { useSelector } from 'react-redux';
import styles from './CreateDatasetPanel.module.scss';
import { createDatasetApi } from '../../../../APIs';
import { validators } from './createDatasetValidators';
import { modalityOptions } from './selectOptions';
import { fetchMyDatasets } from '../../Components/MyDatasetList/fetchMyDatasets';
import { useTranslation } from 'react-i18next';
import { useQueryParams } from '../../../../Utility';
import { FileAddOutlined, InfoCircleOutlined } from '@ant-design/icons';
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
        type,
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
      console.log(error);
      if (error.hasOwnProperty('errorFields')) return; // for antd form validation error

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
    <div className={styles['card']}>
      <Card>
        <Form form={form} colon={false} {...layout} className={styles['form']}>
          <h2>Define Dataset</h2>
          <Form.Item
            rules={validators.title}
            name="title"
            label={
              <>
                Title{' '}
                <div className={styles['tooltip']}>
                  <Tooltip
                    title={
                      'Name of the Dataset. Maximum length 100 characters.'
                    }
                  >
                    <InfoCircleOutlined />
                  </Tooltip>{' '}
                </div>
              </>
            }
            required
          >
            <Input
              className={styles['input']}
              placeholder="Enter title"
            ></Input>
          </Form.Item>
          <Row>
            {' '}
            <Col span={12}>
              <Form.Item
                required
                labelCol={{ xs: 20, sm: 8, lg: 8, xl: 6 }}
                name="code"
                rules={validators.datasetCode}
                label={
                  <>
                    Dataset Code
                    <div className={styles['tooltip']}>
                      <Tooltip
                        title={
                          'Platform-wise Dataset unique ID. 3-32 lower case numbers or letters with no white space.'
                        }
                      >
                        <InfoCircleOutlined />
                      </Tooltip>
                    </div>
                  </>
                }
              >
                <Input className={styles['input']}></Input>
              </Form.Item>
            </Col>{' '}
            <Col span={12}>
              <Form.Item
                labelCol={{ xs: 20, sm: 8, lg: 8, xl: 4 }}
                name="authors"
                required
                rules={validators.authors}
                allowClear
                label={
                  <>
                    Authors
                    <div className={styles['tooltip']}>
                      <Tooltip
                        title={
                          'One or several authors of the Dataset. 10 maximum authors, each author maximum length 50 characters.'
                        }
                      >
                        <InfoCircleOutlined />
                      </Tooltip>
                    </div>
                  </>
                }
              >
                <Select placeholder="Enter authors" mode="tags" />
              </Form.Item>
            </Col>{' '}
          </Row>

          <Form.Item
            valuePropName="checked"
            name="type"
            label={
              <>
                Dataset Type{' '}
                <div className={styles['tooltip']}>
                  <Tooltip
                    title={
                      'Terms to describe the nature of the Dataset. "GENERAL" is default type.'
                    }
                  >
                    <InfoCircleOutlined />
                  </Tooltip>
                </div>
              </>
            }
          >
            <Select defaultValue="GENERAL">
              <Select.Option value="GENERAL">GENERAL</Select.Option>
              <Select.Option value="BIDS">BIDS</Select.Option>
            </Select>
          </Form.Item>

          <div className={styles['spacing']}></div>

          <h2>Description</h2>
          <Form.Item
            className={styles.description_form_item}
            rules={validators.description}
            name="description"
            label={
              <>
                <p>Dataset Description</p>
                <div className={styles['tooltip']}>
                  <Tooltip
                    title={
                      'A textual narrative statement describing the Dataset. Maximum length 5000 characters.'
                    }
                  >
                    <InfoCircleOutlined />
                  </Tooltip>
                </div>
              </>
            }
            required
          >
            <Input.TextArea
              className={styles['input']}
              placeholder="Enter description"
            ></Input.TextArea>
          </Form.Item>
          <Form.Item
            rules={validators.modality}
            name="modality"
            label={
              <>
                Modality
                <div className={styles['tooltip']}>
                  <Tooltip
                    title={
                      'One or several modalities of the Dataset. Multiple-choice from drop-down list.'
                    }
                  >
                    <InfoCircleOutlined />
                  </Tooltip>
                </div>
              </>
            }
          >
            <Select
              mode="multiple"
              className={styles['select']}
              placeholder="Select Modality"
              allowClear
            >
              {modalityOptions.sort().map((value) => (
                <Option key={value} value={value}>
                  {value}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            className={styles['collection-method']}
            name="collectionMethod"
            rules={validators.collectionMethod}
            label={
              <>
                <CollectionMethodLabel />
                <div className={styles['tooltip']}>
                  <Tooltip
                    title={
                      'One or several collection methods of the Dataset. 10 maximum methods, each method maximum length 20 characters.'
                    }
                  >
                    <InfoCircleOutlined />
                  </Tooltip>
                </div>
              </>
            }
          >
            <Select
              className={styles['select']}
              placeholder="Enter Collection Method"
              mode="tags"
              allowClear
            ></Select>
          </Form.Item>
          <Form.Item
            rules={validators.license}
            name="license"
            label={
              <>
                License
                <div className={styles['tooltip']}>
                  <Tooltip
                    title={
                      <p>
                        The license under which this dataset is shared. The use
                        of license name abbreviations is suggested for
                        specifying a license. Please visit
                        <a
                          style={{ margin: '0px 5px' }}
                          href="https://creativecommons.org/share-your-work/"
                        >
                          Creative Commons
                        </a>
                        to choose the right license. Maximum length 20
                        characters.
                      </p>
                    }
                  >
                    <InfoCircleOutlined />
                  </Tooltip>
                </div>
              </>
            }
          >
            <Input
              className={styles['input']}
              placeholder="Enter License"
            ></Input>
          </Form.Item>

          <Form.Item
            rules={validators.tags}
            name="tags"
            label={
              <>
                Tags
                <div className={styles['tooltip']}>
                  <Tooltip
                    title={
                      'Tags associated with the Dataset, which will help in its discovery. These should be well known terms by the research community. 10 maximum tags, each tag maximum length 20 characters with no white space. '
                    }
                  >
                    <InfoCircleOutlined />
                  </Tooltip>
                </div>
              </>
            }
          >
            <Select placeholder="Enter tag" mode="tags"></Select>
          </Form.Item>
        </Form>

        <div className={styles['button-group']}>
          <Space>
            <Button
              icon={<FileAddOutlined />}
              loading={submitting}
              onClick={onSubmit}
              type="primary"
            >
              Create
            </Button>
            <Button disabled={submitting} onClick={onCancel} type="link">
              {' '}
              Cancel
            </Button>
          </Space>
        </div>
      </Card>
    </div>
  );
}
