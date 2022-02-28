import React, { useState } from 'react';
import { Modal, Form, Tooltip, Radio, message, Input, Button } from 'antd';
import {
  QuestionCircleOutlined,
  CheckCircleFilled,
  ExclamationCircleOutlined,
  MailOutlined,
} from '@ant-design/icons';
import { validateEmail, formatRole } from '../../../../Utility';
import { useTranslation } from 'react-i18next';
import { namespace, ErrorMessager } from '../../../../ErrorMessages';
import { checkUserPlatformRole } from '../../../../APIs';
import styles from '../index.module.scss';
import { useCurrentProject } from '../../../../Utility';
import { inviteUserApi } from '../../../../APIs';
import { useKeycloak } from '@react-keycloak/web';
import { PLATFORM } from '../../../../config';

const InviteUserModal = (props) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation([
    'tooltips',
    'formErrorMessages',
    'success',
    'errormessages',
    'modals',
  ]);
  const [userAddCompleted, setUserAddCompleted] = useState(false);
  const { keycloak } = useKeycloak();
  const addUser = async (inAd, adUserDn) => {
    const values = form.getFieldsValue();
    const email = values.email;
    const role = values.role;
    try {
      await inviteUserApi(email, role, null, null, null, inAd, adUserDn);
      //setCompletedUserAdd(true);
      if (!inAd) {
        message.success('Invitation email sent with AD request form attached');
      }
      form.resetFields();
    } catch (err) {
      /*       if (err.response) {
        const errorMessager = new ErrorMessager(namespace.teams.inviteUser);
        errorMessager.triggerMsg(null, null, {
          email: email,
        });
      } */
      message.error(
        `${t('errormessages:inviteUserPlatform.default.0')}${email}${t(
          'errormessages:inviteUserPlatform.default.1',
        )}`,
      );
    }
  };

  const onSubmit = async () => {
    const values = form.getFieldsValue();
    setLoading(true);
    const email = values.email;

    if (!email) {
      message.error(t('errormessages:addUser2Project.emailRequired'));
      setLoading(false);
      return;
    }

    const isValidEmail = validateEmail(email);

    if (!isValidEmail) {
      message.error(t('errormessages:addUser2Project.email'));
      setLoading(false);
      return;
    }

    checkUserPlatformRole(email.toLowerCase())
      .then((res) => {
        if (res.status === 200) {
          if (res.data.result) {
            const invitedUser = res.data.result;
            const { role, status, name } = invitedUser;
            if (status === 'disabled') {
              //message.error(t('errormessages:addUser2Project.disabledUser'));
              Modal.warning({
                title: t('errormessages:addUser2Platform.disabledUser.title'),
                content: `${t(
                  'errormessages:addUser2Platform.disabledUser.content.0',
                )} ${values.email} ${t(
                  'errormessages:addUser2Platform.disabledUser.content.1',
                )}`,
                className: styles['warning-modal'],
              });
            } else if (status === 'pending') {
              Modal.warning({
                title: t('errormessages:addUser2Platform.pending.title'),
                content: `${t(
                  'errormessages:addUser2Platform.pending.content.0',
                )} ${values.email} ${t(
                  'errormessages:addUser2Platform.pending.content.1',
                  { PLATFORM: PLATFORM },
                )}`,
                className: styles['warning-modal'],
              });
            } else if (role === 'admin') {
              Modal.warning({
                title: t('modals:inviteExist.title'),
                content: `${t('modals:inviteExist.content.0')} ${email} ${t(
                  'modals:inviteExist.content.1',
                )}`,
              });
            } else if (role === 'member') {
              Modal.warning({
                title: t('modals:inviteExist.title'),
                content: `${t('modals:inviteExist.content.0')} ${email} ${t(
                  'modals:inviteExist.content.1',
                )}`,
              });
            }
            setLoading(false);
            props.onCancel();
          }
        }
      })
      .catch((err) => {
        if (err.response && err.response.status === 404) {
          const email = values.email;
          const role = values.role;
          const platFormRole =
            role === 'admin' ? 'Platform Administrator' : 'Platform User';
          Modal.confirm({
            title: t('modals:inviteNoExistPlatform.title'),
            icon: <ExclamationCircleOutlined />,
            content: (
              <>
                {' '}
                <p>{`${t(
                  'modals:inviteNoExistPlatform.content.0',
                )} ${email} ${t(
                  'modals:inviteNoExistPlatform.content.1',{PLATFORM:PLATFORM}
                )} ${platFormRole}`}</p>
                {!err.response.data.result?.ad_account_created ? (
                  <p>{`${t('modals:inviteNoExistPlatform.content.2')}`}</p>
                ) : (
                  <p>{`${t('modals:inviteNoExistPlatform.content.4')}`}</p>
                )}
                <p>{`${t('modals:inviteNoExistPlatform.content.3')}`}</p>
              </>
            ),
            okText: (
              <>
                <MailOutlined /> Send
              </>
            ),
            onOk() {
              if (err.response.data.result?.ad_account_created === true) {
                addUser(true, err.response.data.result?.ad_user_dn);
              } else {
                addUser(false, err.response.data.result?.ad_user_dn);
              }
            },
            className: styles['warning-modal'],
          });

          setLoading(false);
          props.onCancel();
        } else {
          const errorMessager = new ErrorMessager(
            namespace.teams.checkUserPlatformRole,
          );
          errorMessager.triggerMsg(null, null, {
            email: values.email,
          });
        }
      });

    /*     try {
      const res = await props.inviteUserApi(values.email, values.role);

      if (res.status === 200) {
        setUserAddCompleted(true);
      }
      props.getInvitationListApi();

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
    } */
  };

  return (
    <Modal
      title="Invite a User to the Platform"
      visible={props.visible}
      maskClosable={false}
      closable={false}
      okButtonProps={{ loading }}
      cancelButtonProps={{ disabled: loading }}
      footer={
        userAddCompleted
          ? [
              <Button
                key="submit"
                type="primary"
                onClick={() => {
                  props.onCancel();
                  form.resetFields();
                  setTimeout(() => {
                    setUserAddCompleted(false);
                  }, 500);
                }}
              >
                Close
              </Button>,
            ]
          : [
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
            ]
      }
    >
      {userAddCompleted ? (
        <p>
          <CheckCircleFilled style={{ color: '#BAEEA2', marginRight: 6 }} />{' '}
          Invitation email sent with AD request form attached
        </p>
      ) : (
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
                message: t(
                  'formErrorMessages:platformUserManagement.role.empty',
                ),
              },
            ]}
          >
            <Radio.Group>
              <Radio value="member">
                Platform User &nbsp;
                <Tooltip
                  title={`${PLATFORM} Members who can view public content and Projects to which they are invited. Platform Users may hold either Project Administrator or Collaborator or Contributor roles in their Projects.`}
                >
                  <QuestionCircleOutlined />
                </Tooltip>
              </Radio>
              <Radio value="admin">
                Platform Administrator &nbsp;
                <Tooltip
                  title={`A ${PLATFORM} Administrator who has access to advanced permissions across all Projects to maintain the platform and assist Project Administrators with support issues related to their Project.`}
                >
                  <QuestionCircleOutlined />
                </Tooltip>
              </Radio>
            </Radio.Group>
          </Form.Item>
        </Form>
      )}
    </Modal>
  );
};

export default InviteUserModal;
