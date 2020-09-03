import React, { Component } from 'react';
import {
  Select,
  Card,
  Avatar,
  Typography,
  Layout,
  Table,
  Menu,
  Dropdown,
  Button,
  Tabs,
  message,
  Row,
  Col,
  Popconfirm,
  Modal,
} from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import {
  UploadOutlined,
  SelectOutlined,
  ShareAltOutlined,
  DownOutlined,
} from '@ant-design/icons';
import AddUserModal from './Components/AddUserModal';
import { RightOutlined, LeftOutlined } from '@ant-design/icons';
import styles from './index.module.scss';
import { fakeDataGenerator } from '../../../Utility/index';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import {
  changeUserRoleInDatasetAPI,
  //addUserToDatasetAPI,
  removeUserFromDatasetApi,
} from '../../../APIs';
import {
  objectKeysToSnakeCase,
  apiErrorHandling,
  objectKeysToCamelCase,
} from '../../../Utility';
import { namespace, ErrorMessager } from '../../../ErrorMessages';
const { Meta } = Card;
const { Title } = Typography;
const { Option } = Select;
const { Content } = Layout;
const { TabPane } = Tabs;

function getCookie(cname) {
  var name = cname + '=';
  var decodedCookie = decodeURIComponent(document.cookie);
  var ca = decodedCookie.split(';');
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return undefined;
}

class Teams extends Component {
  constructor(props) {
    super(props);
    this.state = { isAddUserModalShown: false };

    this.changeRole = this.changeRole.bind(this);
    this.confirmModal = this.confirmModal.bind(this);
    this.getUsers = this.getUsers.bind(this);
  }

  showAddUserModal = () => {
    console.log('show it!');
    this.setState({
      isAddUserModalShown: true,
    });
  };

  cancelAddUser = () => {
    this.setState({
      isAddUserModalShown: false,
    });
  };

  getUsers() {
    this.props
      .getUsersOnDatasetAPI(this.props.datasetId)
      .then((res) => {
        this.props.setUserListOnDataset(objectKeysToCamelCase(res.data.result));
      })
      .catch((err) => {
        if (err.response) {
          const errorMessager = new ErrorMessager(
            namespace.teams.getUsersOnDataset,
          );
          errorMessager.triggerMsg(err.response.status);
        }
      });
  }

  changeRole(name, oldRole, newRole) {
    const role = { oldRole, newRole };
    changeUserRoleInDatasetAPI(
      name,
      this.props.datasetId,
      objectKeysToSnakeCase(role),
    )
      .then(async (result) => {
        await this.getUsers();
        message.success('Role successfully updated.');
      })
      .catch((err) => {
        console.log(err);

        if (err.response) {
          const errorMessager = new ErrorMessager(
            namespace.teams.changeRoleInDataset,
          );
          errorMessager.triggerMsg(err.response.status, null, {
            name: name,
          });
        }
      });
  }

  removeUser = (username) => {
    const { datasetId } = this.props.match.params;
    removeUserFromDatasetApi(username, datasetId)
      .then(async (res) => {
        await this.getUsers();
        message.success(`User ${username} has been removed.`);
      })
      .catch((err) => {
        if (err.response) {
          const errorMessager = new ErrorMessager(
            namespace.teams.removeUserFromDataset,
          );
          errorMessager.triggerMsg(err.response.status, null, {
            username: username,
          });
        }
      });
  };

  confirmModal(user, permission, action) {
    const _this = this;
    let content = `Are you sure change user ${user} role to ${action}?`;

    if (action === 'delete') content = `Are you sure delete user ${user}?`;
    Modal.confirm({
      title: 'Confrim',
      icon: <ExclamationCircleOutlined />,
      content,
      okText: 'Ok',
      cancelText: 'Cancel',
      onOk() {
        if (action === 'delete') {
          _this.removeUser(user);
        } else {
          _this.changeRole(user, permission, action);
        }
      },
    });
  }

  render() {
    const username = getCookie('username');
    const projectAdmin = this.props.containersPermission && this.props.containersPermission.some(el => el.container_id === Number(this.props.datasetId) && el.permission === 'admin');

    const menu = (record, role) => (
      <Menu>
        <Menu.Item
          onClick={() => {
            // this.changeRole(record.name, record.permission, "uploader");
            this.confirmModal(record.name, record.permission, 'uploader');
          }}
          disabled={role === 'uploader'}
          key="0"
        >
          uploader
        </Menu.Item>

        <Menu.Item
        disabled={role === 'admin'}
          onClick={() => {
            // this.changeRole(record.name, record.permission, "admin");
            this.confirmModal(record.name, record.permission, 'admin');
          }}
          key="1"
        >
          admin
        </Menu.Item>
        <Menu.Divider />
        <Menu.Item
          onClick={() => {
            // this.removeUser(record.name);
            this.confirmModal(record.name, record.permission, 'delete');
          }}
          key="2"
        >
          delete
        </Menu.Item>
      </Menu>
    );
    const dataSource = [
      {
        key: '1',
        name: 'Mike',
        email: 'indoc@gmail.com',
        role: 'visitor',
      },
    ];

    const columns = [
      {
        title: 'Username',
        dataIndex: 'name',
        key: 'name',
      },
      {
        title: 'Email',
        dataIndex: 'email',
        key: 'email',
      },
      {
        title: 'First Name',
        dataIndex: 'firstName',
        key: 'firstName',
      },
      {
        title: 'Last Name',
        dataIndex: 'lastName',
        key: 'lastName',
      },
      {
        title: 'Join Date',
        dataIndex: 'timeCreated',
        key: 'timeCreated',
      },
      {
        title: 'Role',
        dataIndex: 'permission',
        key: 'role',
      },
      {
        title: 'Action',
        key: 'action',
        render: (text, record) => {
          let isEnable = false;

          if (projectAdmin && record.name !== username && record.role !== 'admin') isEnable = true;

          return isEnable && (
            <Dropdown overlay={menu(record, record.permission)} trigger={['click']}>
              <a
                className="ant-dropdown-link"
                onClick={(e) => e.preventDefault()}
              >
                Change role <DownOutlined />
              </a>
            </Dropdown>
          )
        }
      },
    ];

    const AccessRequestColumns = [
      {
        title: 'Name',
        dataIndex: 'name',
        key: 'name',
      },
      {
        title: 'First Name',
        dataIndex: 'firstName',
        key: 'firstName',
      },
      {
        title: 'Last Name',
        dataIndex: 'lastName',
        key: 'lastName',
      },
      {
        title: 'Role',
        dataIndex: 'role',
        key: 'role',
      },
      {
        title: 'Action',
        key: 'action',
        render: (text, record) => (
          <>
            <Button>Approve</Button>
            <Button>Deny</Button>
          </>
        ),
      },
    ];

    return (
      <>
        <Content className={'content'}>
          <Card style={{ marginBottom: '20px' }}>
            <Tabs defaultActiveKey="1">
              <TabPane tab="Users" key="1">
                <Row justify="end">
                  <Col>
                    <Button
                      type="primary"
                      onClick={this.showAddUserModal}
                      className="mb-2"
                    >
                      Add User
                    </Button>
                  </Col>
                </Row>

                <Table
                  dataSource={this.props.userListOnDataset}
                  columns={columns}
                />
              </TabPane>
              {/* <TabPane tab="Access Request" key="2">
                <Table
                  columns={AccessRequestColumns}
                  dataSource={fakeDataGenerator(100)}
                />
              </TabPane> */}
            </Tabs>
          </Card>
        </Content>
        <AddUserModal
          datasetId={this.props.match.params.datasetId}
          cancelAddUser={this.cancelAddUser}
          isAddUserModalShown={this.state.isAddUserModalShown}
          getUsers={this.getUsers}
        ></AddUserModal>
      </>
    );
  }
}

export default connect(
  (state) => {
    const { role, containersPermission } = state;
    return { role, containersPermission };
  },
) (withRouter(Teams));
