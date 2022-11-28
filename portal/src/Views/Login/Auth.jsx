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

import React, { Component } from 'react';
import { Card, Col, Row } from 'antd';
import { Button, Modal, notification, Alert } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import Icon from '@ant-design/icons';
import { instanceOf } from 'prop-types';
import { withCookies, Cookies } from 'react-cookie';
import styles from './index.module.scss';
import { namespace, ErrorMessager } from '../../ErrorMessages';
import { withRouter, Redirect } from 'react-router-dom';
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
import { login as keycloakLogin } from '../../Utility';
import { version } from '../../../package.json';
import { tokenManager } from '../../Service/tokenManager';
import { lastLoginAPI } from '../../APIs';
import { keycloak } from '../../Service/keycloak';
import { BRANDING_PREFIX, PLATFORM, PORTAL_PREFIX } from '../../config';
import { xwikis } from '../../externalLinks';
const { detect } = require('detect-browser');
const browser = detect();
const isSafari = browser?.name === 'safari';
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
              session information and login status. By using the {PLATFORM} you
              accept our use of cookies in accordance with our{' '}
              <a
                target="_blank"
                rel="noopener noreferrer"
                href={xwikis.privacyPolicy}
              >
                Privacy Policy
              </a>
              .
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

    keycloakLogin().catch((err) => {
      if (err.response) {
        const errorMessager = new ErrorMessager(namespace.login.auth);
        errorMessager.triggerMsg(err.response.status);
        this.setState({ btnLoading: false });
      }
    });
  };

  initApis = async (username) => {
    getDatasetsAPI({})
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
    // if (keycloak.authenticated && !tokenManager.getCookie('sessionId')) {
    //   const sourceId = uuidv4();
    //   tokenManager.setCookies({
    //     sessionId: `${keycloak?.tokenParsed.preferred_username}-${sourceId}`,
    //   });
    //   lastLoginAPI(keycloak?.tokenParsed.preferred_username);
    // }
    if (tokenManager.getCookie('sessionId')) {
      if (isSafari) {
        window.location.href = `${BRANDING_PREFIX}/landing`;
      } else {
        return <Redirect to="/landing" />;
      }
    }

    const alertMessage = (
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <div>
          <Icon
            component={() => (
              <img
                className="pic"
                style={{ width: '44px', height: '44px' }}
                src={require('../../Images/auth_alert.png')}
              />
            )}
          />
        </div>
        <div style={{ marginLeft: '20px', marginTop: '-3px' }}>
          <p
            style={{
              margin: '0px',
              color: '#5BAB58',
              fontSize: '20px',
              fontWeight: 'bold',
            }}
          >
            GDPR READY
          </p>
          <p
            style={{
              margin: '-7px 0px 0px 0px',
              color: '#FFFFFF',
              fontSize: '16px',
            }}
          >
            The {PLATFORM} has undergone a successful GDPR Service Readiness
            Audit
          </p>
        </div>
      </div>
    );

    return (
      <>
        <Alert
          className={styles.login_alert}
          message={alertMessage}
          style={{ width: '100%', zIndex: '10' }}
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
                  <p className={styles.title}>Welcome to {PLATFORM}!</p>
                  <p className={styles.content}>
                    The{' '}
                    <a
                      href="https://www.bihealth.org/en/research/translation-hubs/digital-medicine/bihcharite-virtual-research-environment/"
                      target="_blank"
                      rel="noreferrer noopener"
                      style={{ color: 'white', textDecoration: 'underline' }}
                    >
                      Virtual Research Environment ({PLATFORM})
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
                        src={require('../../Images/logo-bih-website-login.svg')}
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
                        src={require('../../Images/logo-organization-alt.png')}
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
                    src={PORTAL_PREFIX + '/platform-logo.png'}
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
            <a
              target="_blank"
              rel="noreferrer"
              href={xwikis.termsOfUse}
              style={{
                color: 'white',
                fontSize: '80%',
                marginRight: 20,
              }}
            >
              Terms of Use
            </a>
            <a
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: 'white',
                fontSize: '80%',
              }}
              href={xwikis.privacyPolicy}
            >
              Privacy Policy
            </a>
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
              style={{ paddingRight: 0 }}
              type="link"
            >
              {' '}
              <small> Version {version}</small>
            </Button>
            {' / '}
            <a
              style={{ marginRight: 10 }}
              href={xwikis.documentation}
              target="_blank"
              rel="noopener noreferrer"
            >
              Documentation
            </a>
            VRE is a product developed jointly by{' '}
            <a
              href="https://www.charite.de/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Charité
            </a>
            /
            <a
              href="https://www.bihealth.org/"
              target="_blank"
              rel="noopener noreferrer"
            >
              BIH
            </a>{' '}
            and{' '}
            <a
              href="https://www.indocresearch.org/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Indoc Research
            </a>{' '}
            and powered by{' '}
            <a
              href="https://github.com/PilotDataPlatform"
              target="_blank"
              rel="noopener noreferrer"
            >
              Indoc Pilot
            </a>
          </small>
        </div>
      </>
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
      setUsernameCreator,
      setIsReleaseNoteShownCreator,
    })(Auth),
  ),
);
