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
import moment from 'moment';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { DownOutlined } from '@ant-design/icons';
import AddUserModal from './Components/AddUserModal';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import {
  changeUserRoleInDatasetAPI,
  //addUserToDatasetAPI,
  removeUserFromDatasetApi,
  setUserStatusFromDatasetApi,
} from '../../../APIs';
import { objectKeysToSnakeCase, objectKeysToCamelCase } from '../../../Utility';
import { namespace, ErrorMessager } from '../../../ErrorMessages';
import {
  withCurrentProject,
  formatRole,
  convertRole,
  timeConvert,
} from '../../../Utility';
import SearchTable from '../../../Components/Table/SearchTable';
import { withTranslation } from 'react-i18next';
import InvitationTable from '../../../Components/Table/InvitationTable';

const { Content } = Layout;
const { TabPane } = Tabs;

class Teams extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isAddUserModalShown: false,

      total: 0,
      users: [],

      searchText: [],
      searchedColumn: '',
      page: 0,
      pageSize: 10,
      order: 'desc',
      sortColumn: 'time_created',
      searchFilters: {},
    };

    this.changeRole = this.changeRole.bind(this);
    this.confirmModal = this.confirmModal.bind(this);
    this.getUsers = this.getUsers.bind(this);
  }

  componentDidMount() {
    const data = {
      page: 0,
      pageSize: 10,
      orderBy: 'time_created',
      orderType: 'desc',
    };
    this.getUsers(data);
  }

  showAddUserModal = () => {
    this.setState({
      isAddUserModalShown: true,
    });
  };

  cancelAddUser = () => {
    this.setState({
      isAddUserModalShown: false,
    });
  };

  getUsers(data = null) {
    if (!data) {
      data = {
        page: this.state.page,
        pageSize: this.state.pageSize,
        orderBy: this.state.orderBy || 'time_created',
        orderType: this.state.order,
        // startParams: this.state.searchFilters,
      };

      if (
        Object.keys(this.state.searchFilters) &&
        Object.keys(this.state.searchFilters).length > 0
      )
        data['startParams'] = this.state.searchFilters;
    }

    this.props
      .getUsersOnDatasetAPI(this.props.datasetId, data)
      .then((res) => {
        const users = res.data.result.filter(
          (user) => user.projectStatus !== 'disable',
        );
        this.props.setUserListOnDataset(objectKeysToCamelCase(users));
        this.setState({
          total: res.data.total,
        });
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
        message.success(this.props.t('success:teams.roleUpdated'));
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
        message.success(
          `${this.props.t(
            'success:teams.userRemoved.0',
          )} ${username} ${this.props.t('success:teams.userRemoved.1')}`,
        );
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

  restoreUser = (username) => {
    const { datasetId } = this.props.match.params;
    setUserStatusFromDatasetApi(username, datasetId, 'active')
      .then(async (res) => {
        await this.getUsers();
        message.success(
          `${this.props.t(
            'success:teams.userRestored.0',
          )} ${username} ${this.props.t('success:teams.userRestored.1')}`,
        );
      })
      .catch((err) => {
        if (err.response) {
          if (err.response && err.response.status === 404) this.getUsers();
          const errorMessager = new ErrorMessager(
            namespace.teams.restoreUserFromDataset,
          );
          errorMessager.triggerMsg(err.response.status, null, {
            username: username,
          });
        }
      });
  };

  confirmModal(user, permission, action) {
    const _this = this;
    let content = '';

    if (action === 'delete') {
      content = `Are you sure you wish to remove user ${user} from this project?`;
    } else {
      content = `Are you sure you wish to change the role for user ${user} to ${formatRole(
        action,
      )}?`;
    }
    Modal.confirm({
      title: 'Confirm',
      icon: <ExclamationCircleOutlined />,
      content,
      okText: 'OK',
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

  handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
  };

  handleReset = (clearFilters, dataIndex) => {
    clearFilters();
    let filters = this.state.searchText;
    filters = filters.filter((el) => el.key !== dataIndex);
    this.setState({ searchText: filters });
  };

  onChange = async (pagination, param2, param3) => {
    let order = 'asc';
    const filters = {
      page: this.state.page,
      pageSize: this.state.pageSize,
      orderBy: 'time_created',
      orderType: 'desc',
    };

    const startParams = {};

    if (param3 && param3.order !== 'ascend') order = 'desc';

    this.setState({ page: pagination.current - 1 });
    filters.page = pagination.current - 1;

    if (param3) {
      this.setState({ order: order });

      if (param3.columnKey) {
        filters.orderBy = param3.columnKey;
        this.setState({ sortColumn: param3.columnKey });
      }
      filters.orderType = order;
    }

    if (pagination.pageSize) {
      this.setState({ pageSize: pagination.pageSize });
      filters.pageSize = pagination.pageSize;
    }

    let searchText = [];

    if (param2.name && param2.name.length > 0) {
      searchText.push({
        key: 'name',
        value: param2.name[0],
      });

      startParams['name'] = param2.name[0];
    }

    if (param2.email && param2.email.length > 0) {
      searchText.push({
        value: param2.email[0],
        key: 'email',
      });

      startParams['email'] = param2.email[0];
    }

    this.setState({ searchText: searchText, searchFilters: startParams });

    if (Object.keys(startParams) && Object.keys(startParams).length > 0)
      filters['start_params'] = startParams;

    this.getUsers(filters);
  };

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
              return (
                <Menu.Item
                  onClick={() => {
                    this.confirmModal(
                      record.name,
                      record.permission,
                      convertRole(i),
                    );
                  }}
                  disabled={role === i}
                  key="0"
                >
                  {formatRole(i)}
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
        sorter: true,
        searchKey: 'name',
      },
      {
        title: 'Email',
        dataIndex: 'email',
        key: 'email',
        sorter: true,
        searchKey: 'email',
      },
      {
        title: 'First Name',
        dataIndex: 'firstName',
        sorter: true,
        key: 'first_name',
      },
      {
        title: 'Last Name',
        dataIndex: 'lastName',
        sorter: true,
        key: 'last_name',
      },
      {
        title: 'Join Date',
        dataIndex: 'timeCreated',
        sorter: true,
        key: 'time_created',
        render: (text) => text && timeConvert(text, 'datetime'),
      },
      {
        title: 'Role',
        dataIndex: 'permission',
        key: 'role',
        render: (text) => {
          return formatRole(text);
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
                {record.projectStatus === 'hibernate' ? (
                  <a
                    onClick={() => {
                      this.restoreUser(record.name);
                    }}
                  >
                    Restore
                  </a>
                ) : (
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
                )}
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
        path: '/landing',
        breadcrumbName: 'Projects',
      },
      {
        path: `/project/${this.props.match.params.datasetId}/canvas`,
        breadcrumbName: projectName,
      },
      {
        path: 'second',
        breadcrumbName: 'Members',
      },
    ];

    function itemRender(route, params, routes, paths) {
      const index = routes.indexOf(route);
      if (index === 0) {
        return <Link to={route.path}>{route.breadcrumbName}</Link>;
      } else if (index === 1) {
        return (
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
            <Link to={route.path}>{route.breadcrumbName}</Link>
          </span>
        );
      } else {
        return <>{route.breadcrumbName}</>;
      }
      // const second = routes.indexOf(route) === 1;
      // return second ? (
      //   <Link to={route.path}>{route.breadcrumbName}</Link>
      // ) : (
      //     <span
      //       style={{
      //         maxWidth: 'calc(100% - 74px)',
      //         display: 'inline-block',
      //         verticalAlign: 'bottom',
      //         whiteSpace: 'nowrap',
      //         overflow: 'hidden',
      //         textOverflow: 'ellipsis',
      //       }}
      //     >
      //       <Link to={route.path}>{route.breadcrumbName}</Link>
      //     </span>
      //   );
    }

    if (this.props.role === 'admin') {
      role = 'Platform Administrator';
    } else {
      role = 'Project Administrator';
    }

    return (
      <>
        <Content className={'content'}>
          <Row style={{ paddingBottom: '10px' }}>
            <Col
              span={24}
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
                <Tabs onChange={this.callback} type="card">
                  <TabPane tab="Members" key="users">
                    <SearchTable
                      dataSource={this.props.userListOnDataset}
                      columns={columns}
                      totalItem={this.state.total}
                      pageSize={this.state.pageSize}
                      page={this.state.page}
                      onChange={this.onChange}
                      handleReset={this.handleReset}
                      handleSearch={this.handleSearch}
                      setClassName={(record) => {
                        return record.projectStatus === 'hibernate'
                          ? 'disabled '
                          : ' ';
                      }}
                      tableKey="projectUsers"
                    />
                  </TabPane>
                  <TabPane tab="Invitations" key="invitations">
                    <InvitationTable
                      projectId={parseInt(this.props.datasetId)}
                      tableKey="projectInvitations"
                    />
                  </TabPane>
                </Tabs>
              </Card>
            </Col>
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
})(withCurrentProject(withRouter(withTranslation('success')(Teams))));
