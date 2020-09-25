import React, { Component } from 'react';
import {
  Layout,
  Menu,
  Button,
  message,
  Popover,
  List,
  Progress,
  Tag,
  Badge,
  Tabs,
  Empty,
  Modal,
} from 'antd';
import {
  ContainerOutlined,
  UserOutlined,
  LoadingOutlined,
  CloudUploadOutlined,
  ExclamationCircleOutlined,
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
import { MenuItem } from 'react-contextmenu';
import { emailUploadedFileListAPI } from '../../APIs';
import { namespace, ErrorMessager } from '../../ErrorMessages';
import { logout } from '../../Utility';
import ResetPasswordModal from '../Modals/ResetPasswordModal';
import { logoutChannel, headerUpdate, getCookie } from '../../Utility';
import { UploadQueueContext } from '../../Context';
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
    };
  }
  logout = async () => {
    const { uploadList } = this.props;
    const uploadingList = uploadList.filter(
      (item) => item.status === 'uploading',
    );
    const doLogout = () => {
      console.log('before logout post');
      logoutChannel.postMessage('logout1');
      const { allCookies, history, cookies } = this.props;
      logout();
    };
    console.log(
      uploadingList.length > 0,
      this.checkTabUploading(),
      this.checkTabDownloading(),
    );
    modal = confirm({
      title: 'Are you sure you want to log out?',
      icon: <ExclamationCircleOutlined />,
      content: `If you're uploading/downloading, all the progress will be lost.`,
      onOk() {
        doLogout();
      },
      onCancel() {
        console.log('Cancel');
      },
    });
  };

  checkTabUploading = () => {
    const uploadListFlags = localStorage.getItem('uploadList');
    if (!uploadListFlags) {
      return false;
    }
    if (!_.isObject(JSON.parse(uploadListFlags))) {
      return false;
    }
    return _.some(Object.values(JSON.parse(uploadListFlags)));
  };
  checkTabDownloading = () => {
    const downloadListFlags = localStorage.getItem('downloadList');
    if (!downloadListFlags) {
      return false;
    }
    if (!_.isObject(JSON.parse(downloadListFlags))) {
      return false;
    }

    return _.some(Object.values(JSON.parse(downloadListFlags)));
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

  render() {
    const { isLogin } = this.props.allCookies;
    const statusTags = (status) => {
      switch (status) {
        case 'waiting': {
          return <Tag color="default">Waiting</Tag>;
        }
        case 'uploading': {
          return <Tag color="blue">Uploading</Tag>;
        }
        case 'error': {
          return <Tag color="red">Error</Tag>;
        }
        case 'pending': {
          return <Tag color="yellow">Processing</Tag>;
        }
        case 'success': {
          return <Tag color="green">Success</Tag>;
        }

        default: {
          return null;
        }
      }
    };

    const countStatus = () => {
      const { uploadList = [] } = this.props;
      const status = ['uploading', 'pending', 'error', 'success'].map(
        (item) => {
          return uploadList.filter((ele) => ele['status'] === item).length;
        },
      );
      const colors = ['#1890ff', 'orange', 'red', '#52c41a'];
      const currentStatusIndex = status.findIndex((ele) => ele > 0);

      switch (currentStatusIndex) {
        case 0: {
          return [
            <LoadingOutlined
              style={{
                color: colors[currentStatusIndex],
                left: '5px',
              }}
            />,
            {},
          ];
        }
        case -1: {
          return [0, null];
        }
        default: {
          return [
            status[currentStatusIndex],
            { backgroundColor: colors[currentStatusIndex] },
          ];
        }
      }
    };

    const isCleanButtonDisabled = () => {
      const { uploadList = [] } = this.props;
      if (uploadList.length === 0) {
        return true;
      }
      const uploadingList = uploadList.filter(
        (item) => item.status === 'uploading',
      );
      if (uploadingList.length !== 0) {
        return true;
      }
      return false;
    };

    // const uploadListContent = (
    //   <Tabs defaultActiveKey="1" className={styles.tab}>
    //     <TabPane
    //       tab={
    //         <>
    //           Upload
    //           <Badge
    //             offset={[4, 0]}
    //             style={countStatus()[1]}
    //             count={countStatus()[0]}
    //             overflowCount={99}
    //           />
    //         </>
    //       }
    //       key="1"
    //     >
    //       <List
    //         size="small"
    //         dataSource={this.props.uploadList}
    //         className={
    //           this.props.uploadList.length > 0 ? styles.download_list : ''
    //         }
    //         renderItem={(item) => (
    //           <List.Item style={{ overflowWrap: 'anywhere' }}>
    //             <List.Item.Meta
    //               title={
    //                 <>
    //                   {item.fileName} {statusTags(item.status)}
    //                 </>
    //               }
    //               description={
    //                 item.status === 'uploading' && (
    //                   <Progress
    //                     status="active"
    //                     percent={Math.floor(100 * item.progress)}
    //                     size="small"
    //                   />
    //                 )
    //               }
    //             />
    //           </List.Item>
    //         )}
    //       />
    //       <Button
    //         onClick={this.cleanUploadList}
    //         danger
    //         disabled={isCleanButtonDisabled()}
    //       >
    //         Clear upload history
    //       </Button>
    //     </TabPane>
    //     <TabPane
    //       tab={
    //         <>
    //           Bulk Download
    //           <Badge
    //             offset={[4, 0]}
    //             style={{ backgroundColor: 'gold' }}
    //             count={this.props.downloadList.length}
    //             overflowCount={99}
    //           />
    //         </>
    //       }
    //       key="2"
    //     >
    //       <List
    //         size="small"
    //         dataSource={this.props.downloadList}
    //         renderItem={(item) => (
    //           <List.Item>
    //             <List.Item.Meta
    //               title={
    //                 <>
    //                   {item.downloadKey} {statusTags(item.status)}
    //                 </>
    //               }
    //             />
    //           </List.Item>
    //         )}
    //       />
    //     </TabPane>
    //   </Tabs>
    // );

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

    const username = getCookie('username');

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
        >
          <Menu.Item key="logo" style={{ marginRight: '27px' }}>
            <Link to="/">
              <img
                src={require('../../Images/vre-logo.png')}
                style={{ height: '40px' }}
                alt="indoc-icon"
              />
            </Link>
          </Menu.Item>
          <Menu.Item key="uploader">
            <Link to="/uploader">
              <ContainerOutlined /> Projects
            </Link>
          </Menu.Item>

          {/* this.props.role === "admin" && (
            <Menu.Item key="admin">
              <Link to="/admin/users">
                <UserOutlined /> Admin
              </Link>
            </Menu.Item>
          ) */}

          {/* <Menu.Item key="5" style={{ float: 'right' }}>
            {isLogin ? (
              <Button type="link" onClick={this.logout}>
                Logout
              </Button>
            ) : (
              <Link to="/">
                <Button type="link">Login</Button>
              </Link>
            )}
          </Menu.Item> */}
          <SubMenu
            key="user"
            style={{ float: 'right', paddingRight: '25px' }}
            title={
              <span>
                <UserOutlined />
                {username || 'admin'}
              </span>
            }
          >
            <Menu.Item key="resetPassword">
              <Button
                type="link"
                onClick={() => {
                  this.setState({ modalVisible: true });
                }}
              >
                <span>Reset Password</span>
              </Button>
            </Menu.Item>
            {/* removed to support page */}
            {/* <Menu.Item key="helpCenter">
              <Button type="link">
                <a href="mailto:vre-support@charite.de">Contact Us</a>
              </Button>
            </Menu.Item> */}
            <Menu.Item key="logout">
              <Button type="link" onClick={this.logout}>
                <span style={{ color: 'red' }}>Logout</span>
              </Button>
            </Menu.Item>
          </SubMenu>

          <SubMenu
            key="notifications"
            style={{ float: 'right' }}
            // className={this.state.shakeClass}
            title={
              <Badge
                offset={[5, 0]}
                // dot={this.state.show}
              >
                {/* {this.state.loading && <LoadingOutlined color={'#1890ff'} />}{' '} */}
                Notifications
              </Badge>
            }
          >
            {uploadListContent}
          </SubMenu>
          <Menu.Item key="support" style={{ float: 'right' }}>
            <Link to="/support">Support</Link>
            {/* <a href="/files/test.pdf" download target="_self"></a> */}
          </Menu.Item>
        </Menu>
        <ResetPasswordModal
          visible={this.state.modalVisible}
          username={username || 'admin'}
          handleCancel={this.handleCancel}
        />
      </Header>
    );
  }

  cleanUploadList = () => {
    // emailUploadedFileListAPI(
    //   this.props.uploadList,
    //   this.props.allCookies.username,
    // )
    //   .then((res) => {})
    //   .catch((err) => {
    //     /* const errorMessager = new ErrorMessager(namespace.common.emailFileList);
    //     errorMessager.triggerMsg(); */
    //   });
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
  }),
  {
    cleanDatasetCreator,
    userLogoutCreator,
    setUploadListCreator,
  },
)(withCookies(withRouter(AppHeader)));
