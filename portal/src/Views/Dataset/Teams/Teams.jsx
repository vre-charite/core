import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import {
  Card,
  PageHeader,
  Layout,
  Table,
  Menu,
  Dropdown,
  Button,
  Tabs,
  message,
  Row,
  Col,
  Modal,
  Space,
  Divider,
} from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { DownOutlined } from '@ant-design/icons';
import AddUserModal from './Components/AddUserModal';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import {
  changeUserRoleInDatasetAPI,
  //addUserToDatasetAPI,
  removeUserFromDatasetApi,
} from '../../../APIs';
import { objectKeysToSnakeCase, objectKeysToCamelCase } from '../../../Utility';
import { namespace, ErrorMessager } from '../../../ErrorMessages';
import { withCurrentProject } from '../../../Utility';
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
    const username = this.props.username;
    const projectAdmin =
      this.props.containersPermission &&
      this.props.containersPermission.some(
        (el) =>
          el.containerId === Number(this.props.datasetId) &&
          el.permission === 'admin',
      );
    const projectName = this.props.currentProject?.containerName;
    let role = this.props.currentProject?.permission;

    const menu = (record, role) => (
      <Menu id="teams_role_dropdown">
        {this.props.containerDetails &&
          this.props.containerDetails['roles'].map((i) => {
            if (i !== 'member') {
              if (i === 'uploader') {
                return (
                  <Menu.Item
                    id="teams_role_dropdown_contributor"
                    onClick={() => {
                      this.confirmModal(
                        record.name,
                        record.permission,
                        'contributor',
                      );
                    }}
                    disabled={role === i}
                    key="0"
                  >
                    contributor
                  </Menu.Item>
                );
              }
              return (
                <Menu.Item
                  onClick={() => {
                    this.confirmModal(record.name, record.permission, i);
                  }}
                  disabled={role === i}
                  key="0"
                >
                  {i}
                </Menu.Item>
              );
            } else {
              return null;
            }
          })}
        {/* <Menu.Divider /> */}
        {/* <Menu.Item
          onClick={() => {
            this.confirmModal(record.name, record.permission, 'delete');
          }}
          key="2"
        >
          remove
        </Menu.Item> */}
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
        render: (text) => {
          if (text === 'uploader') {
            return 'contributor';
          }

          return text;
        },
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
              <Space>
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
                <Divider type="vertical" />
                <a
                  onClick={() => {
                    this.confirmModal(record.name, record.permission, 'delete');
                  }}
                >
                  Remove
                </a>
              </Space>
            )
          );
        },
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

    if (this.props.role === 'admin') {
      role = 'Portal Administrator';
    } else {
      role = 'Project Administrator';
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
                    Add Member
                  </Button>,
                ]}
              />
              <Card style={{ marginBottom: '20px' }}>
                <Tabs defaultActiveKey="1">
                  <TabPane tab="Members" key="1">
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
  const { role, containersPermission, username } = state;
  return { role, containersPermission, username };
})(withCurrentProject(withRouter(Teams)));
