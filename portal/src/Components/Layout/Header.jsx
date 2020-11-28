import React, { Component } from 'react';
import { Layout, Menu, Button, Badge, Tabs, Empty, Modal, Alert } from 'antd';
import {
  ContainerOutlined,
  UserOutlined,
  ExclamationCircleOutlined,
  ControlOutlined,
  FieldTimeOutlined,
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { withCookies } from 'react-cookie';
import { withRouter } from 'react-router-dom';
import {
  cleanDatasetCreator,
  userLogoutCreator,
  setUploadListCreator,
} from '../../Redux/actions';
import { connect } from 'react-redux';
import _ from 'lodash';
import styles from './index.module.scss';
import ResetPasswordModal from '../Modals/ResetPasswordModal';
import SupportDrawer from '../Tools/SupportDrawer';
import { UploadQueueContext } from '../../Context';
import { userAuthManager } from '../../Service/userAuthManager';
import { broadcastManager } from '../../Service/broadcastManager';
import { namespace as ServiceNamespace } from '../../Service/namespace';
import { guacomoleAPI } from '../../APIs';
import { timezone } from '../../Utility';

const { confirm } = Modal;
const { Header } = Layout;
const { TabPane } = Tabs;
const SubMenu = Menu.SubMenu;
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
    };
  }

  componentDidMount() {
    //Update header
    const { params, path } = this.props.match;
    if (path === '/landing' || params?.datasetId) {
      this.updatedSelectedKeys('clear');
      this.updatedSelectedKeys('add', 'uploader');
    } else if (path === '/users') {
      this.updatedSelectedKeys('clear');
      this.updatedSelectedKeys('add', 'users');
    }
  }
  logout = async () => {
    const { uploadList } = this.props;
    const uploadingList = uploadList.filter(
      (item) => item.status === 'uploading',
    );

    modal = confirm({
      title: 'Are you sure you want to log out?',
      icon: <ExclamationCircleOutlined />,
      content: (
        <>
          By clicking on "OK", you will be logged out on all the opened VRE
          tabs. <br />
          If you're uploading/downloading, all the progress will be lost.
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
      broadcastManager.postMessage(
        'logout',
        ServiceNamespace.broadCast.CLICK_HEADER_LOGOUT,
      );
      userAuthManager.logout(ServiceNamespace.userAuthLogout.LOGOUT_HEADER);
      localStorage.removeItem('sessionId');
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

  render() {
    const uploadListContent = (
      <Tabs className={styles.tab}>
        <TabPane tab="Messages" key="message">
          <Empty
            description="No Messages"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        </TabPane>
      </Tabs>
    );

    const username = this.props.username;

    return (
      <Header
        className="header"
        style={{
          background: 'white',
          boxShadow: '0 0 14px 1px rgba(0, 0, 0, 0.1)',
          position: 'sticky',
          top: '0',
          zIndex: '100',
          width: '100%',
          height: '100%',
        }}
      >
        <Alert
          message="This release of the VRE is exclusively for testing purposes. The upload of files containing clinical and/or research data of any type is strictly forbidden. By proceeding, you are agreeing to these terms."
          type="warning"
          showIcon
          style={{ margin: '0px -50px' }}
        />
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
          <Menu.Item key="logo" style={{ marginRight: '27px' }}>
            <Link to="/">
              <img
                src={require('../../Images/vre-logo.png')}
                style={{ height: '40px', marginLeft: -30 }}
                alt="indoc-icon"
              />
            </Link>
          </Menu.Item>
          <Menu.Item key="uploader">
            <Link to="/landing">
              <ContainerOutlined /> Projects
            </Link>
          </Menu.Item>
          {this.props.role === 'admin' ? (
            <Menu.Item key="users">
              <Link to="/users">
                <ControlOutlined /> Administrators Console
              </Link>
            </Menu.Item>
          ) : null}
          {/* <Menu.Item key="guacomole">
            <Button type="link" onClick={() => guacomoleAPI()}>
              <ControlOutlined /> Guacomole
            </Button>
          </Menu.Item> */}
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

          {/* <SubMenu
            key="notifications"
            style={{ float: 'right' }}
            // className={this.state.shakeClass}
            title={
              <Badge
                offset={[5, 0]}
                // dot={this.state.show}
              >
                {this.state.loading && <LoadingOutlined color={'#1890ff'} />}{' '}
                Notifications
              </Badge>
            }
          > */}
          {/* {uploadListContent} */}
          {/* </SubMenu> */}

          <Menu.Item
            key="support"
            style={{ float: 'right' }}
            onClick={this.showDrawer}
          >
            Support
          </Menu.Item>
          {/* <Menu.Item
            key="timezone"
            style={{ float: 'right' }}
          >
            <FieldTimeOutlined />
            {timezone}
          </Menu.Item> */}
        </Menu>
        <ResetPasswordModal
          visible={this.state.modalVisible}
          username={username || 'Error'}
          handleCancel={this.handleCancel}
        />
        <SupportDrawer onClose={this.onClose} visible={this.state.drawer} />
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
  }),
  {
    cleanDatasetCreator,
    userLogoutCreator,
    setUploadListCreator,
  },
)(withCookies(withRouter(AppHeader)));
