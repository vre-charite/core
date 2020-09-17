import React, { useState, useEffect } from 'react';
//import { StandardLayout } from "../../Components/Layout";
import { withRouter, Link } from 'react-router-dom';
import {
  Layout,
  Row,
  Col,
  Form,
  Input,
  Typography,
  message,
  Tooltip,
  Checkbox,
  Modal,
  Button,
  Card
} from 'antd';
import styles from './index.module.scss';
import {
  checkIsUserExistAPI,
  parseInviteHashAPI,
  UserSelfRegistrationAPI,
} from '../../APIs';
import _ from 'lodash';
import { apiErrorHandling } from '../../Utility';
import { namespace, ErrorMessager } from '../../ErrorMessages';
import PasswordValidator from 'password-validator';
import { QuestionCircleOutlined } from '@ant-design/icons';

const { Title } = Typography;
const { TextArea } = Input;
const { Content } = Layout;
const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 8 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 10 },
  },
};
const tailLayout = {
  wrapperCol: {
    offset: 0,
    span: 24,
  },
};

function SelfRegistration(props) {
  const [validatingStatus, setValidatingStatus] = useState('');
  const [info, setInfo] = useState({
    role: 'hello',
    projectId: 'project',
    email: null,
  });
  const [visible, setVisible] = useState(false);
  const [btnDisable, setBtnDisable] = useState(true);

  const [form] = Form.useForm();
  const submitForm = (values) => {
    const params = {
      ...values,
      ...info,
      token: props.match.params.invitationHash,
    };
    UserSelfRegistrationAPI(params)
      .then((res) => {
        message.success('Sign-up successful!');
        props.history.push('/');
      })
      .catch((err) => {
        if (err.response) {
          const errorMessager = new ErrorMessager(
            namespace.selfRegister.selfRegistration,
          );
          errorMessager.triggerMsg(err.response.status);
        }
      });
  };

  useEffect(() => {
    const { invitationHash } = props.match.params;
    parseInviteHashAPI(invitationHash)
      .then((res) => {
        const { result } = res.data;
        setInfo(result);
      })
      .catch((err) => {
        if (err.response) {
          const errorMessager = new ErrorMessager(
            namespace.login.parseInviteHashAPI,
          );
          errorMessager.triggerMsg(err.response.status);
        }
      });
  }, [props.match.params]);

  const onCancel = () => {
    setVisible(false);
    setBtnDisable(true);
    form.setFieldsValue({ tou: false });
  }

  const onOk = () => {
    form.setFieldsValue({ tou: true });
    setVisible(false);
  }

  const handleScroll = (e) => {
    const bottom = e.target.scrollHeight - e.target.scrollTop === e.target.clientHeight;
    if (bottom) setBtnDisable(false)
  }

  let aggreementText = `hello
    So, if I'm understanding right what you're saying and especially this example, 
    what you propose is to use something that already exists and that we're already monitoring to decide whether an effect hook should execute or not 
  `;

  return (
    <div className={styles.bg}>
      <Card className={styles.card} bodyStyle={{ padding: '10% 10%' }}>
        <Row style={{ height: '100%' }}>
          <Col span={24}>
            <Card
              className={styles.form}
              bodyStyle={{ textAlign: 'center', padding: '30px' }}
            >
              <img
                src={require('../../Images/vre-logo.png')}
                className={styles.icon}
                alt="icon"
              />
              <Title level={2}>VRE Registration</Title>
              <Form form={form} onFinish={submitForm} {...formItemLayout}>
                <Form.Item
                  label="Username"
                  name="username"
                  validateStatus={validatingStatus}
                  hasFeedback
                  // validateTrigger="onBlur"
                  rules={[
                    {
                      required: true,
                      message: 'Please input your username',
                    },
                    {
                      pattern: '^[a-z0-9_-]+$',
                      message: 'Only lower case letters and numbers allowed',
                    },
                    ({ getFieldValue }) => ({
                      validator: async (rule, value) => {
                        if (!value.length) {
                          return;
                        }
                        setValidatingStatus('validating');
                        try {
                          const result = await checkIsUserExistAPI(value);
                          setValidatingStatus('error');
                          return Promise.reject('The username has been taken');
                        } catch {
                          console.log('validating catching');

                          setValidatingStatus('success');
                          return Promise.resolve();
                        }
                      },
                    }),
                  ]}
                >
                  <Input />
                </Form.Item>
                <Form.Item
                  label="First Name"
                  name="firstName"
                  rules={[
                    {
                      required: true,
                      message: 'Please input your first name',
                      whitespace: true,
                    },
                  ]}
                >
                  <Input />
                </Form.Item>
                <Form.Item
                  label="Last Name"
                  name="lastName"
                  rules={[
                    {
                      required: true,
                      message: 'Please input your last name',
                      whitespace: true,
                    },
                  ]}
                >
                  <Input />
                </Form.Item>
                <Form.Item label="Email">
                  <Input value={info.email} disabled />
                </Form.Item>

                <Form.Item label="Project ID">
                  <Input value={info.projectId} disabled />
                </Form.Item>
                {/* <Form.Item label="Role">
                  <Input value={info.role} disabled />
                </Form.Item> */}
                <Form.Item
                  label="Password"
                  label={
                    <span>
                      Password&nbsp;
                      <Tooltip title="Project code (8~16 digits) should contain the following: 1 Uppercase, 1 Lowercase letters, 1 number and 1 Special character(@#$!%*?&^). ">
                        <QuestionCircleOutlined />
                      </Tooltip>
                    </span>
                  }
                  name="password"
                  rules={[
                    {
                      required: true,
                      message: 'Please input your password',
                      whitespace: true,
                    },
                    {
                      pattern: new RegExp(
                        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$!%*?&^])[A-Za-z\d@#$!%*?&^]{8,16}$/g,
                      ),
                      message:
                        'The password should be 8-16 characters, at least 1 uppercase, 1 lowercase, 1 number and 1 special character',
                    },
                  ]}
                >
                  <Input type="password" />
                </Form.Item>
                <Form.Item
                  label="Confirm Password"
                  name="confirmPassword"
                  rules={[
                    {
                      required: true,
                      message: 'Please confirm your password!',
                    },

                    ({ getFieldValue }) => ({
                      validator(rule, value) {
                        if (!value || getFieldValue('password') === value) {
                          return Promise.resolve();
                        }

                        return Promise.reject(
                          'The two passwords that you entered do not match!',
                        );
                      },
                    }),
                  ]}
                >
                  <Input type="password" />
                </Form.Item>
                <Form.Item
									{...tailLayout}
									name="tou"
									valuePropName="checked"
									style={{ marginBottom: "8px" }}
									rules={[
										{
											validator: (_, value) =>
												value
													? Promise.resolve()
													: Promise.reject(
															"Please accept the terms of use to proceed",
													  ),
										},
									]}
								>
									<Checkbox disabled>
										By checking this box you agree to our{" "}
										<Link onClick={() => setVisible(true)}>
											Terms of Use
										</Link>
										.
									</Checkbox>
								</Form.Item>
                <Form.Item wrapperCol={6}>
                  <Button type="primary" htmlType="submit">
                    Submit
                  </Button>
                </Form.Item>
              </Form>

              <Modal
                title="VRE Terms of Use"
                visible={visible}
                centered
                width={800}
                onCancel={onCancel}
                footer={[
                  <Button key="submit" type="primary" disabled={btnDisable} onClick={onOk}>
                    Accept
                  </Button>,

                  <Button key="back" type="danger" onClick={onCancel}>
                    Declined
                  </Button>,
                ]}
              >
                <div style={{ overflowY: "scroll", height: 300 }} onScroll={handleScroll}>
                  <h2 style={{ textAlign: 'center' }}>Section One</h2>
                  <TextArea rows={5} disabled defaultValue={aggreementText} style={{ marginBottom: 20 }} />

                  <h2 style={{ textAlign: 'center' }}>Section Two</h2>
                  <TextArea rows={5} disabled defaultValue={aggreementText} style={{ marginBottom: 20 }} />

                  <h2 style={{ textAlign: 'center' }}>Section Three</h2>
                  <TextArea rows={5} disabled defaultValue={aggreementText} style={{ marginBottom: 20 }} />

                  <h2 style={{ textAlign: 'center' }}>Section Four</h2>
                  <TextArea rows={5} disabled defaultValue={aggreementText} style={{ marginBottom: 20 }} />
                </div>
              </Modal>
            </Card>
          </Col>
        </Row>
      </Card>
    </div>
  );
}

export default withRouter(SelfRegistration);
