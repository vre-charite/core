import React, { useEffect, useState } from 'react';
import { Link, withRouter } from 'react-router-dom';
import { history } from '../../Routes';
import { Card, Form, Input, Button, Layout, Typography, Tooltip } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import styles from './index.module.scss';

import { resetForgottenPasswordAPI, checkTokenAPI } from '../../APIs';
import { namespace, ErrorMessager } from '../../ErrorMessages';
import { useTranslation } from 'react-i18next';
import { BRANDING_PREFIX, PORTAL_PREFIX } from '../../config';

const { Content } = Layout;
const { Title } = Typography;

function Login(props) {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const { t } = useTranslation(['tooltips', 'formErrorMessages']);

  const FormInstance = React.createRef();
  const token = props.location.search.split('=')[1];

  useEffect(() => {
    checkTokenAPI(token)
      .then((res) => {
        const { username } = res.data.result;
        form.setFieldsValue({ username: username });
      })
      .catch((err) => {
        if (err.response) {
          const errorMessager = new ErrorMessager(namespace.login.checkToken);
          errorMessager.triggerMsg(err.response.status);
        }
        setLoading(false);
      });
    // eslint-disable-next-line
  }, []);

  const onFinish = (values) => {
    setLoading(true);

    resetForgottenPasswordAPI({
      ...values,
      token,
    })
      .then((res) => {
        setLoading(false);
        history.push('/account-assistant/reset-password-confirmation');
      })
      .catch((err) => {
        if (err.response) {
          const errorMessager = new ErrorMessager(
            namespace.login.resetForgottenPassword,
          );
          errorMessager.triggerMsg(err.response.status);
        }
        setLoading(false);
      });
  };

  const onFinishFailed = (errorInfo) => {
    console.log('Failed:', errorInfo);
  };

  const onPasswordChange = (e) => {
    form.setFieldsValue(e.target.value);

    const confirmPassword = form.getFieldValue('password_confirm');

    if (!confirmPassword || e.target.value === confirmPassword) {
      form.validateFields(['password_confirm'], () => Promise.resolve());
    } else if (confirmPassword && e.target.value !== confirmPassword) {
      form.validateFields(['password_confirm'], () => Promise.reject());
    }
  };

  return (
    <Content className={'content'}>
      <div className={styles.container}>
        <Card style={{ paddingLeft: '40px', paddingRight: '40px' }}>
          <div style={{ textAlign: 'center' }}>
            <img
              src={PORTAL_PREFIX + '/platform-logo.png'}
              style={{ height: '50px' }}
              alt="icon"
            />
          </div>
          <br />
          <Title level={4}>Reset my password</Title>

          <Form
            layout="vertical"
            name="basic"
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
            ref={FormInstance}
            form={form}
          >
            <Form.Item
              label="Username"
              name="username"
              rules={[
                {
                  required: true,
                  message: t('formErrorMessages:common.username.empty'),
                },
              ]}
            >
              <Input disabled />
            </Form.Item>

            <Form.Item
              label={
                <span>
                  New Password&nbsp;
                  <Tooltip title={t('password')}>
                    <QuestionCircleOutlined />
                  </Tooltip>
                </span>
              }
              name="password"
              rules={[
                {
                  required: true,
                  message: t(
                    'formErrorMessages:resetPassword.newPassword.empty',
                  ),
                  whitespace: true,
                },
                {
                  pattern: new RegExp(
                    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[-_!%&/()=?*+#,.;])[A-Za-z\d-_!%&/()=?*+#,.;]{11,30}$/g,
                  ),
                  message:
                    'The password must be 11-30 characters, at least 1 uppercase, 1 lowercase, 1 number and 1 special character(-_!%&/()=?*+#,.;).',
                },
              ]}
            >
              <Input.Password
                onCopy={(e) => e.preventDefault()}
                onPaste={(e) => e.preventDefault()}
                autocomplete="off"
                onChange={onPasswordChange}
              />
            </Form.Item>

            <Form.Item
              label="Confirm Password"
              name="password_confirm"
              rules={[
                {
                  required: true,
                  message: t(
                    'formErrorMessages:resetPassword.confirmPassword.empty',
                  ),
                },

                ({ getFieldValue }) => ({
                  validator(rule, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve();
                    }

                    return Promise.reject(
                      t('formErrorMessages:common.confirmPassword.empty'),
                    );
                  },
                }),
              ]}
            >
              <Input.Password
                onCopy={(e) => e.preventDefault()}
                onPaste={(e) => e.preventDefault()}
                autocomplete="off"
              />
            </Form.Item>

            <br />
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                style={{ float: 'right' }}
              >
                Submit
              </Button>
              <Button disabled={loading}>
                <a href={BRANDING_PREFIX}>Back to Home Page</a>
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </Content>
  );
}

export default withRouter(Login);
