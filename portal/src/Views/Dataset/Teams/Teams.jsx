import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import {
  Select,
  Card,
  PageHeader,
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
import { DownOutlined } from '@ant-design/icons';
import AddUserModal from './Components/AddUserModal';
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
  getCookie,
} from '../../../Utility';
import { namespace, ErrorMessager } from '../../../ErrorMessages';
const { Meta } = Card;
const { Title } = Typography;
const { Option } = Select;
const { Content } = Layout;
const { TabPane } = Tabs;

class Teams extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isAddUserModalShown: false,
    };

    this.changeRole = this.changeRole.bind(this);
    this.confirmModal = this.confirmModal.bind(this);
    this.getUsers = this.getUsers.bind(this);
  }

  componentDidMount() {
    this.getUsers();
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
        if (err.response) {
          if (err.response && err.response.status === 404) this.getUsers();
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
          if (err.response && err.response.status === 404) this.getUsers();
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
    console.log(this.props);
    const username = getCookie('username');
    const projectAdmin =
      this.props.containersPermission &&
      this.props.containersPermission.some(
        (el) =>
          el.container_id === Number(this.props.datasetId) &&
          el.permission === 'admin',
      );
    const role =
      this.props.containersPermission &&
      this.props.containersPermission.filter((i) => {
        return i.container_id === parseInt(this.props.datasetId);
      })[0]['permission'];
    const projectName =
      this.props.containersPermission &&
      this.props.containersPermission.filter(
        (el) => el.container_id === Number(this.props.datasetId),
      )[0]['container_name'];

    const menu = (record, role) => (
      <Menu>
        {this.props.containerDetails &&
          this.props.containerDetails['roles'].map((i) => {
            if (i !== 'member') {
              return (
                <Menu.Item
                  onClick={() => {
                    // this.changeRole(record.name, record.permission, "uploader");
                    this.confirmModal(record.name, record.permission, i);
                  }}
                  disabled={role === i}
                  key="0"
                >
                  {i}
                </Menu.Item>
              );
            }
          })}
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

          if (
            projectAdmin &&
            record.name !== username &&
            record.role !== 'admin'
          )
            isEnable = true;

          return (
            isEnable && (
              <Dropdown
                overlay={menu(record, record.permission)}
                trigger={['click']}
              >
                <a
                  className="ant-dropdown-link"
                  onClick={(e) => e.preventDefault()}
                >
                  Change role <DownOutlined />
                </a>
              </Dropdown>
            )
          );
        },
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

    const routes = [
      {
        path: 'index',
        breadcrumbName: 'Projects',
      },
      {
        path: 'first',
        breadcrumbName: projectName,
      },
    ];

    function itemRender(route, params, routes, paths) {
      const last = routes.indexOf(route) === routes.length - 1;
      return last ? (
        <span
          style={{
            maxWidth: 'calc(100% - 74px)',
            display: 'inline-block',
            verticalAlign: 'bottom',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {route.breadcrumbName}
        </span>
      ) : (
        <Link to="/uploader">{route.breadcrumbName}</Link>
      );
    }

    return (
      <>
        <Content className={'content'}>
          <Row style={{ paddingBottom: '10px' }}>
            <Col span={1} />
            <Col
              span={22}
              style={{
                paddingTop: '10px',
              }}
            >
              <PageHeader
                ghost={false}
                style={{
                  border: '1px solid rgb(235, 237, 240)',
                  width: '-webkit-fill-available',
                  marginTop: '10px',
                  marginBottom: '25px',
                }}
                title={
                  <span
                    style={{
                      maxWidth: '1000px',
                      display: 'inline-block',
                      verticalAlign: 'bottom',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    Project: {projectName}
                  </span>
                }
                subTitle={`Your role is ${role}.`}
                breadcrumb={{ routes, itemRender }}
                extra={[
                  <Button
                    type="primary"
                    onClick={this.showAddUserModal}
                    className="mb-2"
                  >
                    Add User
                  </Button>,
                ]}
              />
              <Card style={{ marginBottom: '20px' }}>
                <Tabs defaultActiveKey="1">
                  <TabPane tab="Users" key="1">
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
            </Col>
            <Col span={1} />
          </Row>
        </Content>
        <AddUserModal
          datasetId={this.props.match.params.datasetId}
          cancelAddUser={this.cancelAddUser}
          isAddUserModalShown={this.state.isAddUserModalShown}
          getUsers={this.getUsers}
          containerDetails={this.props.containerDetails}
        ></AddUserModal>
      </>
    );
  }
}

export default connect((state) => {
  const { role, containersPermission } = state;
  return { role, containersPermission };
})(withRouter(Teams));
