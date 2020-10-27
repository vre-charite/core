import React, { useState } from 'react';
import { useHistory, Link } from 'react-router-dom';
import { Card, Form, Input, Button, Layout, Typography, Space } from 'antd';
import styles from './index.module.scss';

import { sendUsernameEmailAPI } from '../../APIs';
import { namespace, ErrorMessager } from '../../ErrorMessages';

const { Content } = Layout;
const { Title } = Typography;

function Login() {
  let history = useHistory();
  const [loading, setLoading] = useState(false);
  const onFinish = (values) => {
    setLoading(true);
    sendUsernameEmailAPI(values)
      .then((res) => {
        console.log('onFinish -> res', res);
        if (res?.status === 200) {
          setLoading(false);
          history.push('/account-assistant/forgot-username-confirmation');
        }
      })
      .catch((err) => {
        if (err.response) {
          const errorMessager = new ErrorMessager(
            namespace.login.forgotUsername,
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
          <Title level={4}>Find my username</Title>

          <Form
            // {...layout}
            layout="vertical"
            name="basic"
            initialValues={{
              remember: true,
            }}
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
          >
            <Form.Item
              label="Your email address"
              name="email"
              rules={[
                {
                  required: true,
                  message: 'Please input your email.',
                },
                { type: 'email', message: 'Please input a valid email.' },
              ]}
              className="mb-2"
              extra="By submitting this form, your username
              will be sent to this email address if there's record in our database."
            >
              <Input placeholder="Your email address" />
            </Form.Item>

            <Link to="/account-assistant">Remember username?</Link>
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
