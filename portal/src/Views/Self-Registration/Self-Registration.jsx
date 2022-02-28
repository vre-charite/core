import React, { useState, useEffect } from 'react';
import { withRouter, Link } from 'react-router-dom';
import {
  Row,
  Col,
  Form,
  Input,
  Typography,
  message,
  Tooltip,
  Checkbox,
  Button,
  Card,
} from 'antd';
import styles from './index.module.scss';
import {
  checkIsUserExistAPI,
  parseInviteHashAPI,
  UserSelfRegistrationAPI,
} from '../../APIs';
import { namespace, ErrorMessager } from '../../ErrorMessages';
import { QuestionCircleOutlined } from '@ant-design/icons';
import TermsOfUseModal from '../../Components/Modals/TermsOfUseModal';
import { useTranslation } from 'react-i18next';
import { PLATFORM, PORTAL_PREFIX } from '../../config';

const { Title } = Typography;
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
    role: '',
    projectId: 'project',
    email: null,
  });
  const [visible, setVisible] = useState(false);
  const [btnDisable, setBtnDisable] = useState(true);
  const { t } = useTranslation(['tooltips', 'success', 'formErrorMessages']);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const submitForm = (values) => {
    setLoading(true);
    let params = {
      ...values,
      // ...info,
      token: props.match.params.invitationHash,
    };
    if (info.projectId) {
      params = { ...params, ...info, status: 'active' };
    } else {
      params = {
        ...params,
        portalRole: info.role,
        email: info.email,
        status: 'active',
      };
    }
    UserSelfRegistrationAPI(params)
      .then((res) => {
        message.success(t('success:selfRegistration'));
        setLoading(false);
        props.history.push('/');
      })
      .catch((err) => {
        if (err.response) {
          const errorMessager = new ErrorMessager(
            namespace.selfRegister.selfRegistration,
          );
          errorMessager.triggerMsg(err.response.status);
          setLoading(false);
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
    // eslint-disable-next-line
  }, []);

  const onCancel = () => {
    setVisible(false);
    setBtnDisable(true);
  };

  const onDecline = () => {
    setVisible(false);
    setBtnDisable(true);
    form.setFieldsValue({ tou: false });
  };

  const onOk = () => {
    form.setFieldsValue({ tou: true });
    setVisible(false);
  };

  const onPrint = () => {
    console.log('print');
  };

  const handleScroll = (e) => {
    const bottom =
      Math.abs(
        e.target.scrollHeight - e.target.scrollTop - e.target.clientHeight,
      ) < 2;
    if (bottom) setBtnDisable(false);
  };

  const onPasswordChange = (e) => {
    form.setFieldsValue(e.target.value);

    const confirmPassword = form.getFieldValue('confirmPassword');

    if (!confirmPassword || e.target.value === confirmPassword) {
      form.validateFields(['confirmPassword'], () => Promise.resolve());
    } else if (confirmPassword && e.target.value !== confirmPassword) {
      form.validateFields(['confirmPassword'], () => Promise.reject());
    }
  };

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
                src={PORTAL_PREFIX + '/platform-logo.png'}
                className={styles.icon}
                alt="icon"
              />
              <Title level={2}>{PLATFORM} Registration</Title>
              <Form form={form} onFinish={submitForm} {...formItemLayout}>
                <Form.Item
                  label="Username"
                  name="username"
                  validateStatus={validatingStatus}
                  hasFeedback
                  rules={[
                    {
                      required: true,
                      message: t('formErrorMessages:common.username.empty'),
                    },
                    ({ getFieldValue }) => ({
                      validator: async (rule, value) => {
                        if (!value.length) {
                          setValidatingStatus('error');
                          return;
                        }

                        setValidatingStatus('validating');
                        try {
                          const re = /^[a-z0-9]{6,20}$/;

                          if (re.test(value)) {
                            await checkIsUserExistAPI(
                              value,
                              props.match.params.invitationHash,
                            );
                            setValidatingStatus('error');
                            return Promise.reject(
                              'The username has been taken',
                            );
                          }

                          setValidatingStatus('error');
                          return Promise.reject(
                            t('formErrorMessages:common.username.valid'),
                          );
                        } catch {
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
                      message: t(
                        'formErrorMessages:selfRegister.firstName.empty',
                      ),
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
                      message: t(
                        'formErrorMessages:selfRegister.lastName.empty',
                      ),
                      whitespace: true,
                    },
                  ]}
                >
                  <Input />
                </Form.Item>
                <Form.Item label="Email">
                  <Input value={info.email} disabled />
                </Form.Item>
                <Form.Item
                  label={
                    <span>
                      Password&nbsp;
                      <Tooltip title={t('password')}>
                        <QuestionCircleOutlined />
                      </Tooltip>
                    </span>
                  }
                  name="password"
                  rules={[
                    {
                      required: true,
                      message: t('formErrorMessages:common.password.empty'),
                      whitespace: true,
                    },
                    {
                      pattern: new RegExp(
                        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[-_!%&/()=?*+#,.;])[A-Za-z\d-_!%&/()=?*+#,.;]{11,30}$/g,
                      ),
                      message: t('formErrorMessages:common.password.valid'),
                    },
                  ]}
                >
                  <Input type="password" onChange={onPasswordChange} />
                </Form.Item>
                <Form.Item
                  label="Confirm Password"
                  name="confirmPassword"
                  rules={[
                    {
                      required: true,
                      message: t(
                        'formErrorMessages:common.confirmPassword.empty',
                      ),
                    },

                    ({ getFieldValue }) => ({
                      validator(rule, value) {
                        if (!value || getFieldValue('password') === value) {
                          return Promise.resolve();
                        }

                        return Promise.reject(
                          t('formErrorMessages:common.confirmPassword.valid'),
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
                  style={{ marginBottom: '8px' }}
                  rules={[
                    {
                      validator: (_, value) =>
                        value
                          ? Promise.resolve()
                          : Promise.reject(
                              t('formErrorMessages:selfRegister.tou.valid'),
                            ),
                    },
                  ]}
                >
                  <Checkbox disabled>
                    By checking this box you agree to our{' '}
                    <Link onClick={() => setVisible(true)}>Terms of Use</Link>.
                  </Checkbox>
                </Form.Item>
                <Form.Item wrapperCol={6}>
                  <Button type="primary" htmlType="submit" loading={loading}>
                    Submit
                  </Button>
                </Form.Item>
              </Form>

              <TermsOfUseModal
                footer={[
                  <Button
                    key="submit"
                    type="primary"
                    onClick={onPrint}
                    style={{ float: 'left' }}
                  >
                    <a
                      href={
                        PORTAL_PREFIX +
                        '/files/Website Privacy Policy draft.pdf'
                      }
                      download
                      target="_self"
                    >
                      {' '}
                      Export PDF
                    </a>
                  </Button>,

                  <Button
                    key="submit"
                    type="primary"
                    disabled={btnDisable}
                    onClick={onOk}
                  >
                    Accept
                  </Button>,

                  <Button key="back" type="danger" onClick={onDecline}>
                    Decline
                  </Button>,
                ]}
                visible={visible}
                handleCancel={onCancel}
                handleScroll={handleScroll}
              />
            </Card>
          </Col>
        </Row>
      </Card>
    </div>
  );
}

export default withRouter(SelfRegistration);
