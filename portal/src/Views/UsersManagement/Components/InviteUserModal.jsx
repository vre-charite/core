import React, { useState } from 'react';
import { Modal, Form, Tooltip, Radio, message, Input ,Button} from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { validateEmail } from '../../../Utility';
import { useTranslation } from 'react-i18next';
import { namespace, ErrorMessager } from '../../../ErrorMessages';

const InviteUserModal = (props) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const { t, i18n } = useTranslation([
    'tooltips',
    'formErrorMessages',
    'success',
  ]);

  const onSubmit = async () => {
    const values = form.getFieldsValue();
    setLoading(true);

    if (!values.email) {
      message.error('Email is required.');
      setLoading(false);
      return;
    }

    const isValidEmail = validateEmail(values.email);

    if (!isValidEmail) {
      message.error('Wrong email format.');
      setLoading(false);
      return;
    }

    try {
      const res = await props.inviteUserApi(values.email, values.role);
      if (res.status === 200) {
        message.success(
          `${t('success:userManagement.inviteUser.0')} ${values.email}.`,
        );
      }
      props.onCancel();
      setLoading(false);
    } catch (err) {
      if (err.response) {
        const errorMessager = new ErrorMessager(
          namespace.userManagement.inviteUserApi,
        );
        errorMessager.triggerMsg(err.response.status, null, {
          email: values.email,
        });
      }
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Invite a User to the Platform"
      visible={props.visible}
      maskClosable={false}
      closable={false}
      okButtonProps={{ loading }}
      cancelButtonProps={{ disabled: loading }}
      footer={[
        <Button 
          disabled={loading} 
          key="back" 
          onClick={() => {
            props.onCancel();
            form.resetFields();
          }}
        >
          Cancel
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={loading}
          onClick={onSubmit}
        >
          Submit
        </Button>,
      ]}
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
              message: t('formErrorMessages:common.email.empty'),
            },
          ]}
        >
          <Input type="email" />
        </Form.Item>
        <Form.Item
          initialValue="member"
          label={'Role'}
          name="role"
          rules={[
            {
              required: true,
              message: t('formErrorMessages:platformUserManagement.role.empty'),
            },
          ]}
        >
          <Radio.Group>
            <Radio value="member">
              Platform User &nbsp;
              <Tooltip title="VRE Members who can view public content and Projects to which they are invited. Platform Users may hold either Project Administrators or Contributor roles in their Projects.">
                <QuestionCircleOutlined />
              </Tooltip>
            </Radio>
            <Radio value="admin">
              Platform Administrator &nbsp;
              <Tooltip title="A VRE Administrator who has access to advanced permissions across all Projects to maintain the platform and assist Project Administrators with support issues related to their Project.">
                <QuestionCircleOutlined />
              </Tooltip>
            </Radio>
          </Radio.Group>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default InviteUserModal;
