import React, { useState } from 'react';
import { connect,useSelector } from 'react-redux';
import {
  Form,
  Select,
  Input,
  message,
  Tooltip,
  Checkbox,
  Row,
  Col,
} from 'antd';
import { createProjectAPI } from '../../APIs/index';
import {
  UpdateDatasetCreator,
  setContainersPermissionCreator,
} from '../../Redux/actions';
import { namespace, ErrorMessager } from '../../ErrorMessages';
import { QuestionCircleOutlined } from '@ant-design/icons';
import AsyncFormModal from './AsyncFormModal';

function CreateDatasetModal({
  visible,
  cancel,
  tags,
  UpdateDatasetCreator,
  setContainersPermissionCreator,
  containersPermission,
}) {
  const {username} = useSelector(state=>state);
  const cancelAxios = {cancelFunction:()=>{}};
  const [form] = Form.useForm();
  const onFinish = () => {};
  const [submitting, toggleSubmitting] = useState(false);

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

        createProjectAPI(
          {
            dataset_name: values.name,
            code: values.code,
            tags: values.tags,
            discoverable: values.discoverable,
            roles: values.roles,
            admin: [username],
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
                containerId: newContainer.id,
                containerName: values.name,
                permission: 'admin',
                code: values.code,
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
    <AsyncFormModal
      form={form}
      cancelAxios={cancelAxios}
      title="Create Project"
      visible={visible}
      onCancel={cancel}
      onOk={submitForm}
      confirmLoading={submitting}
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
          label="Roles"
          name="roles"
          initialValue={['admin']}
          required
          style={{ marginBottom: '5px' }}
        >
          <Checkbox.Group style={{ width: '100%' }}>
            <Row>
              <Col span={8}>
                <Checkbox value="admin" checked disabled>
                  Admin&nbsp;
                  <Tooltip
                    title="Project Admin is able to add user into project as any roles in current project, 
                  upload data into Green Room, view/download all data in Green Room."
                  >
                    <QuestionCircleOutlined />
                  </Tooltip>
                </Checkbox>
              </Col>
              {/* <Col span={8}>
                <Checkbox value="member">
                  Member&nbsp;
                  <Tooltip
                    title="Project member is able to upload data into Green Room, 
                  view/download data only being uploaded by self in Green Room."
                  >
                    <QuestionCircleOutlined />
                  </Tooltip>
                </Checkbox>
              </Col> */}
              <Col span={8}>
                <Checkbox value="uploader">
                  Uploader&nbsp;
                  <Tooltip
                    title="Project uploader is able to upload data into Green Room, 
                  view/download data only being uploaded by self in Green Room"
                  >
                    <QuestionCircleOutlined />
                  </Tooltip>
                </Checkbox>
              </Col>
            </Row>
          </Checkbox.Group>
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
