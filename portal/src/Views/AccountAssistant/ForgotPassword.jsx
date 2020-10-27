import React, { useState } from 'react';
import { useHistory, Link } from 'react-router-dom';
import { Card, Form, Input, Button, Layout, Typography, Space } from 'antd';
import styles from './index.module.scss';
import { sendResetPasswordEmailAPI } from '../../APIs';
import { namespace, ErrorMessager } from '../../ErrorMessages';

const { Content } = Layout;
const { Title } = Typography;

function Login() {
  let history = useHistory();
  const [loading, setLoading] = useState(false);

  const onFinish = (values) => {
    setLoading(true);
    sendResetPasswordEmailAPI(values)
      .then((res) => {
        if (res && res.status === 200) {
          setLoading(false);
          const email = res.data.result;
          setLoading(false);
          history.push({
            pathname: '/account-assistant/confirmation',
            state: { email },
          });
        }
      })
      .catch((err) => {
        if (err.response) {
          const errorMessager = new ErrorMessager(
            namespace.login.forgotPassword,
          );
          errorMessager.triggerMsg(err.response.status);
        }

        setLoading(false);
      });
  };

  const onFinishFailed = (errorInfo) => {
    console.log('Failed:', errorInfo);
  };
  return (
    <Content className={'content'}>
      <div className={styles.container}>
        <Card style={{ paddingLeft: '40px', paddingRight: '40px' }}>
          <div style={{ textAlign: 'center' }}>
            <img
              src={require('../../Images/vre-logo.png')}
              style={{ height: '50px' }}
              alt="vre-icon"
            />
          </div>
          <br />
          <Title level={4}>Find my password</Title>

          <Form
            layout="vertical"
            name="basic"
            initialValues={{
              remember: true,
            }}
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
          >
            <Form.Item
              label="Your username"
              name="username"
              rules={[
                {
                  required: true,
                  message: 'Please input your username!',
                },
              ]}
              className="mb-2"
              extra="By submitting this form, an email will be sent to the email
              address that's associated with this username to help you reset your password."
            >
              <Input placeholder="Your username" />
            </Form.Item>

            <Link to="/account-assistant/forgot-username">
              Do not remember username?
            </Link>
            <br />
            <br />
            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit" loading={loading}>
                  Submit
                </Button>
                <Button>
                  <Link to="/">Cancel</Link>
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </Content>
  );
}

export default Login;
