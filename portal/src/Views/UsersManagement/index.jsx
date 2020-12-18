import React, { Component } from 'react';
import { Redirect, Switch, Route } from 'react-router-dom';
import {
  Card,
  PageHeader,
  Layout,
  Button,
  Row,
  Col,
  Menu,
  Dropdown,
  message,
  Tabs,
  Modal,
  Space,
  Checkbox,
} from 'antd';
import _ from 'lodash';
import { connect } from 'react-redux';
import {
  MoreOutlined,
  ExclamationCircleOutlined,
  FilterFilled,
  DownOutlined,
} from '@ant-design/icons';
import { StandardLayout } from '../../Components/Layout';
import SearchTable from '../../Components/Table/SearchTable';
import { getPortalUsers, inviteUserApi, updateUserStatusAPI } from '../../APIs';
import InviteUserModal from './Components/InviteUserModal';
import { timeConvert, partialString } from '../../Utility';
import ScalableDetails from './Components/ScalableDetails';
import InvitationsTable from '../../Components/Table/InvitationTable';
import { namespace, ErrorMessager } from '../../ErrorMessages';
import UserManagementToolBar from './Components/UserManagementToolBar';
import { keycloak } from '../../Service/keycloak';
import { serverAxios } from '../../APIs/config';

const { Content } = Layout;
const { TabPane } = Tabs;

class UserManagement extends Component {
  constructor(props) {
    super(props);
    this.state = {
      total: 0,
      users: [],
      sidePanel: false,
      searchText: [],
      searchedColumn: '',
      page: 0,
      pageSize: 10,
      order: 'desc',
      sortColumn: 'createTime',
      modalVisible: false,
      adminView: true,
      tableWidth: '90%',
      panelWidth: 600,
      currentRecord: null,
      filters: {
        page: 0,
        pageSize: 10,
        orderBy: 'time_created',
        orderType: 'desc',
      },
      invitations: {
        data: null,
      },
      statusFilter: 'All',
      roleFilter: 'All',
      isAdminOnly: false,
    };
    this.myRef = React.createRef();
  }

  componentDidMount() {
    this.fetchUsers();
  }

  fetchUsers = async () => {
    const { filters, currentRecord } = this.state;
    try {
      const res = await getPortalUsers(filters);
      if (res.status === 200) {
        const { page, result, total } = res.data;
        let updatedCurrent = currentRecord;

        //If there's a opened profile and it's on current page, then update the currentRecord
        if (currentRecord) {
          updatedCurrent =
            result.filter((user) => user.id === currentRecord.id)[0] ||
            currentRecord;
        }

        this.setState({
          total,
          users: result,
          page,
          adminView: true,
          currentRecord: updatedCurrent,
        });
      }
    } catch (err) {
      const errorMessager = new ErrorMessager(
        namespace.userManagement.getPortalUsers,
      );
      if (err.response) {
        errorMessager.triggerMsg(err.response.status);
        if (err.response.status === 401) {
          this.setState({
            adminView: false,
          });
        }
      }
    }
  };

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
      status: this.state.filters && this.state.filters.status,
      role: this.state.filters && this.state.filters.role,
    };

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

      filters['name'] = param2.name[0];
    }

    if (param2.email && param2.email.length > 0) {
      searchText.push({
        value: param2.email[0],
        key: 'email',
      });

      filters['email'] = param2.email[0];
    }

    this.setState({ searchText: searchText, filters }, () => {
      this.fetchUsers();
    });
  };

  openModal = () => {
    this.setState({ modalVisible: true });
  };

  toggleSidePanel = () => {
    this.setState((prev) => {
      return {
        sidePanel: !prev.sidePanel,
      };
    });
  };

  mouseDown = (e) => {
    document.addEventListener('mousemove', this.mouseMove, true);
    document.addEventListener('mouseup', this.stopMove, true);
  };

  /**
   * Set the panel width based on mouse position and width of the user table
   *
   * @param {*} e
   */
  mouseMove = (e) => {
    const mouseX = e.clientX;
    const parentX = this.myRef.current.getClientRects()[0].x;
    const parentWidth = this.myRef.current.getClientRects()[0].width;
    const delta = mouseX - parentX;
    const maxPanelwidth = 700;
    const panelWidth =
      parentWidth - delta > maxPanelwidth ? maxPanelwidth : parentWidth - delta;
    const tableWidth = parentWidth - panelWidth;

    this.setState({
      tableWidth: tableWidth,
      panelWidth: panelWidth,
    });
  };

  stopMove = () => {
    document.removeEventListener('mousemove', this.mouseMove, true);
    document.removeEventListener('mouseup', this.stopMove, true);
  };

  openUserSider = async (record) => {
    this.setState({
      currentRecord: record,
      sidePanel: true,
    });
  };

  updateStatus = async (record, action) => {
    const { id, email } = record;
    updateUserStatusAPI({ id, email, status: action })
      .then((res) => {
        this.fetchUsers();
        message.success(`User status is updated successfully.`);
      })
      .catch((err) => {
        const errorMessager = new ErrorMessager(
          namespace.userManagement.updateUserStatusAPI,
        );
        errorMessager.triggerMsg(err.response.status);
        console.error(err);
      });
  };

  confirmDisableChange = (record) => {
    const thisComponent = this;
    Modal.confirm({
      title: 'Disable Account',
      icon: <ExclamationCircleOutlined />,
      content: (
        <>
          Are you sure you want to disable this account {record.name} (
          {record.email})?
          <br />
          This user will no longer have access to the platform.{' '}
        </>
      ),
      onOk() {
        thisComponent.updateStatus(record, 'disabled');
      },
    });
  };

  callback = (key) => {
    console.log(key);
  };

  handleMenuClick = (e, type) => {
    let filters = this.state.filters;

    filters.page = 0;
    filters.pageSize = this.state.pageSize;

    if (type === 'status') {
      if (e.key !== 'all-status') {
        filters = { ...filters, status: e.key };
      } else {
        filters = _.omit(filters, 'status');
      }

      this.setState(
        {
          filters,
          statusFilter:
            e && e.item && e.item.props && e.item.props.id
              ? e.item.props.id
              : 'All',
        },
        () => {
          this.fetchUsers();
        },
      );
    }

    if (type === 'role') {
      if (e.key !== 'all-users') {
        filters = { ...filters, role: e.key };
      } else {
        filters = _.omit(filters, 'role');
      }

      this.setState(
        {
          filters,
          roleFilter:
            e && e.item && e.item.props && e.item.props.id
              ? e.item.props.id
              : 'All',
        },
        () => {
          this.fetchUsers();
        },
      );
    }
  };

  resetFilter = () => {
    let filters = this.state.filters;

    filters.page = 0;
    filters.pageSize = 10;

    filters = _.omit(filters, ['status', 'role']);
    this.setState({ isAdminOnly: false });
    this.setState({ filters, roleFilter: 'All', statusFilter: 'All' }, () => {
      this.fetchUsers();
    });
  };

  render() {
    const { sidePanel, tableWidth, panelWidth, currentRecord } = this.state;
    const { username } = this.props;
    const routes = [
      {
        path: '/',
        breadcrumbName: 'Administrator Console',
      },
    ];

    const columns = [
      {
        title: 'Account',
        dataIndex: 'name',
        key: 'name',
        sorter: true,
        width: '20%',
        searchKey: 'name',
        render: (text) => {
          return <span style={{ wordBreak: 'break-word' }}>{text}</span>;
        },
      },
      {
        title: 'Email',
        dataIndex: 'email',
        key: 'email',
        sorter: true,
        width: '20%',
        searchKey: 'email',
      },
      {
        title: 'First Name',
        dataIndex: 'firstName',
        key: 'first_name',
        sorter: true,
        width: '10%',
        render: (text) => {
          if (text && text.length > 20) {
            return <span>{partialString(text, 20, false)}</span>;
          }
          return <span>{text}</span>;
        },
      },
      {
        title: 'Last Name',
        dataIndex: 'lastName',
        key: 'last_name',
        sorter: true,
        width: '10%',
        render: (text) => {
          if (text && text.length > 20) {
            return <span>{partialString(text, 20, false)}</span>;
          }
          return <span>{text}</span>;
        },
      },
      {
        title: 'Join Date',
        dataIndex: 'timeCreated',
        key: 'time_created',
        sorter: true,
        width: '15%',
        render: (text) => text && timeConvert(text, 'datetime'),
      },
      {
        title: 'Last Login Time',
        dataIndex: 'lastLogin',
        key: 'last_login',
        sorter: true,
        width: '15%',
        render: (text) => text && timeConvert(text, 'datetime'),
      },
      {
        title: 'Action',
        key: 'action',
        width: '5%',
        render: (text, record) => {
          const menu = (
            <Menu>
              <Menu.Item onClick={(e) => this.openUserSider(record)}>
                Profile
              </Menu.Item>
              {username !== record.name && <Menu.Divider />}

              {record.status === 'active' && username !== record.name && (
                <Menu.Item
                  style={{ color: 'red' }}
                  onClick={() => this.confirmDisableChange(record)}
                >
                  Disable Account
                </Menu.Item>
              )}
              {record.status === 'disabled' && (
                <Menu.Item onClick={() => this.updateStatus(record, 'active')}>
                  Enable Account
                </Menu.Item>
              )}
            </Menu>
          );
          return (
            <Dropdown overlay={menu} placement="bottomRight">
              <Button shape="circle">
                <MoreOutlined />
              </Button>
            </Dropdown>
          );
        },
      },
    ];

    const statusMenu = (
      <Menu onClick={(e) => this.handleMenuClick(e, 'status')}>
        <Menu.Item key="all-status">All</Menu.Item>
        <Menu.Item key="active" id="Active">
          Active
        </Menu.Item>
        <Menu.Item key="disabled" id="Disabled">
          Disabled
        </Menu.Item>
      </Menu>
    );

    const roleMenus = (
      <Menu onClick={(e) => this.handleMenuClick(e, 'role')}>
        <Menu.Item key="all-users">All</Menu.Item>
        <Menu.Item key="admin" id="Platform Administrator">
          Platform Administrator
        </Menu.Item>
        <Menu.Item key="member" id="Platform User">
          Platform User
        </Menu.Item>
      </Menu>
    );

    const searchPanel = (
      <div
        style={{
          marginLeft: 16,
        }}
      >
        <Space size="large">
          <FilterFilled />
          <div>
            <strong>Status:</strong>
            <Dropdown overlay={statusMenu}>
              <a
                className="ant-dropdown-link"
                onClick={(e) => e.preventDefault()}
                style={{ marginLeft: 10, color: 'rgba(0, 0, 0, 0.5)' }}
              >
                {this.state.statusFilter}{' '}
                <DownOutlined style={{ marginLeft: 5 }} />
              </a>
            </Dropdown>
          </div>
          <div>
            <Checkbox
              checked={this.state.isAdminOnly}
              onChange={(e) => {
                this.setState({ isAdminOnly: e.target.checked }, () => {
                  if (e.target.checked) {
                    this.handleMenuClick({ key: 'admin' }, 'role');
                  } else {
                    this.handleMenuClick({ key: 'all-users' }, 'role');
                  }
                });
              }}
            >
              Platform Administrator Only
            </Checkbox>
          </div>
          <Button onClick={this.resetFilter} size="small">
            Reset
          </Button>
        </Space>
      </div>
    );

    return (
      <StandardLayout rightContent={<UserManagementToolBar />}>
        <Switch>
          {this.state.adminView ? (
            <Route exact={false} path="/" key="users-management">
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
                          User Management
                        </span>
                      }
                      breadcrumb={{ routes }}
                      extra={[
                        <Button
                          type="primary"
                          onClick={this.openModal}
                          className="mb-2"
                        >
                          Invite User
                        </Button>,
                      ]}
                    />
                    <Card style={{ marginBottom: '20px' }}>
                      <Tabs onChange={this.callback} type="card">
                        <TabPane tab="Platform Users" key="users">
                          <div
                            ref={this.myRef}
                            style={{ display: sidePanel ? 'flex' : '' }}
                          >
                            <div
                              style={{
                                borderRight:
                                  sidePanel && '1px solid rgb(240, 240, 240)',
                                marginRight: sidePanel && '16px',
                                width: sidePanel && tableWidth,
                              }}
                            >
                              {searchPanel}
                              <SearchTable
                                columns={columns}
                                onChange={this.onChange}
                                handleReset={this.handleReset}
                                handleSearch={this.handleSearch}
                                dataSource={this.state.users}
                                totalItem={this.state.total}
                                pageSize={this.state.pageSize}
                                page={this.state.page}
                                key="userTable"
                                setClassName={(record) => {
                                  return (
                                    (record.status === 'disabled'
                                      ? 'disabled '
                                      : ' ') +
                                    (currentRecord?.id === record.id
                                      ? 'selected'
                                      : '')
                                  );
                                }}
                                style={{ marginTop: 35 }}
                              />
                            </div>
                            {sidePanel && (
                              <ScalableDetails
                                close={() => {
                                  this.toggleSidePanel();
                                  this.setState({ currentRecord: null });
                                }}
                                width={panelWidth}
                                record={currentRecord}
                                mouseDown={this.mouseDown}
                              />
                            )}
                          </div>
                        </TabPane>
                        <TabPane tab="Invitations" key="invitations">
                          <InvitationsTable tableKey="platformInvitations" />
                        </TabPane>
                      </Tabs>
                    </Card>
                  </Col>
                </Row>
              </Content>
              <InviteUserModal
                visible={this.state.modalVisible}
                onCancel={() => this.setState({ modalVisible: false })}
                inviteUserApi={inviteUserApi}
              />
            </Route>
          ) : (
            <Redirect to="/error/403" />
          )}
        </Switch>
      </StandardLayout>
    );
  }
}

export default connect(
  (state) => ({
    username: state.username,
  }),
  null,
)(UserManagement);
