import React, { Component } from 'react';
import { Card, Col, Row } from 'antd';
import { Button, Modal, notification, Alert } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { instanceOf } from 'prop-types';
import { withCookies, Cookies } from 'react-cookie';
import { axios } from '../../APIs/config';
import styles from './index.module.scss';
import { namespace, ErrorMessager } from '../../ErrorMessages';
import { withRouter } from 'react-router-dom';
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
  setUsernameCreator,
  setIsReleaseNoteShownCreator,
} from '../../Redux/actions';
import { getDatasetsAPI, listAllContainersPermission } from '../../APIs';
import TermsOfUseModal from '../../Components/Modals/TermsOfUseModal';
import CoookiesDrawer from './CookiesDrawer';
import { withTranslation } from 'react-i18next';
import { keycloak } from '../../Service/keycloak';
import { version } from '../../../package.json';

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

    keycloak
      .login()
      .then((res) => {})
      .catch((err) => {
        if (err.response) {
          const errorMessager = new ErrorMessager(namespace.login.auth);
          errorMessager.triggerMsg(err.response.status);
          this.setState({ btnLoading: false });
        }
      });
  };

  initApis = async (username) => {
    getDatasetsAPI({ type: 'usecase' })
      .then((res) => {
        this.props.AddDatasetCreator(res.data.result, 'All Use Cases');
      })
      .catch((err) => {
        const errorMessager = new ErrorMessager(namespace.common.getDataset);
        errorMessager.triggerMsg(err.response && err.response.status);
      });
    try {
      const {
        data: { result: containersPermission },
      } = await listAllContainersPermission(username);
      this.props.setUserRoleCreator(containersPermission.role);
      this.props.setContainersPermissionCreator(
        containersPermission.permission,
      );
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
    this.setState({
      visible: false,
    });
  };

  handleCancel = (e) => {
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
                  <Button
                    id="auth_login_btn"
                    type="primary"
                    htmlType="submit"
                    className={styles['login-form-button']}
                    onClick={this.onFinish}
                    loading={this.state.btnLoading}
                  >
                    Login
                  </Button>
                  {/* <Link to="/account-assistant">
                    Forgot password or username?{' '}
                  </Link> */}
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
            <Button
              onClick={() => {
                this.props.setIsReleaseNoteShownCreator(true);
              }}
              type="link"
            >
              {' '}
              <small> Version {version}</small>
            </Button>{' '}
            Copyright © {new Date().getFullYear()},{' '}
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
        setIsReleaseNoteShownCreator,
      })(Auth),
    ),
  ),
);
