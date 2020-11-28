import React, { Component } from 'react';
import { Card, Col, Row } from 'antd';
import { Form, Input, Button, message, Modal, notification, Alert } from 'antd';
import {
  UserOutlined,
  LockOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import { instanceOf } from 'prop-types';
import { withCookies, Cookies } from 'react-cookie';
import { axios } from '../../APIs/config';
import styles from './index.module.scss';
import { namespace, ErrorMessager } from '../../ErrorMessages';
import { login } from '../../APIs/auth';
import { withRouter, Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';
import {
  AddDatasetCreator,
  setUserListCreator,
  setTagsCreator,
  setMetadatasCreator,
  setPersonalDatasetIdCreator,
  setContainersPermissionCreator,
  setUserRoleCreator,
  setRefreshModal,
  setIsLoginCreator,
  setUsernameCreator,
} from '../../Redux/actions';
import { tokenManager } from '../../Service/tokenManager';
import { broadcastManager } from '../../Service/broadcastManager';
import { namespace as serviceNamespace } from '../../Service/namespace';
import { getDatasetsAPI, listAllContainersPermission } from '../../APIs';
import TermsOfUseModal from '../../Components/Modals/TermsOfUseModal';
import CoookiesDrawer from './CookiesDrawer';
import { withTranslation } from 'react-i18next';

const { confirm } = Modal;

class Auth extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      cookiesDrawer: false,
      notificationKey: null,
      btnLoading: false,
    };
  }
  static propTypes = {
    cookies: instanceOf(Cookies).isRequired,
  };

  componentDidMount() {
    this.setTermsOfUse();
  }

  componentWillUnmount() {
    const key = this.state.notificationKey;
    notification.close(key);
  }

  setTermsOfUse = () => {
    const cookiesNotified = localStorage.getItem('cookies_notified');

    if (!cookiesNotified) {
      const closeNotification = () => {
        console.log('closing!!');
        notification.close(key);
        localStorage.setItem('cookies_notified', true);
      };
      const key = `open${Date.now()}`;
      this.setState({ notificationKey: key });
      const btn = (
        <Button type="primary" size="small" onClick={closeNotification}>
          OK
        </Button>
      );

      notification.open({
        message: 'Cookies on this site',
        description: (
          <>
            <p>
              We use cookies to make your experience better by keeping your
              session information and login status. By using the VRE, you accept
              our use of cookies.
              <Button
                type="link"
                style={{ paddingLeft: 0 }}
                onClick={() => {
                  closeNotification();
                  this.showModal();
                }}
              >
                Click here for details and controls.
              </Button>
            </p>
          </>
        ),
        key,
        btn,
        duration: 0,
        onClose: closeNotification,
      });
    }
  };

  onFinish = async (values) => {
    try {
      await new Promise((resolve, reject) => {
        const { uploadList, allCookies } = this.props;
        const uploadingList = uploadList.filter(
          (item) => item.status === 'uploading',
        );
        if (
          uploadingList.length === 0 ||
          allCookies.username === values.username
        ) {
          resolve();
          return;
        }
        confirm({
          title: `Are you sure to log in as ${values.username}?`,
          icon: <ExclamationCircleOutlined />,
          content: `The file uploading is still in progress in another tab. Progress will be lost if you login as ${values.username}`,
          onOk() {
            resolve();
          },
          onCancel() {
            reject();
          },
        });
      });
    } catch (err) {
      return;
    }

    this.setState({ btnLoading: true });

    login(values)
      .then((res) => {
        const { accessToken, refreshToken } = res.data.result;
        const sourceId = uuidv4();
        localStorage.setItem('sessionId', `${values.username}-${sourceId}`);

        tokenManager.setCookies({
          access_token: accessToken,
          refresh_token: refreshToken,
          sessionId: `${values.username}-${sourceId}`,
        });
        tokenManager.setTimeSkew(accessToken);

        tokenManager.refreshToken(accessToken);

        this.initApis(values.username);
        this.props.setIsLoginCreator(true);
        this.props.setUsernameCreator(values.username);
        this.setState({ btnLoading: false });
        this.props.history.push('/landing');
        broadcastManager.postMessage(
          'login',
          serviceNamespace.broadCast.USER_CLICK_LOGIN,
          values.username,
        );
      })
      .catch((err) => {
        if (err.response) {
          const errorMessager = new ErrorMessager(namespace.login.auth);
          errorMessager.triggerMsg(err.response.status);
          this.setState({ btnLoading: false });
        }
      });
  };

  initApis = async (username) => {
    console.log(axios.defaults.headers.common, 'axios.defaults.headers.common');
    getDatasetsAPI({ type: 'usecase' })
      .then((res) => {
        this.props.AddDatasetCreator(res.data.result, 'All Use Cases');
      })
      .catch((err) => {
        console.log(err);
        const errorMessager = new ErrorMessager(namespace.common.getDataset);
        errorMessager.triggerMsg(err.response && err.response.status);
      });
    try {
      const {
        data: { result: containersPermission },
      } = await listAllContainersPermission(username);
      this.props.setContainersPermissionCreator(
        containersPermission.permission,
      );
      this.props.setUserRoleCreator(containersPermission.role);
    } catch (err) {
      const errorMessager = new ErrorMessager(
        namespace.common.listAllContainersPermission,
      );
      errorMessager.triggerMsg(err.response && err.response.status);
    }
  };

  showModal = () => {
    this.setState({
      visible: true,
    });
  };

  handleOk = (e) => {
    console.log(e);
    this.setState({
      visible: false,
    });
  };

  handleCancel = (e) => {
    console.log(e);
    this.setState({
      visible: false,
    });
  };
  showDrawer = () => {
    this.setState({
      cookiesDrawer: true,
    });
  };
  onDrawerClose = () => {
    this.setState({
      cookiesDrawer: false,
    });
  };

  render() {
    return (
      <>
        <Alert
          message="This release of the VRE is exclusively for testing purposes. The upload of files containing clinical and/or research data of any type is strictly forbidden. By proceeding, you are agreeing to these terms."
          type="warning"
          showIcon
          style={{ float: 'right', width: '100%', zIndex: '10' }}
        />
        <div className={styles.bg}>
          <Card
            className={styles.card}
            bodyStyle={{ padding: '10%', height: '100%' }}
          >
            <div className={styles.bgImage}></div>
            <Row style={{ height: '100%' }}>
              <Col span={12} className={styles.intro}>
                <div className={styles.text}>
                  <p className={styles.title}>Welcome to VRE!</p>
                  <p className={styles.content}>
                    The{' '}
                    <a
                      href="https://www.bihealth.org/en/research/translation-hubs/digital-medicine/bihcharite-virtual-research-environment/"
                      target="_blank"
                      rel="noreferrer noopener"
                      style={{ color: 'white', textDecoration: 'underline' }}
                    >
                      Virtual Research Environment (VRE)
                    </a>{' '}
                    supports researchers to follow the FAIR Data Principles by
                    offering functionalities to make research data findable,
                    accessible, interoperable and reusable. It integrates with
                    the Charité Health Data Platform systems (HDP) and provides
                    customizable workbenches for data modelling and data
                    analysis.
                  </p>

                  {/* <Button type="ghost" className={styles.btn}>
                  Learn More
                </Button> */}
                  <div className={styles.logos}>
                    <a
                      href="https://www.bihealth.org/en/"
                      target="_blank"
                      rel="noreferrer noopener"
                    >
                      <img
                        src={require('../../Images/logo-bih-alt.png')}
                        className={styles.icon}
                        alt="icon"
                      />
                    </a>
                    <a
                      href="https://www.charite.de/en/"
                      target="_blank"
                      rel="noreferrer noopener"
                    >
                      <img
                        src={require('../../Images/logo-charite-alt.png')}
                        className={styles.icon}
                        alt="icon"
                      />
                    </a>
                    <a
                      href="https://indocresearch.org/"
                      target="_blank"
                      rel="noreferrer noopener"
                    >
                      <img
                        src={require('../../Images/logo-indoc-alt.png')}
                        className={styles.icon}
                        alt="icon"
                        style={{ maxWidth: '80px' }}
                      />
                    </a>
                  </div>
                </div>
              </Col>
              <Col span={12}>
                <Card
                  className={styles.form}
                  bodyStyle={{ textAlign: 'center', padding: '30px' }}
                >
                  <img
                    src={require('../../Images/vre-logo.png')}
                    className={styles.icon}
                    alt="icon"
                    draggable={false}
                  />
                  <Form
                    name="normal_login"
                    className={styles['login-form']}
                    initialValues={{
                      remember: true,
                    }}
                    onFinish={this.onFinish}
                    style={{ textAlign: 'left' }}
                  >
                    <Form.Item
                      name="username"
                      rules={[
                        {
                          required: true,
                          message: this.props.t('common.username.empty'),
                        },
                      ]}
                    >
                      <Input
                        prefix={
                          <UserOutlined className="site-form-item-icon" />
                        }
                        placeholder="Username"
                      />
                    </Form.Item>
                    <Form.Item
                      name="password"
                      rules={[
                        {
                          required: true,
                          message: this.props.t('common.password.empty'),
                        },
                      ]}
                      className="mb-1"
                    >
                      <Input
                        prefix={
                          <LockOutlined className="site-form-item-icon" />
                        }
                        type="password"
                        placeholder="Password"
                        onCopy={(e) => e.preventDefault()}
                        onPaste={(e) => e.preventDefault()}
                      />
                    </Form.Item>
                    <Link to="/account-assistant">
                      Forgot password or username?{' '}
                    </Link>

                    <Form.Item style={{ paddingTop: '20px' }}>
                      <Button
                        id="auth_login_btn"
                        type="primary"
                        htmlType="submit"
                        className={styles['login-form-button']}
                        loading={this.state.btnLoading}
                      >
                        Login
                      </Button>
                    </Form.Item>
                  </Form>
                </Card>
              </Col>
            </Row>
          </Card>
          <div className={styles.utils}>
            <Button
              type="link"
              style={{ color: 'white' }}
              onClick={this.showModal}
            >
              <small>Terms of Use</small>
            </Button>{' '}
            <TermsOfUseModal
              visible={this.state.visible}
              handleOk={this.handleOk}
              handleCancel={this.handleCancel}
            />
            <CoookiesDrawer
              onDrawerClose={this.onDrawerClose}
              cookiesDrawer={this.state.cookiesDrawer}
            />
          </div>
          <small className={styles.copyright}>
            Version 0.2.0. Copyright © {new Date().getFullYear()},{' '}
            <a
              href="https://www.indocresearch.org/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Indoc Research
            </a>
            . All Rights Reserved.
          </small>
        </div>
      </>
    );
  }
}

export default withTranslation('formErrorMessages')(
  withRouter(
    withCookies(
      connect((state) => ({ uploadList: state.uploadList }), {
        AddDatasetCreator,
        setUserListCreator,
        setTagsCreator,
        setMetadatasCreator,
        setPersonalDatasetIdCreator,
        setContainersPermissionCreator,
        setUserRoleCreator,
        setRefreshModal,
        setIsLoginCreator,
        setUsernameCreator,
      })(Auth),
    ),
  ),
);
