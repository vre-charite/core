// Copyright 2022 Indoc Research
// 
// Licensed under the EUPL, Version 1.2 or – as soon they
// will be approved by the European Commission - subsequent
// versions of the EUPL (the "Licence");
// You may not use this work except in compliance with the
// Licence.
// You may obtain a copy of the Licence at:
// 
// https://joinup.ec.europa.eu/collection/eupl/eupl-text-eupl-12
// 
// Unless required by applicable law or agreed to in
// writing, software distributed under the Licence is
// distributed on an "AS IS" basis,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
// express or implied.
// See the Licence for the specific language governing
// permissions and limitations under the Licence.
// 

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { history } from '../../Routes';
import { Card, Form, Input, Button, Layout, Typography } from 'antd';
import styles from './index.module.scss';

import { sendUsernameEmailAPI } from '../../APIs';
import { namespace, ErrorMessager } from '../../ErrorMessages';
import { useTranslation } from 'react-i18next';
import { BRANDING_PREFIX, PLATFORM, PORTAL_PREFIX } from '../../config';

const { Content } = Layout;
const { Title } = Typography;

function Login() {
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation(['tooltips', 'formErrorMessages']);

  const onFinish = (values) => {
    setLoading(true);

    sendUsernameEmailAPI(values)
      .then((res) => {
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
              src={PORTAL_PREFIX + '/platform-logo.png'}
              style={{ height: '50px' }}
              alt="icon"
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
                  message: t('formErrorMessages:common.email.empty'),
                },
                {
                  type: 'email',
                  message: t('formErrorMessages:common.email.valid'),
                },
              ]}
              className="mb-2"
              extra={`Please provide the email address associated with your ${PLATFORM} user account.   Once verified as an authentic ${PLATFORM} account, an email will be sent to you containing your username.​`}
            >
              <Input placeholder="Your email address" />
            </Form.Item>

            <Link to="/account-assistant">Remember username?</Link>
            <br />
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

export default Login;
