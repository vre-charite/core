import React, { useState, Fragment } from 'react';
import { Modal, Form, Select, Radio, message, Input, Button, Tooltip } from 'antd';
import { ExclamationCircleOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { connect } from 'react-redux';
import {
  addUserToDatasetAPI,
  checkEmailExistAPI,
  inviteUserApi,
  checkUserPlatformRole,
} from '../../../../APIs';
import {
  apiErrorHandling,
  validateEmail,
  formatRole,
  convertRole,
} from '../../../../Utility';
import { namespace, ErrorMessager } from '../../../../ErrorMessages';
import { useTranslation } from 'react-i18next';

const { Option, OptGroup } = Select;
const { confirm } = Modal;

function AddUserModal(props) {
  const { isAddUserModalShown, cancelAddUser, containerDetails } = props;
  const [form] = Form.useForm();
  const [submitting, toggleSubmitting] = useState(false);
  const { t, i18n } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
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
      content: `User ${email} doesn't exist. Invite the user to the ${projectName} Project with the role of ${formatRole(
        role,
      )}?`,
      icon: <ExclamationCircleOutlined />,
      onOk: () => {
        inviteUserApi(email, role, parseInt(projectId))
          .then((res) => {
            message.success(`${t('success:addUser.invitation')}`);
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
    setIsSubmitting(true);
    if (values && values.email) {
      const isValidEmail = validateEmail(values.email);

      if (!isValidEmail) {
        message.error('Wrong email format');
        setIsSubmitting(false);
        return;
      }

      toggleSubmitting(true);
      checkUserPlatformRole(values.email.toLowerCase())
        .then((res) => {
          //block status === disabled
          if (res.status === 200) {
            if (res.data.result && res.data.result.length > 0) {
              const { role, status } = res.data.result[0];
              if (status === 'disabled') {
                message.error(
                  'This user is disabled on the platform and cannot be added to a project.',
                );
                toggleSubmitting(false);
                setIsSubmitting(false);
              } else if (role === 'admin') {
                message.error(
                  'Platform Administrator can not be invited to the project',
                );
                toggleSubmitting(false);
                setIsSubmitting(false);
              } else if (role === 'member') {
                checkEmailExistAPI(
                  values.email.toLowerCase(),
                  props.datasetId,
                ).then((res) => {
                  const username = res.data.result['username'];
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

                      message.success(
                        `${t(
                          'success:addUser.addUserToDataset.0',
                        )} ${username} ${t(
                          'success:addUser.addUserToDataset.1',
                        )} ${projectName}`,
                      );
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
                });
              }
            }
          }
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
            const errorMessager = new ErrorMessager(
              namespace.teams.checkUserPlatformRole,
            );
            errorMessager.triggerMsg(
              err.response && err.response.status,
              null,
              {
                email: values.email,
              },
            );
          }
        })
        .finally(() => {
          cancelAddUser();
          form.resetFields();
          setIsSubmitting(false);
        });
    } else {
      message.error(t('formErrorMessages:common.email.valid'));
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      title="Add a member to project"
      visible={isAddUserModalShown}
      maskClosable={false}
      closable={false}
      confirmLoading={submitting}
      onCancel={handleCancel}
      filterOption={(input, option) =>
        option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
      }
      footer={[
        <Button disabled={isSubmitting} key="back" onClick={handleCancel}>
          Cancel
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={isSubmitting}
          onClick={onSubmit}
        >
          Submit
        </Button>,
      ]}
      cancelButtonProps={{ disabled: submitting }}
    >
      <Form form={form}>
        <Form.Item
          label="Email"
          name="email"
          rules={[
            {
              type: 'email',
              message: t('formErrorMessages:common.email.valid'),
            },
            {
              required: true,
              message: t('formErrorMessages:common.email.valid'),
            },
          ]}
        >
          <Input type="email" />
        </Form.Item>
        <Form.Item
          initialValue={containerDetails && containerDetails['roles'][0]}
          label={'Role'}
          name="role"
          rules={[
            {
              required: true,
              message: t('formErrorMessages:project.addMemberModal.role.empty'),
            },
          ]}
        >
          <Radio.Group>
            {containerDetails &&
              containerDetails['roles'] &&
              containerDetails['roles'].map((i) => {
                if (i === 'admin') {
                  return (
                    <Radio value={convertRole(i)}>
                      {formatRole(i)}&nbsp;
                      <Tooltip title="Project Administrators are able to add users to their Project as well as to upload, view, and download any data in their Project's Green Room.">
                        <QuestionCircleOutlined />
                      </Tooltip>
                    </Radio>
                  );
                }

                return (
                  <Radio value={convertRole(i)}>
                    {formatRole(i)}&nbsp;
                    <Tooltip title="Project Contributors are able to upload data to their Project's Green Room but can only view or download data they have uploaded themselves.">
                      <QuestionCircleOutlined />
                    </Tooltip>
                  </Radio>
                );
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
