import React, { Component } from 'react';
import { Card, Col, Row } from 'antd';
import { Form, Input, Button, message, Modal, notification } from 'antd';
import {
  UserOutlined,
  LockOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import { instanceOf } from 'prop-types';
import { withCookies, Cookies } from 'react-cookie';
import {
  serverAxios,
  devOpServer,
  invitationAxios,
  authServerAxios,
} from '../../APIs/config';
import styles from './index.module.scss';
import { namespace, ErrorMessager } from '../../ErrorMessages';
import { login } from '../../APIs/auth';
import { withRouter, Link } from 'react-router-dom';
import { connect } from 'react-redux';
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
} from '../../Redux/actions';
import {
  objectKeysToCamelCase,
  apiErrorHandling,
  headerUpdate,
  loginChannel,
  getCookie,
} from '../../Utility';
import {
  getDatasetsAPI,
  getAllUsersAPI,
  getTagsAPI,
  getMetadatasAPI,
  getPersonalDatasetAPI,
  listAllContainersPermission,
} from '../../APIs';
import jwt_decode from 'jwt-decode';
import moment from 'moment';
import { reject } from 'async';
import TermsOfUseModal from '../../Components/Modals/TermsOfUseModal';
import CoookiesDrawer from './CookiesDrawer';
const { confirm } = Modal;

class Auth extends Component {
  constructor(props) {
    super(props);
    this.state = { visible: false, cookiesDrawer: false };
  }
  static propTypes = {
    cookies: instanceOf(Cookies).isRequired,
  };

  componentDidMount() {
    const { allCookies } = this.props;

    if (!allCookies.cookies_notified) {
      const closeNotification = () => {
        console.log('closing!!');
        notification.close(key);
        this.props.cookies.set('cookies_notified', true, { path: '/' });
      };
      const key = `open${Date.now()}`;
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
                  this.showDrawer();
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
  }

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

    login(values)
      .then((res) => {
        loginChannel.postMessage(values.username);
        const { access_token, refresh_token } = res.data.result;
        this.props.cookies.set('access_token', access_token, { path: '/' });
        this.props.cookies.set('refresh_token', refresh_token, { path: '/' });
        this.props.cookies.set('isLogin', true, { path: '/' });
        this.props.cookies.set('username', values.username, { path: '/' });

        headerUpdate(access_token);
        this.initApis(values.username);
        this.props.setIsLoginCreator(true);
        this.props.history.push('/uploader');
        message.success(`Welcome back, ${values.username}`);

        /*         setInterval(() => {
          const token = getCookie('access_token');
          try {
            if (token) {
              var exp = jwt_decode(token).exp;
              const diff = exp - moment().unix() < 70; // expired after 1 min
              console.log('Auth -> componentDidMount -> diff', diff);
              if (diff) {
                this.props.setRefreshModal(true); // Pop up warning modal
              }
            }else{
              this.props.setRefreshModal(false);
            }
          } catch (e) {
            console.log(e);
          }
        }, 60000); */
      })
      .catch((err) => {
        if (err.response) {
          const errorMessager = new ErrorMessager(namespace.login.auth);
          // if (err.response.status) alert('Wrong username or password');
          errorMessager.triggerMsg(err.response.status);
        }
      });
  };

  initApis = async (username) => {
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
                  accessible, interoperable and reusable. It integrates with the
                  Charité Health Data Platform systems (HDP) and provides
                  customizable workbenches for data modelling and data analysis.
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
                        message: 'Please input your Username!',
                      },
                    ]}
                  >
                    <Input
                      prefix={<UserOutlined className="site-form-item-icon" />}
                      placeholder="Username"
                    />
                  </Form.Item>
                  <Form.Item
                    name="password"
                    rules={[
                      {
                        required: true,
                        message: 'Please input your Password!',
                      },
                    ]}
                  >
                    <Input
                      prefix={<LockOutlined className="site-form-item-icon" />}
                      type="password"
                      placeholder="Password"
                      onCopy={(e) => e.preventDefault()}
                      onPaste={(e) => e.preventDefault()}
                    />
                  </Form.Item>
                  {/* <Form.Item>
                    <a className={styles["login-form-left"]} href="">
                      Forgot password
                    </a>
                  </Form.Item> */}

                  <Form.Item style={{ paddingTop: '20px' }}>
                    <Button
                      type="primary"
                      htmlType="submit"
                      className={styles['login-form-button']}
                    >
                      Login
                    </Button>
                    {/*  Or{" "}
                    <a>
                      {" "}
                      <Link to="/register">register now!</Link>
                    </a> */}
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
            Terms of Use
          </Button>{' '}
          |
          <Button
            type="link"
            style={{ color: 'white' }}
            onClick={this.showDrawer}
          >
            Cookie Policies
          </Button>
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
      </div>
    );
  }
}

export default withRouter(
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
    })(Auth),
  ),
);
