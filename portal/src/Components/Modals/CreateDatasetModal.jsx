import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import {
  Form,
  Select,
  Input,
  message,
  Tooltip,
  Checkbox,
} from 'antd';
import { createProjectAPI } from '../../APIs/index';
import {
  UpdateDatasetCreator,
  setContainersPermissionCreator,
} from '../../Redux/actions';
import { namespace, ErrorMessager } from '../../ErrorMessages';
import { QuestionCircleOutlined } from '@ant-design/icons';
import AsyncFormModal from './AsyncFormModal';
import { useTranslation } from 'react-i18next';
import { trimString } from '../../Utility';
import _ from 'lodash';
import { getDatasetByCode } from '../../APIs';
function CreateDatasetModal({
  visible,
  cancel,
  tags,
  UpdateDatasetCreator,
  setContainersPermissionCreator,
  containersPermission,
}) {

  const cancelAxios = { cancelFunction: () => {} };
  const [form] = Form.useForm();
  const onFinish = () => {};
  const [submitting, toggleSubmitting] = useState(false);
  const [description, setDescription] = useState('');
  const { t } = useTranslation([
    'tooltips',
    'success',
    'formErrorMessages',
  ]);

  useEffect(() => {}, [description]);

  const handleChange = (value) => {
    console.log(value);
  };

  const onDescriptionChange = (e) => {
    setDescription(e.target.value);
    form.setFieldsValue({ description: e.target.value });
  };

  const submitForm = () => {
    form
      .validateFields()
      .then((values) => {
        toggleSubmitting(true);

        let isTagHasSpace = false;

        isTagHasSpace =
          values.tags && values.tags.some((el) => el.indexOf(' ') >= 0);

        if (isTagHasSpace) {
          message.error(t('formErrorMessages:createProject.tag.space'))
          toggleSubmitting(false);
          return;
        }

        const metadatas = {};
        values.metadatas &&
          values.metadatas.forEach(({ key, value }) => {
            metadatas[key] = value;
          });

        if (values.description)
          values.description = trimString(values.description);

        createProjectAPI(
          {
            dataset_name: _.trimStart(values.name),
            code: values.code,
            tags: values.tags,
            discoverable: values.discoverable,
            // roles: values.roles,
            // admin: [username],
            type: 'Usecase',
            metadatas,
            description: values.description,
          },
          cancelAxios,
        )
          .then((res) => {
            UpdateDatasetCreator(res.data.result, 'All Projects');
            toggleSubmitting(false);
            const newContainer = res.data.result.find(
              (item) => item.code === values.code,
            );
            setContainersPermissionCreator([
              ...containersPermission,
              {
                id: newContainer.id,
                name: values.name,
                permission: 'admin',
                code: values.code,
              },
            ]);
            cancel();
            form.resetFields();
            message.success(t('success:createProject'));
          })
          .catch((err) => {
            toggleSubmitting(false);
            const errorMessage = new ErrorMessager(
              namespace.landing.createProject,
            );
            if (err.response) {
              errorMessage.triggerMsg(err.response.status, null, {
                projectName: values.name,
              });
            }
          });
      })
      .catch((info) => {
        toggleSubmitting(false);
      });
  };

  const validator = (rule, value, callback) => {
    if (rule && rule.field === 'tags') {
      const invalidTag = value && value.some((el) => el.length > 32);
      if (invalidTag) callback(t('formErrorMessages:project.tags.valid'));

      if (value && value.includes('copied-to-core'))
        callback('Tag should be different with system reserved tag.');
    }

    callback();
  };

  return (
    <AsyncFormModal
      form={form}
      cancelAxios={cancelAxios}
      title="Create Project"
      visible={visible}
      onCancel={cancel}
      onOk={submitForm}
      confirmLoading={submitting}
      id={'create_project_modal'}
    >
      <Form
        form={form}
        name="create_dataset"
        onFinish={onFinish}
        layout="vertical"
        initialValues={{ discoverable: true }}
      >
        <Form.Item
          label={
            <span>
              Project Code&nbsp;
              <Tooltip title={t('create_project.project_code')}>
                <QuestionCircleOutlined />
              </Tooltip>
            </span>
          }
          required
        >
          <Form.Item
            name="code"
            style={{ marginBottom: '0px' }}
            rules={[
              {
                required: true,
                message: t('formErrorMessages:project.code.empty'),
              },
              {
                pattern: new RegExp(/^[a-z0-9]{1,32}$/g), // Format BXT-1234
                message: t('formErrorMessages:project.code.valid'),
              },
              {
                validator: async (rule, value) => {
                  try {
                    await getDatasetByCode(value);
                    return Promise.reject('The project code is taken');
                  } catch (err) {
                    if (err.response.status === 404) {
                      return Promise.resolve();
                    } else {
                      return Promise.reject('Failed to check the project code');
                    }
                  }
                },
              },
            ]}
          >
            <Input />
          </Form.Item>
        </Form.Item>

        <Form.Item
          label={
            <span>
              Project Name&nbsp;
              <Tooltip title={t('create_project.project_name')}>
                <QuestionCircleOutlined />
              </Tooltip>
            </span>
          }
          name="name"
          rules={[
            {
              required: true,
              message: t('formErrorMessages:project.name.empty'),
            },
            {
              validator: (rule, value) => {
                if (!value) return Promise.reject();

                const isLengthValid =
                  value &&
                  value.length >= 1 &&
                  value.length <= 100 &&
                  trimString(value) &&
                  trimString(value).length > 0;
                return isLengthValid
                  ? Promise.resolve()
                  : Promise.reject(t('formErrorMessages:project.name.valid'));
              },
            },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label={'Description'}
          name="description"
          rules={[
            {
              validator: (rule, value) => {
                const isLengthValid = !value || value.length <= 250;
                return isLengthValid
                  ? Promise.resolve()
                  : Promise.reject(
                      t('formErrorMessages:project.description.valid'),
                    );
              },
            },
          ]}
        >
          <Input.TextArea
            maxLength={250}
            onChange={onDescriptionChange}
          ></Input.TextArea>
          <span style={{ float: 'right' }}>{`${
            form.getFieldValue('description')
              ? form.getFieldValue('description').length
              : 0
          }/250`}</span>
        </Form.Item>
        <Form.Item
          name="tags"
          label={
            <span>
              Tags&nbsp;
              <Tooltip title={t('create_project.tags')}>
                <QuestionCircleOutlined />
              </Tooltip>
            </span>
          }
          rules={[
            {
              pattern: new RegExp(/^\S*$/), // Format BXT-1234
              message: t('formErrorMessages:project.tags.space'),
            },
            {
              validator: validator,
            },
          ]}
        >
          <Select
            getPopupContainer={() => document.getElementById('create_dataset')}
            mode="tags"
            style={{ width: '100%' }}
            placeholder="Add tags"
            onChange={handleChange}
          >
            {tags &&
              tags.map((item) => (
                <Select.Option key={item}>{item}</Select.Option>
              ))}
          </Select>
        </Form.Item>
        <Form.Item
          label="Visibility"
          name="discoverable"
          valuePropName="checked"
        >
          <Checkbox>
            Make this project discoverable by all platform users
          </Checkbox>
        </Form.Item>
      </Form>
    </AsyncFormModal>
  );
}

export default connect(
  (state) => ({
    userList: state.userList,
    tags: state.tags,
    containersPermission: state.containersPermission,
  }),
  { UpdateDatasetCreator, setContainersPermissionCreator },
)(CreateDatasetModal);
