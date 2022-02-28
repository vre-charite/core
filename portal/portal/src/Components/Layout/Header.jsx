import React, { Component } from 'react';
import { Layout, Menu, Button, Modal, Alert, Badge, message } from 'antd';
import styles from './index.module.scss';
import { PORTAL_PREFIX } from '../../config';
import {
  ContainerOutlined,
  UserOutlined,
  ExclamationCircleOutlined,
  ControlOutlined,
  DeploymentUnitOutlined,
  BellOutlined,
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { withCookies } from 'react-cookie';
import { withRouter } from 'react-router-dom';
import moment from 'moment';

import {
  cleanDatasetCreator,
  userLogoutCreator,
  setUploadListCreator,
  setServiceRequestRedDot,
  notificationActions,
} from '../../Redux/actions';
import { connect } from 'react-redux';
import ResetPasswordModal from '../Modals/ResetPasswordModal';
import SupportDrawer from '../Tools/SupportDrawer';
import { UploadQueueContext } from '../../Context';
import { logout, convertUTCDateToLocalDate } from '../../Utility';
import FilePanel from './FilePanel/FilePanel';
import {
  getResourceRequestsAPI,
  getFilteredNotifications,
  postUnsubscribeNotifications,
} from '../../APIs/index';
import { BellNotifications, BannerNotifications } from '../Notifications';
import UpcomingMaintenanceModal from '../Modals/UpcomingMaintenanceModal';
import { tokenManager } from '../../Service/tokenManager';
import { BRANDING_PREFIX } from '../../config';

const { confirm } = Modal;
const { Header } = Layout;
const SubMenu = Menu.SubMenu;
// eslint-disable-next-line
let modal;
class AppHeader extends Component {
  static contextType = UploadQueueContext;
  constructor(props) {
    super(props);
    this.state = {
      shakeClass: '',
      show: false,
      modalVisible: false,
      loading: false,
      showNotifications: [],
      drawer: false,
      selectedKeys: [],
      projectId: '',
      projectRole: '',
      projectCode: '',
      showBellNotifications: false,
      notificationModalVisible: false,
      modalBellNotification: {},
    };
  }

  componentDidMount = async () => {
    //Update header
    const { params, path } = this.props.match;
    if (params.datasetId) {
      const projectRole = this.props.containersPermission.filter(
        (el) => el.id == params.datasetId,
      )[0].permission;
      const projectCode = this.props.containersPermission.filter(
        (el) => el.id == params.datasetId,
      )[0].code;
      this.setState({ projectRole, projectCode });
    }
    this.setState({ projectId: params.datasetId });
    if (path === '/landing' || params?.datasetId) {
      this.updatedSelectedKeys('clear');
      this.updatedSelectedKeys('add', 'uploader');
    } else if (path === '/users') {
      this.updatedSelectedKeys('clear');
      this.updatedSelectedKeys('add', 'users');
    } else if (path === '/datasets' || path.startsWith('/dataset')) {
      this.updatedSelectedKeys('clear');
      this.updatedSelectedKeys('add', 'datasets');
    }
    if (!this.props.unauthorized) {
      // check if there are new service requests
      const localStorageId = localStorage.getItem('serviceRequestId');
      const res = await getResourceRequestsAPI({
        page: 0,
        pageSize: 1,
        orderBy: 'request_date',
        orderType: 'desc',
        filters: {},
      });

      // Set the red dot when platform admin first login
      if (res.data && res.data.result.length > 0 && !localStorageId) {
        this.props.setServiceRequestRedDot(true);
      }

      if (res.data && res.data.result.length > 0 && localStorageId) {
        if (res.data.result[0].id.toString() !== localStorageId) {
          this.props.setServiceRequestRedDot(true);
        }
      }
    }
    this.getNotificationsForUser();
  };

  logout = async () => {
    modal = confirm({
      title: 'Are you sure you want to log out?',
      icon: <ExclamationCircleOutlined />,
      content: (
        <>
          By clicking on "OK", you will be logged out on all the opened tabs.{' '}
          <br />
          Any ongoing file activities progress will be lost.
        </>
      ),
      onOk() {
        doLogout();
      },
      onCancel() {
        console.log('Cancel');
      },
    });

    const doLogout = () => {
      logout();
    };
  };

  handleCancel = () => {
    this.setState({ modalVisible: false });
  };

  shakeStatus = () => {
    this.setState(
      {
        shakeClass: '',
      },
      () => {
        this.setState({
          shakeClass: 'animate__animated animate__shakeX',
        });
      },
    );
  };

  componentDidUpdate(prevProps, prevState) {
    if (
      prevProps.uploadIndicator !== this.props.uploadIndicator ||
      prevProps.downloadList !== this.props.downloadList
    ) {
      this.shakeStatus();
      let status =
        this.props.uploadIndicator + this.props.downloadList.length > 0;

      this.setState({ show: status });
    }

    //show the spinner
    if (
      (prevProps.downloadList !== this.props.downloadList ||
        prevProps.uploadList) !== this.props.uploadList
    ) {
      let loading =
        this.props.uploadList.filter((item) => item.status === 'uploading')
          .length +
          this.props.downloadList.length >
        0;
      this.setState({ loading: loading });
    }

    if (
      prevProps.uploadList &&
      this.props.uploadList &&
      this.props.uploadList.length !== prevProps.uploadList.length
    ) {
      // this.setState({ showNotifications: ['notifications'] });
    }

    if (prevProps.notificationList !== this.props.notificationList) {
      this.getNotificationsForUser();
    }
  }
  showDrawer = () => {
    this.updatedSelectedKeys('add', 'support');
    this.setState({
      drawer: true,
    });
  };
  onClose = () => {
    this.updatedSelectedKeys('remove', 'support');
    this.setState({
      drawer: false,
    });
  };

  updatedSelectedKeys = (action, key) => {
    const selectedKeys = this.state.selectedKeys;
    let newKeys = [];
    if (action === 'remove') {
      newKeys = selectedKeys.filter((item) => item !== key);
    } else if (action === 'clear') {
      newKeys = [];
    } else if (action === 'add') {
      selectedKeys.push(key);
      newKeys = selectedKeys;
    }

    this.setState({
      selectedKeys: newKeys,
    });
  };

  showBellNotifications = () => {
    this.setState((prevState) => ({
      showBellNotifications: !prevState.showBellNotifications,
    }));
  };

  openNotificationModal = (id, dataset) => {
    const foundNotification = dataset.find(
      (notification) => notification.id === id,
    );
    this.setState({ modalBellNotification: foundNotification });
    this.setState({ notificationModalVisible: true });
  };

  closeNotificationModal = () => {
    this.setState({ notificationModalVisible: false });
  };

  removeBannerNotification = (id) => {
    const filteredNotifications = this.props.userNotifications.filter(
      (notification) => notification.id !== id,
    );
    this.props.setUserNotifications(filteredNotifications);
  };

  getNotificationsForUser = async () => {
    if (this.props.user.status !== 'pending') {
      try {
        const { data } = await getFilteredNotifications(this.props.username);
        let filteredNotifications = data.result.result;

        const cookieNotifications = tokenManager.getCookie(
          'closedNotifications',
        );
        if (cookieNotifications) {
          filteredNotifications = filteredNotifications.filter(
            (notification) => !cookieNotifications.includes(notification.id),
          );
        }

        this.props.setUserNotifications(filteredNotifications);
      } catch (e) {
        message.error(
          'Something went wrong while attempting to retrieve notifications',
        );
      }
    }
  };

  closeNotificationPerm = async (id) => {
    try {
      await postUnsubscribeNotifications(this.props.username, id);
    } catch (e) {
      message.error(
        'Something went wrong while attempting to unsubscribe to this notification',
      );
    }
    this.removeBannerNotification(id);
  };

  closeNotificationSession = (id) => {
    const currentCookie = tokenManager.getCookie('closedNotifications');
    const newCookie = currentCookie ? [...currentCookie, id] : [id];

    tokenManager.setCookies({ closedNotifications: newCookie });
    this.removeBannerNotification(id);
  };

  render() {
    const username = this.props.username;
    const withRedDot = (
      <div className={styles.user_management}>
        <Badge status="error">
          <ControlOutlined /> Platform Management
        </Badge>
      </div>
    );
    const withoutRedDot = (
      <div>
        <ControlOutlined />
        Platform Management
      </div>
    );
    return (
      <Header
        style={{
          background: 'white',
          boxShadow: '0 0 14px 1px rgba(0, 0, 0, 0.1)',
          paddingRight: 0,
          position: 'sticky',
          top: '0',
          zIndex: 100,
          width: '100%',
          height: '100%',
        }}
        id="global_site_header"
      >
        <Menu
          mode="horizontal"
          getPopupContainer={(node) => node.parentNode}
          triggerSubMenuAction="click"
          openKeys={
            this.state.showNotifications &&
            this.state.showNotifications.length > 0
              ? this.state.showNotifications
              : []
          }
          onOpenChange={(key) => {
            this.setState({ showNotifications: key });
          }}
          selectedKeys={this.state.selectedKeys}
        >
          <Menu.Item
            key="logo"
            style={{ marginRight: '27px', borderBottom: 0 }}
          >
            <a href={BRANDING_PREFIX}>
              <img
                src={PORTAL_PREFIX + '/platform-logo.png'}
                style={{ height: '40px', marginLeft: -45 }}
                alt="indoc-icon"
              />
            </a>
          </Menu.Item>
          {!this.props.unauthorized && (
            <Menu.Item key="uploader">
              <Link to="/landing">
                <ContainerOutlined /> Projects
              </Link>
            </Menu.Item>
          )}
          {!this.props.unauthorized && (
            <Menu.Item key="datasets">
              <Link to="/datasets">
                <DeploymentUnitOutlined /> Datasets
              </Link>
            </Menu.Item>
          )}

          {this.props.role === 'admin' && !this.props.unauthorized ? (
            <Menu.Item key="users">
              <Link to="/users">
                {this.props.showRedDot ? withRedDot : withoutRedDot}
              </Link>
            </Menu.Item>
          ) : null}
          <SubMenu
            key="user"
            style={{ float: 'right', paddingRight: '25px' }}
            title={
              <span id="header_username">
                <UserOutlined />
                {username || 'Error'}
              </span>
            }
          >
            <Menu.Item key="resetPassword">
              <Button
                id="header_reset_password"
                type="link"
                onClick={() => {
                  this.setState({ modalVisible: true });
                  console.log('reset pw');
                }}
              >
                <span>Reset Password</span>
              </Button>
            </Menu.Item>
            <Menu.Item key="logout">
              <Button id="header_logout" type="link" onClick={this.logout}>
                <span style={{ color: 'red' }}>Logout</span>
              </Button>
            </Menu.Item>
          </SubMenu>
          <Menu.Item
            key="support"
            style={{ float: 'right' }}
            onClick={this.showDrawer}
          >
            Support
          </Menu.Item>
          {this.props.match.params.datasetId && (
            <Menu.Item
              style={{ float: 'right', padding: 0, marginTop: '-3px' }}
            >
              <FilePanel
                className={styles.filePanel}
                projectRole={this.state.projectRole}
                projectCode={this.state.projectCode}
              />
            </Menu.Item>
          )}
          <Menu.Item
            key="bell-notificiation"
            style={{ float: 'right', color: '#FF8B18', position: 'relative' }}
            onClick={this.showBellNotifications}
          >
            <BellOutlined style={{ marginRight: '6px' }} />
            <span>{this.props.notificationList.length}</span>
            {this.state.showBellNotifications && (
              <BellNotifications
                data={this.props.notificationList}
                handleClick={this.openNotificationModal}
              />
            )}
          </Menu.Item>
        </Menu>
        <BannerNotifications
          data={this.props.userNotifications}
          openModal={this.openNotificationModal}
          closeNotificationPerm={this.closeNotificationPerm}
          closeNotificationSession={this.closeNotificationSession}
        />
        <ResetPasswordModal
          visible={this.state.modalVisible}
          username={username || 'Error'}
          handleCancel={this.handleCancel}
        />
        <SupportDrawer onClose={this.onClose} visible={this.state.drawer} />
        <UpcomingMaintenanceModal
          visible={this.state.notificationModalVisible}
          onOk={this.closeNotificationModal}
          onCancel={this.closeNotificationModal}
          data={this.state.modalBellNotification}
        />
      </Header>
    );
  }

  cleanUploadList = () => {
    this.props.setUploadListCreator([]);
  };
}

export default connect(
  (state) => ({
    role: state.role,
    uploadList: state.uploadList,
    downloadList: state.downloadList,
    uploadIndicator: state.newUploadIndicator,
    isLogin: state.isLogin,
    username: state.username,
    containersPermission: state.containersPermission,
    showRedDot: state.serviceRequestRedDot.showRedDot,
    userNotifications: state.notifications.userNotifications,
    notificationList: state.notifications.notificationList,
    user: state.user,
  }),
  {
    cleanDatasetCreator,
    userLogoutCreator,
    setUploadListCreator,
    setServiceRequestRedDot,
    setUserNotifications: notificationActions.setUserNotifications,
  },
)(withCookies(withRouter(AppHeader)));
