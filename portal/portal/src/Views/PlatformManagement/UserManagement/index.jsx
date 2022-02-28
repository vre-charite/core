import React, { Component } from 'react';
import { Redirect, Switch, Route } from 'react-router-dom';
import {
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
  Badge,
  Checkbox,
} from 'antd';
import _ from 'lodash';
import { connect } from 'react-redux';
import {
  MoreOutlined,
  ExclamationCircleOutlined,
  FilterOutlined,
  DownOutlined,
  MailOutlined,
  UserAddOutlined,
  UndoOutlined,
} from '@ant-design/icons';
import { StandardLayout } from '../../../Components/Layout';
import PlatformUsersTable from '../../../Components/Table/TableWrapper';
import {
  getPortalUsers,
  inviteUserApi,
  updateUserStatusAPI,
  getInvitationsAPI,
} from '../../../APIs';
import { setServiceRequestRedDot } from '../../../Redux/actions';
import InviteUserModal from './Components/InviteUserModal';
import { timeConvert, partialString } from '../../../Utility';
import ScalableDetails from './Components/ScalableDetails';
import InvitationsTable from '../../../Components/Table/InvitationTable';
import RequestTable from '../../../Components/Table/requestTable';
import { namespace, ErrorMessager } from '../../../ErrorMessages';
import CreateEmailModal from '../../../Components/Modals/CreateEmailModal';
import styles from './index.module.scss';
import i18n from '../../../i18n';
import { KEYCLOAK_REALM } from '../../../config';
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
      //adminView: true,
      tableWidth: '70%',
      panelWidth: 650,
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
      recordInProcess: [],
      statusFilter: 'All',
      roleFilter: 'All',
      isAdminOnly: false,
      openCreateEmailModal: false,
      totalInvitations: '',
      tabPaneKey: '',
      debounce: _.debounce(
        () => {
          this.setState({
            tableWidth: '70%',
            panelWidth: 650,
          });
        },
        1000,
        { leading: false },
      ),
    };
    this.myRef = React.createRef();
  }

  componentDidMount() {
    this.fetchUsers();
    window.addEventListener('resize', this.state.debounce);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.state.debounce);
  }

  setOpenCreateEmailModal = () => {
    this.setState({ openCreateEmailModal: true });
  };

  setCloseCreateEmailModal = () => {
    this.setState({ openCreateEmailModal: false });
  };

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
          //adminView: true,
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
          /* this.setState({
            adminView: false,
          }); */
          this.props.setAdminView(false);
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

  onChange = async (pagination, filter, sorter) => {
    let filters = {
      page: this.state.page,
      pageSize: this.state.pageSize,
      orderBy: 'time_created',
      orderType: 'desc',
      status: this.state.filters && this.state.filters.status,
      role: this.state.filters && this.state.filters.role,
    };

    const convertSortOrder = (order) => {
      if (order === 'ascend') {
        return 'asc';
      } else if (order === 'descend') {
        return 'desc';
      }
    };

    this.setState({ page: pagination.current - 1 });
    filters.page = pagination.current - 1;

    if (pagination.pageSize) {
      this.setState({ pageSize: pagination.pageSize });
      filters.pageSize = pagination.pageSize;
    }

    let searchText = [];

    if (filter.name && filter.name.length > 0) {
      searchText.push({
        key: 'name',
        value: filter.name[0],
      });

      filters['name'] = filter.name[0];
    }

    if (filter.email && filter.email.length > 0) {
      searchText.push({
        value: filter.email[0],
        key: 'email',
      });

      filters['email'] = filter.email[0];
    }

    // handle sort order
    if (sorter && sorter.order) {
      this.setState({ order: convertSortOrder(sorter.order) });

      if (sorter.columnKey) {
        filters.orderBy = sorter.columnKey;
        this.setState({ sortColumn: sorter.columnKey });
      }
      filters.orderType = convertSortOrder(sorter.order);
    }

    // handle cancle sort
    if (sorter && !sorter.order) {
      filters = {
        ...filters,
        orderBy: 'time_created',
        orderType: 'desc',
      };
    }

    this.setState({ searchText: searchText, filters }, () => {
      this.fetchUsers();
    });
  };

  openModal = () => {
    this.setState({ modalVisible: true });
  };

  fetchInvitationUsers = async () => {
    const res = await getInvitationsAPI({ filters: {} });
    this.setState({ totalInvitations: res.data.total });
  };

  toggleSidePanel = () => {
    this.setState((prev) => {
      return {
        sidePanel: !prev.sidePanel,
      };
    });
  };

  onWindowResize = () => {
    const debounce = _.debounce(
      () => {
        this.setState({
          tableWidth: '70%',
          panelWidth: 650,
        });
      },
      1000,
      { leading: false },
    );

    return debounce;
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
    const delta = mouseX - parentX; //delta is the current table width
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
    const { email } = record;
    const inList = this.state.recordInProcess.find((item) => item === email);
    if (inList) {
      return;
    }
    Modal.warning({
      title: i18n.t('modals:updateStatusTime.title'),
      content: (
        <>
          <p>
            {`${i18n.t('modals:updateStatusTime.content.0')} ${record.name}
            ${i18n.t('modals:updateStatusTime.content.1')} ${
              action === 'disable' ? 'disabled' : 'enabled'
            }${i18n.t('modals:updateStatusTime.content.2')}`}
          </p>
          <p>{i18n.t('modals:updateStatusTime.content.3')}</p>
        </>
      ),
    });
    this.setState({
      recordInProcess: [...this.state.recordInProcess, record.email],
    });
    updateUserStatusAPI({
      operationType: action,
      userRealm: KEYCLOAK_REALM,
      userGeid: null,
      userEmail: email,
      payload: {},
    })
      .then((res) => {
        this.fetchUsers();
        message.success(`User status is updated successfully.`);
      })
      .catch((err) => {
        const errorMessager = new ErrorMessager(
          namespace.userManagement.updateUserStatusAPI,
        );
        errorMessager.triggerMsg(err.response.status);
      })
      .finally(() => {
        const removedList = this.state.recordInProcess.filter(
          (item) => item !== email,
        );
        this.setState({
          recordInProcess: removedList,
        });
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
        thisComponent.updateStatus(record, 'disable');
      },
    });
  };

  setTabPaneKey = (key) => {
    this.setState({ tabPaneKey: key });
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
    const { sidePanel, tableWidth, panelWidth, currentRecord, tabPaneKey } =
      this.state;
    const { username, showRedDot } = this.props;

    let columns = [
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
                <Menu.Item onClick={() => this.updateStatus(record, 'enable')}>
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

    if (sidePanel) {
      columns = columns.filter((v) => v.key === 'name' || v.key === 'action');
    }

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

    const searchPanel = (
      <div
        style={{
          marginLeft: 27,
          display: 'flex',
          alignItems: 'center',
          marginTop: 10,
          marginBottom: 30,
        }}
      >
        <div>
          <FilterOutlined style={{ marginRight: '9px' }} />
        </div>
        <div style={{ width: '200px' }}>
          Status:
          <Dropdown overlay={statusMenu}>
            {
              // eslint-disable-next-line
              <a
                className="ant-dropdown-link"
                onClick={(e) => e.preventDefault()}
                style={{ marginLeft: 10, color: 'rgba(0, 0, 0, 0.5)' }}
              >
                <strong>{this.state.statusFilter}</strong>{' '}
                <DownOutlined style={{ marginLeft: 5 }} />
              </a>
            }
          </Dropdown>
        </div>
        <div style={{ width: '300px' }}>
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
        <div>
          <Button style={{ border: 'none' }} onClick={this.resetFilter}>
            <UndoOutlined /> Reset
          </Button>
        </div>
      </div>
    );

    const extraContent = (
      <div>
        <Button
          style={{ border: 'none' }}
          onClick={this.setOpenCreateEmailModal}
          icon={<MailOutlined style={{ verticalAlign: 'middle' }} />}
        >
          Send Email
        </Button>
        <Button
          className="mb-2"
          style={{ borderRadius: '6px', width: '125px' }}
          type="primary"
          icon={<UserAddOutlined style={{ verticalAlign: 'middle' }} />}
          onClick={this.openModal}
        >
          Invite User
        </Button>
      </div>
    );

    const titleWithRedDot = (
      <div className={styles.red_dot}>
        Resource Request <Badge status="error" />
      </div>
    );

    const titleWithoutRedDot = <div>Resource Request</div>;

    return (
      <>
        <CreateEmailModal
          visible={this.state.openCreateEmailModal}
          setOpenModal={this.setOpenCreateEmailModal}
          setCloseModal={this.setCloseCreateEmailModal}
        ></CreateEmailModal>
        <div className={styles.tab}>
          <Tabs
            style={{ borderRadius: '0px 0px 6px 6px' }}
            onChange={this.setTabPaneKey}
            tabBarExtraContent={
              tabPaneKey === 'Resource_Request' ? null : extraContent
            }
          >
            <TabPane tab="Platform Users" key="users">
              <div
                ref={this.myRef}
                style={{ display: sidePanel ? 'flex' : '' }}
              >
                <div
                  style={{
                    borderRight: sidePanel && '1px solid rgb(240, 240, 240)',
                    marginRight: sidePanel && '16px',
                    width: sidePanel && tableWidth,
                  }}
                >
                  {searchPanel}
                  <PlatformUsersTable
                    columns={columns}
                    onChange={this.onChange}
                    handleReset={this.handleReset}
                    handleSearch={this.handleSearch}
                    dataSource={this.state.users}
                    totalItem={this.state.total}
                    pageSize={this.state.pageSize}
                    pageSizeOptions={[10, 20, 50]}
                    page={this.state.page}
                    key="userTable"
                    setClassName={(record) => {
                      return (
                        (record.status === 'disabled' ? 'disabled ' : ' ') +
                        (currentRecord?.id === record.id ? 'selected' : '')
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
              <InvitationsTable
                tableKey="platformInvitations"
                totalInvitations={this.state.totalInvitations}
              />
            </TabPane>
            <TabPane
              tab={showRedDot ? titleWithRedDot : titleWithoutRedDot}
              key="Resource_Request"
            >
              <RequestTable />
            </TabPane>
          </Tabs>
        </div>
        <InviteUserModal
          visible={this.state.modalVisible}
          onCancel={() => this.setState({ modalVisible: false })}
          inviteUserApi={inviteUserApi}
          getInvitationListApi={this.fetchInvitationUsers}
        />
      </>
    );
  }
}

export default connect(
  (state) => ({
    username: state.username,
    showRedDot: state.serviceRequestRedDot.showRedDot,
  }),
  { setServiceRequestRedDot },
)(UserManagement);
