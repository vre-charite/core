import React, { useState, Fragment } from 'react';
import { Modal, Form, Select, Radio, message, Input } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { connect } from 'react-redux';
import {
  addUserToDatasetAPI,
  checkEmailExistAPI,
  inviteUserApi,
} from '../../../../APIs';
import { apiErrorHandling, validateEmail } from '../../../../Utility';
import { namespace, ErrorMessager } from '../../../../ErrorMessages';

const { Option, OptGroup } = Select;
const { confirm } = Modal;

function AddUserModal(props) {
  const { isAddUserModalShown, cancelAddUser, containerDetails } = props;
  console.log('AddUserModal -> containerDetails', containerDetails);
  const [form] = Form.useForm();
  const [submitting, toggleSubmitting] = useState(false);

  const handleCancel = () => {
    form.resetFields();
    cancelAddUser();
  };


  /**
   * Invite user from outside
   * @param {number} projectId
   * @param {"admin"|"member"|"uploader"} role
   * @param {string} email
   */
  const confirmForOutPlatform = (projectId, role, email) => {
    const { containerName: projectName } = props.containersPermission.find(
      (item) => projectId === item.containerId,
    );

    const config = {
      title: 'Confirm',
      content: `User ${email} doesn't exist. Invite the user to the ${projectName} Project with the role of ${role}?`,
      icon: <ExclamationCircleOutlined />,
      onOk: () => {
        inviteUserApi(email, role, parseInt(projectId))
          .then((res) => {
            message.success('Invitation email sent');
            form.resetFields();
          })
          .catch((err) => {
            console.log(err);

            if (err.response) {
              const errorMessager = new ErrorMessager(
                namespace.teams.inviteUser,
              );
              errorMessager.triggerMsg(err.response.status, null, {
                email: email,
              });
            }
          });
      },
      onCancel: () => {},
    };
    confirm(config);
  };

  const onSubmit = () => {
    const values = form.getFieldsValue();

    if (values && values.email) {
      const isValidEmail = validateEmail(values.email);

      if (!isValidEmail) {
        message.error('Wrong email format');
        return;
      }

      toggleSubmitting(true);
      checkEmailExistAPI(values.email.toLowerCase(), props.datasetId)
        .then((res) => {
          toggleSubmitting(false);
          cancelAddUser();
          const username = res.data.result['username']; //User name will be returned on 200
          const role = values.role;
          const projectId = parseInt(props.datasetId);
          const {
            containerName: projectName,
          } = props.containersPermission.find(
            (item) => projectId === item.containerId,
          );
          addUserToDatasetAPI(username, projectId, role)
            .then(async (res) => {
              await props.getUsers();
              message.success(`User ${username} is added to ${projectName}`);
              form.resetFields();
            })
            .catch((err) => {
              if (err.response) {
                const errorMessager = new ErrorMessager(
                  namespace.teams.addUsertoDataSet,
                );
                errorMessager.triggerMsg(err.response.status, null, {
                  email: values.email,
                });
              }

              return Promise.reject();
            });
        })
        .catch((err) => {
          toggleSubmitting(false);
          if (err.response && err.response.status === 404) {
            cancelAddUser();
            confirmForOutPlatform(
              parseInt(props.datasetId),
              values.role,
              values.email,
            );
          } else {
            /* if (err.response) {
              
            } */
            const errorMessager = new ErrorMessager(
              namespace.teams.checkEmailExistAPI,
            );
            errorMessager.triggerMsg(
              err.response && err.response.status,
              null,
              {
                email: values.email,
              },
            );
          }
        });
    } else {
      message.error('Please input email!');
    }
  };

  return (
    <Modal
      title="Add user to project"
      visible={isAddUserModalShown}
      onOk={() => {
        onSubmit();
      }}
      confirmLoading={submitting}
      onCancel={handleCancel}
      filterOption={(input, option) =>
        option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
      }
    >
      <Form form={form}>
        <Form.Item
          label="Email"
          name="email"
          rules={[
            { type: 'email', message: 'Not a valid email' },
            { required: true, message: 'Please input email' },
          ]}
        >
          <Input type="email" />
        </Form.Item>
        <Form.Item
          initialValue={containerDetails && containerDetails['roles'][0]}
          label={'Role'}
          name="role"
          rules={[{ required: true, message: 'Please input role' }]}
        >
          <Radio.Group>
            {containerDetails &&
              containerDetails['roles'] &&
              containerDetails['roles'].map((i) => {
                if (i !== 'member') {
                  return <Radio value={i}>{i}</Radio>;
                }
              })}
          </Radio.Group>
        </Form.Item>
      </Form>
    </Modal>
  );
}

export default connect((state) => ({
  userList: state.userList,
  containersPermission: state.containersPermission,
}))(AddUserModal);
