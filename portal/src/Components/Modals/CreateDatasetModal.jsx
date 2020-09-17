import React, { useState } from 'react';
import { connect } from 'react-redux';
import {
  Modal,
  Form,
  Select,
  Input,
  Button,
  message,
  Tooltip,
  Checkbox,
} from 'antd';
import DynamicKeyValue from '../Form/DynamicKeyValue';
import { createProjectAPI } from '../../APIs/index';
import {
  UpdateDatasetCreator,
  setContainersPermissionCreator,
} from '../../Redux/actions';
import { namespace, ErrorMessager } from '../../ErrorMessages';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { getCookie } from '../../Utility';

function CreateDatasetModal({
  visible,
  cancel,
  tags,
  userList,
  UpdateDatasetCreator,
  setContainersPermissionCreator,
  containersPermission,
}) {
  const [form] = Form.useForm();
  const onFinish = () => {};
  const [submitting, toggleSubmitting] = useState(false);
  const username = getCookie('username');

  const handleChange = (value) => {
    console.log(`selected ${value}`);
  };

  const submitForm = () => {
    form
      .validateFields()
      .then((values) => {
        const metadatas = {};
        values.metadatas &&
          values.metadatas.forEach(({ key, value }) => {
            metadatas[key] = value;
          });

        createProjectAPI({
          dataset_name: values.name,
          code: values.code,
          tags: values.tags,
          discoverable: values.discoverable,
          admin: [username],
          type: 'Usecase',
          metadatas,
          description: values.description,
        })
          .then((res) => {
            UpdateDatasetCreator(res.data.result, 'All Projects');
            toggleSubmitting(false);
            const newContainer = res.data.result.find(
              (item) => item.code === values.code,
            );
            setContainersPermissionCreator([
              ...containersPermission,
              {
                container_id: newContainer.id,
                container_name: values.name,
                permission: 'admin',
              },
            ]);
            cancel();
            form.resetFields();
            message.success('Project created successfully.');
          })
          .catch((err) => {
            console.log(err);
            toggleSubmitting(false);
            //message.error(err);
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
        console.log('Validate Failed:', info);
      });
  };
  return (
    <Modal
      title="Create Project"
      visible={visible}
      onCancel={() => {
        cancel();
        form.resetFields();
      }}
      footer={[
        <Button
          key="back"
          onClick={() => {
            cancel();
            form.resetFields();
          }}
        >
          Cancel
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={submitting}
          onClick={submitForm}
        >
          Submit
        </Button>,
      ]}
    >
      <Form
        form={form}
        name="create_dataset"
        onFinish={onFinish}
        style={{ padding: '20px 0 50px' }}
        layout="vertical"
        initialValues={{ discoverable: true }}
      >
        <Form.Item
          label={
            <span>
              Project Code&nbsp;
              <Tooltip
                title="Project code should only contains lowercase letters, numbers and within 32
            digits."
              >
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
                message: 'Please input project code.',
              },
              {
                pattern: new RegExp(/^[a-z0-9]{1,32}$/g), // Format BXT-1234
                message:
                  'Project code should only contains lowercase letters and numbers and within 32 digits.',
              },
            ]}
          >
            <Input />
          </Form.Item>
        </Form.Item>

        <Form.Item
          label="Project Name"
          name="name"
          rules={[
            {
              required: true,
              message: 'Please input project name.',
            },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item label={'Description'} name="description">
          <Input.TextArea></Input.TextArea>
        </Form.Item>
        <Form.Item name="tags" label={'Tags'}>
          <Select
            mode="tags"
            style={{ width: '100%' }}
            placeholder="tags"
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
        {/* <div style={{ paddingBottom: '5px' }}>Metadata (Optional):</div>
        <DynamicKeyValue name="metadatas" label={'metadatas'} /> */}
        {/* <Form.Item name="admin" label={'Admins'}>
          <Select mode="tags" style={{ width: '100%' }} placeholder="admins">
            {userList &&
              userList.map((item) => {
                return (
                  <Select.Option value={item.name}>{item.name}</Select.Option>
                );
              })}
          </Select>
        </Form.Item> */}
      </Form>
    </Modal>
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
