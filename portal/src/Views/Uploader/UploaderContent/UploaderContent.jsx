import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import {
  List,
  Tag,
  Tabs,
  Layout,
  Typography,
  Row,
  Button,
  Col,
  Dropdown,
  Menu,
  Space,
  Card,
  Form,
  Input,
  Select,
  DatePicker,
  Avatar,
} from 'antd';
import {
  BarChartOutlined,
  DownOutlined,
  SortAscendingOutlined,
  CaretUpOutlined,
  CaretDownOutlined,
} from '@ant-design/icons';

import { connect } from 'react-redux';
import {
  AddDatasetCreator,
  setDatasetCreator,
  setCurrentProjectProfile,
} from '../../../Redux/actions';
import { listUsersContainersPermission, getDatasetsAPI } from '../../../APIs';
import styles from './index.module.scss';
import _ from 'lodash';
import moment from 'moment';
import { convertUTCDateToLocalDate, currentBrowser } from '../../../Utility';

const { Paragraph } = Typography;
const { TabPane } = Tabs;
const { Content } = Layout;
const { RangePicker } = DatePicker;

const IconText = ({ icon, text }) => (
  <span style={{ color: '#1890ff' }}>
    {React.createElement(icon, { style: { marginRight: 8 } })}
    {text}
  </span>
);
const initPane = '0';
const formRef = React.createRef();

class Uploader extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentDataset: null,
      addContainerModal: false,
      rawDatsets: [],
      filteredDatasets: [],
      isLoading: true,
      activeTab: initPane,
      uploader: false,
      datasetId: null,
      sortby: 'time_created',
      order: 'desc',
      sortReset: false,
      pageSize: 10,
      page: 0,
      selectedTab: 'My Projects',
      isSearch: false,
      filters: {},
      allProjects: [],
      myProjects: [],
      allNums: 0,
      myNums: 0,
      params: {
        order_by: 'time_created',
        order_type: 'desc',
        page: 0,
        page_size: 10,
      },
    };
  }

  getProjectList = (params, filters, selectedTab = null) => {
    if (Object.keys(filters) && Object.keys(filters).length)
      params['end_params'] = filters;

    if (selectedTab === 'My Projects') {
      listUsersContainersPermission(this.props.username, params).then((res) => {
        let { code, result, total } = res.data;
        if (code === 200) {
          this.setState({ myProjects: result, myNums: total });
        }
      });
    } else if (selectedTab === 'All Projects') {
      params = { ...params, ...filters, type: 'usecase' };

      getDatasetsAPI(params).then((res) => {
        const { code, result, total } = res.data;

        if (code === 200) {
          this.setState({ allProjects: result, allNums: total });
        }
      });
    } else {
      listUsersContainersPermission(this.props.username, params).then((res) => {
        let { code, result, total } = res.data;
        if (code === 200) {
          this.setState({ myProjects: result, myNums: total });
        }
      });

      params = { ...params, ...filters, type: 'usecase' };
      getDatasetsAPI(params).then((res) => {
        const { code, result, total } = res.data;

        if (code === 200) {
          this.setState({ allProjects: result, allNums: total });
        }
      });
    }
  };

  componentDidMount() {
    this.refresh();

    const params = {
      order_by: 'time_created',
      order_type: 'desc',
      page: 0,
      page_size: 10,
    };

    this.getProjectList(params, {});
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevProps.datasetList !== this.props.datasetList) {
      this.refresh();
      const params = {
        order_by: 'time_created',
        order_type: 'desc',
        page: 0,
        page_size: 10,
      };

      this.getProjectList(params, {});
    }
  }

  refresh = () => {
    this.setState({
      rawDatsets: this.props.datasetList
        ? this.props.datasetList.map((item) => ({ ...item, star: false }))
        : [],
      filteredDatasets: this.props.datasetList
        ? this.props.datasetList.map((item) => ({ ...item, star: false }))
        : [],
      isLoading: this.props.datasetList === null,
    });
  };

  setDataset = (list) => {
    this.setState({
      filteredDatasets: list,
    });
  };

  showPreviewModal = (id) => {
    const { rawDatsets } = this.state;
    this.setState({
      datasetPreviewModal: true,
      currentDataset: rawDatsets.filter((dataset) => dataset.id === id)[0],
    });
  };

  showContainerModal = ({ key }) => {
    this.setState({
      container: true,
    });
  };

  showDatasetModal = (id) => {
    const { rawDatsets } = this.state;
    this.setState({
      datasetPreviewModal: true,
      currentDataset: rawDatsets.filter((dataset) => dataset.id === id)[0],
    });
  };

  showUploaderModal = (id) => {
    this.setState({
      uploader: true,
      datasetId: id,
    });
  };

  handleCancelUploader = () => {
    this.setState({ uploader: false });
  };

  handleCancelDataset = () => {
    this.setState({ datasetPreviewModal: false });
  };

  handleCancelInclude = () => {
    this.setState({ includeModal: false });
  };

  handleCancelContainer = () => {
    this.setState({ container: false });
  };

  toggleStar = (id) => {
    const { rawDatsets, filteredDatasets } = this.state;
    const newRawDatasets = rawDatsets.map((item) => {
      if (item.id === id) {
        return { ...item, star: !item.star };
      } else {
        return item;
      }
    });
    const newFilteredDatasets = filteredDatasets.map((item) => {
      if (item.id === id) {
        return { ...item, star: !item.star };
      } else {
        return item;
      }
    });
    this.setState({
      rawDatsets: newRawDatasets,
      filteredDatasets: newFilteredDatasets,
    });
  };

  remove = (targetKey) => {
    targetKey = parseInt(targetKey);
    let activeKey = parseInt(this.state.activeTab);
    let lastIndex;
    this.props.datasetList.forEach((pane, i) => {
      if (pane.key === targetKey) {
        lastIndex = i - 1;
      }
    });
    const panes = this.props.datasetList.filter(
      (pane) => pane.key !== targetKey,
    );
    if (panes.length && activeKey === targetKey) {
      if (lastIndex >= 0) {
        activeKey = panes[lastIndex].key;
      } else {
        activeKey = panes[0].key;
      }
    }

    this.props.setDatasetCreator(panes);
    this.setState({ activeTab: activeKey.toString() });
  };

  onEdit = (targetKey, action) => {
    this[action](targetKey);
  };

  changeTab = (activeKey) => {
    this.setState({ activeTab: activeKey });
  };

  handleSortClick = (e) => {
    const sortRule = e.item.props.value;
    this.setState({ sortReset: true });

    let params = this.state.params;

    switch (sortRule) {
      case 'time-desc':
        this.setState({ sortby: 'time_created', order: 'desc' });

        params['order_by'] = 'time_created';
        params['order_type'] = 'desc';

        break;
      case 'time-asc':
        this.setState({ sortby: 'time_created', order: 'asc' });

        params['order_by'] = 'time_created';
        params['order_type'] = 'asc';

        break;
      case 'name-desc':
        this.setState({ sortby: 'name', order: 'desc' });

        params['order_by'] = 'name';
        params['order_type'] = 'desc';

        break;
      case 'name-asc':
        this.setState({ sortby: 'name', order: 'asc' });

        params['order_by'] = 'name';
        params['order_type'] = 'asc';

        break;
      case 'code-desc':
        this.setState({ sortby: 'code', order: 'desc' });

        params['order_by'] = 'code';
        params['order_type'] = 'desc';

        break;
      case 'code-asc':
        this.setState({ sortby: 'code', order: 'asc' });

        params['order_by'] = 'code';
        params['order_type'] = 'asc';

        break;
      default:
        break;
    }

    params['page'] = this.state.page;
    params['page_size'] = this.state.pageSize;
    this.getProjectList(params, this.state.filters);
  };

  resetSort = () => {
    this.setState({ sortby: 'time_created', order: 'desc', sortReset: false });

    let params = this.state.params;
    params['order_by'] = 'time_created';
    params['order_type'] = 'desc';
    params['page'] = this.state.page;
    params['page_size'] = this.state.pageSize;
    this.getProjectList(params, this.state.filters);
  };

  tagsData = ['My Projects', 'All Projects'];

  getProjectsWithTab = ({ selectedTab, ...rest }) => {
    const { projectNoPermission, projectPermission } = rest;

    if (selectedTab === 'All Projects') {
      return _.uniq([...projectPermission, ...projectNoPermission]);
    } else if (selectedTab === 'My Projects') {
      return projectPermission;
    } //And more
  };

  onTabChange = (tabkey) => {
    this.setState({
      selectedTab: tabkey,
      page: 0,
    });
  };

  onToggleSearchPanel = () => {
    this.setState({ isSearch: !this.state.isSearch });
  };

  onFinish = (values) => {
    const filters = {};

    for (const key in values) {
      if (values[key]) {
        filters[key] = values[key];
      }
    }

    this.setState({ filters });

    const params = {
      order_by: 'time_created',
      order_type: 'desc',
      page: 0,
      page_size: 10,
    };

    let params4All = { ...params, type: 'usecase' };

    if (Object.keys(filters) && Object.keys(filters).length)
      params['end_params'] = filters;

    params4All = { ...params4All, ...filters };

    if (filters['date']) {
      filters['date'][0] = moment(filters['date'][0]).startOf('day');
      filters['date'][1] = moment(filters['date'][1]).endOf('day');

      params['end_params']['create_time_start'] = filters['date'][0].unix();
      params['end_params']['create_time_end'] = filters['date'][1].unix();

      params4All['create_time_start'] = filters['date'][0].unix();
      params4All['create_time_end'] = filters['date'][1].unix();

      delete params['end_params']['date'];
      delete params4All['date'];
    }

    listUsersContainersPermission(this.props.username, params).then((res) => {
      const { code, result, total } = res.data;

      if (code === 200) {
        this.setState({ myProjects: result, myNums: total });
      }
    });
    getDatasetsAPI(params4All).then((res) => {
      const { code, result, total } = res.data;

      if (code === 200) {
        this.setState({ allProjects: result, allNums: total });
      }
    });
  };

  onTagClose = (key, value) => {
    let filters = this.state.filters;

    if (!value) {
      filters = _.omit(filters, key);
      this.setState({ filters });
    } else {
      let tags = filters.tags;
      tags = _.remove(tags, (el) => el === value);
      this.setState({ filter: { ...filters, tags } });
    }
  };

  onPageChange = (page) => {
    this.setState({ page: page - 1 });

    const params = {
      order_by: this.state.sortby,
      order_type: this.state.order,
      page: page - 1,
      page_size: this.state.pageSize,
    };

    this.getProjectList(params, this.state.filters, this.state.selectedTab);
  };

  render() {
    const { sortby, order, sortReset, selectedTab, filters } = this.state;
    let { myProjects } = this.state;

    if (Object.keys(filters))
      formRef.current && formRef.current.setFieldsValue(filters);

    let projectNoPermission = [];

    let projectPermission = [];

    /* eslint-disable */
    let filtersNameText = null;
    let filtersCodeText = null;
    let filtersDateText = null;
    let filtersTagText = null;
    let filtersDescriptionText = null;
    /* eslint-enable */

    if (
      this.props.datasetList &&
      this.props.datasetList[0] &&
      this.props.datasetList[0]['datasetList'] &&
      this.props.containersPermission
    ) {
      this.props.datasetList[0]['datasetList'].forEach((dataset) => {
        const current = moment();
        this.props.containersPermission.forEach((contPremission) => {
          let isNew = false;
          if (moment(dataset['timeCreated']).add(3, 'hours') > current)
            isNew = true;
          dataset.isNew = isNew;
          if (contPremission['containerId'] === dataset.id) {
            projectPermission.push(dataset);
          } else if (dataset.discoverable) {
            projectNoPermission.push(dataset);
          } //if discoverable if true and user don't have access, it will be abandomed //Will remove once backend removes the undiscoverable projects
        });
      });

      if (this.props.containersPermission.length === 0) {
        this.props.datasetList[0]['datasetList'].forEach((dataset) => {
          if (dataset.discoverable) projectNoPermission.push(dataset);
        });
      }
    }
    projectNoPermission = _.uniq([...projectNoPermission]);
    projectNoPermission = _.orderBy(projectNoPermission, [sortby], [order]);

    projectPermission = _.uniq([...projectPermission]);
    projectPermission = _.orderBy(projectPermission, [sortby], [order]);

    for (const key in filters) {
      if (filters[key]) {
        if (key === 'name') {
          projectPermission = projectPermission.filter((el) =>
            el.name.toLowerCase().includes(filters['name'].toLowerCase()),
          );
          projectNoPermission = projectNoPermission.filter((el) =>
            el.name.toLowerCase().includes(filters['name'].toLowerCase()),
          );

          filtersNameText = (
            <div>
              <span>Project Name:</span>
              <Tag
                style={{ marginLeft: 5 }}
                color="cyan"
                key="name"
                // closable
                // onClose={() => this.onTagClose('name', null)}
              >
                {filters[key]}
              </Tag>
            </div>
          );
        }

        if (key === 'code') {
          projectPermission = projectPermission.filter((el) =>
            el.code.toLowerCase().includes(filters['code'].toLowerCase()),
          );
          projectNoPermission = projectNoPermission.filter((el) =>
            el.code.toLowerCase().includes(filters['code'].toLowerCase()),
          );

          filtersCodeText = (
            <div>
              <span>Project Code:</span>
              <Tag style={{ marginLeft: 5 }} color="cyan" key="code">
                {filters[key]}
              </Tag>
            </div>
          );
        }

        if (key === 'date') {
          const dateRange = filters['date'];
          projectPermission = projectPermission.filter((el) => {
            return (
              moment(convertUTCDateToLocalDate(el.timeCreated)) >=
                moment(dateRange[0]).startOf('day') &&
              moment(convertUTCDateToLocalDate(el.timeCreated)) <=
                moment(dateRange[1]).endOf('day')
            );
          });
          projectNoPermission = projectNoPermission.filter((el) => {
            return (
              moment(convertUTCDateToLocalDate(el.timeCreated)) >=
                moment(dateRange[0]).startOf('day') &&
              moment(convertUTCDateToLocalDate(el.timeCreated)) <=
                moment(dateRange[1]).endOf('day')
            );
          });

          filtersDateText = (
            <div>
              <span>Created Time:</span>
              <Tag
                style={{ marginLeft: 5 }}
                color="cyan"
                key="date"
                // closable
                // onClose={() => this.onTagClose('date', null)}
              >
                {`${moment(dateRange[0]).format('YYYY-MM-DD')} - ${moment(
                  dateRange[1],
                ).format('YYYY-MM-DD')}`}
              </Tag>
            </div>
          );
        }

        if (key === 'tags') {
          const tags = filters['tags'];

          if (tags.length > 0) {
            filtersTagText = (
              <div>
                <span>Tags:</span>
                {tags.map((tag) => (
                  <Tag
                    style={{ marginLeft: 5 }}
                    color="cyan"
                    key={tag}
                    // closable
                    // onClose={() => this.onTagClose('tags', tag)}
                  >
                    {tag}
                  </Tag>
                ))}
              </div>
            );
            // eslint-disable-next-line
            projectPermission = projectPermission.filter((el) => {
              let isMatch = false;

              for (const tag of tags) {
                isMatch = el.tags && el.tags.some((item) => item === tag);

                if (isMatch) return true;
              }
            });
            // eslint-disable-next-line
            projectNoPermission = projectNoPermission.filter((el) => {
              let isMatch = false;

              for (const tag of tags) {
                isMatch = el.tags && el.tags.some((item) => item === tag);

                if (isMatch) return true;
              }
            });
          }
        }

        if (key === 'description') {
          projectPermission = projectPermission.filter(
            (el) =>
              el.description &&
              el.description
                .toLowerCase()
                .includes(filters['description'].toLowerCase()),
          );
          projectNoPermission = projectNoPermission.filter(
            (el) =>
              el.description &&
              el.description
                .toLowerCase()
                .includes(filters['description'].toLowerCase()),
          );

          filtersDescriptionText = (
            <div>
              <span>description:</span>
              <Tag style={{ marginLeft: 5 }} color="cyan" key="description">
                {filters[key]}
              </Tag>
            </div>
          );
        }
      }
    }

    //Get projects based on selctedTags

    const sortPanel = (
      <Menu onClick={this.handleSortClick}>
        <Menu.Item key="1" value="time-desc">
          Last created
        </Menu.Item>
        <Menu.Item id="uploadercontent_first_created" key="2" value="time-asc">
          First Created
        </Menu.Item>
        <Menu.Item key="3" value="name-asc">
          Project name A to Z
        </Menu.Item>
        <Menu.Item key="4" value="name-desc">
          Project name Z to A
        </Menu.Item>
        <Menu.Item key="5" value="code-asc">
          Project code A to Z
        </Menu.Item>
        <Menu.Item key="6" value="code-desc">
          Project code Z to A
        </Menu.Item>
      </Menu>
    );

    const disabledDate = (current) => {
      return current && current >= moment().endOf('day');
    };

    const SearchPanel = (
      <Card
      // title="Search"
      >
        <Form ref={formRef} onFinish={this.onFinish} initialValues={filters}>
          <Row>
            <Col span={5}>Project Name</Col>
            <Col span={5} style={{ paddingLeft: 5 }}>
              Project Code
            </Col>
            <Col span={7} style={{ paddingLeft: 8 }}>
              Created Time
            </Col>
            <Col span={7} style={{ paddingLeft: 14 }}>
              Tags
            </Col>
          </Row>

          <Row gutter={24} style={{ marginTop: 10 }}>
            <Col span={5}>
              <Form.Item name="name">
                <Input placeholder="Project Name" />
              </Form.Item>
            </Col>

            <Col span={5}>
              <Form.Item name="code">
                <Input placeholder="Project Code" />
              </Form.Item>
            </Col>

            <Col span={7}>
              <Form.Item name="date">
                <RangePicker disabledDate={disabledDate} />
              </Form.Item>
            </Col>

            <Col span={7} style={{ float: 'left' }}>
              <Form.Item
                name="tags"
                rules={[
                  {
                    pattern: new RegExp(/^\S*$/), // Format BXT-1234
                    message: 'Tag should not contain space.',
                  },
                ]}
              >
                <Select mode="tags" showSearch></Select>
              </Form.Item>
            </Col>
          </Row>

          <Row>
            <Col span={12}>Description</Col>
          </Row>

          <Row gutter={24} style={{ marginTop: 10 }}>
            <Col span={12}>
              <Form.Item name="description" style={{ marginBottom: 0 }}>
                <Input style={{ maxWidth: 380 }} placeholder="Description" />
              </Form.Item>
            </Col>
            <Col
              span={12}
              style={{
                textAlign: 'right',
              }}
            >
              <Space>
                <Button type="primary" htmlType="submit">
                  Search
                </Button>
                <Button
                  style={{
                    margin: '0 8px',
                  }}
                  onClick={() => {
                    this.setState({ filters: {} });
                    formRef.current.resetFields();
                    formRef.current.setFieldsValue({
                      name: undefined,
                      code: undefined,
                      date: undefined,
                      tags: undefined,
                      description: undefined,
                    });

                    const params = {
                      order_by: 'time_created',
                      order_type: 'desc',
                      page: 0,
                      page_size: this.state.pageSize,
                    };

                    this.getProjectList(params, {});
                  }}
                >
                  Clear
                </Button>
              </Space>
            </Col>
          </Row>

          <Row>
            <Col span={24}></Col>
          </Row>
        </Form>
      </Card>
    );

    const isSafari = currentBrowser();

    return (
      <>
        <Content className={`content ${styles.wrapper}`}>
          <Row>
            <Col span={12}>
              <Space style={{ float: 'left', marginBottom: '16px' }}>
                <Button onClick={this.onToggleSearchPanel}>
                  Search Panel
                  {this.state.isSearch ? (
                    <CaretUpOutlined />
                  ) : (
                    <CaretDownOutlined />
                  )}
                </Button>
              </Space>
            </Col>
            <Col span={12}>
              <Space style={{ float: 'right', marginBottom: '16px' }}>
                {sortReset && (
                  <Button onClick={this.resetSort}>Reset sort</Button>
                )}
                <Dropdown overlay={sortPanel} placement="bottomRight">
                  <Button id="uploadercontent_dropdown">
                    <SortAscendingOutlined />
                    Sort {`${sortby && sortby.slice(0, 4)} : ${order}`}
                    <DownOutlined />
                  </Button>
                </Dropdown>
              </Space>
            </Col>
          </Row>

          {this.state.isSearch ? SearchPanel : null}

          {Object.keys(filters) && Object.keys(filters).length ? (
            <div id="filters" style={{ marginTop: 20 }}>
              <strong>
                {this.state.selectedTab === 'My Projects'
                  ? `${
                      this.state.myNums > 1
                        ? `${this.state.myNums} projects`
                        : `${this.state.myNums} project`
                    }`
                  : `${
                      this.state.allNums > 1
                        ? `${this.state.allNums} projects`
                        : `${this.state.allNums} project`
                    }`}
                {`   `}
                found
              </strong>
            </div>
          ) : null}

          <Tabs
            id="uploadercontent_tabs"
            defaultActiveKey="My Projects"
            onChange={this.onTabChange}
            style={{ marginTop: 10 }}
          >
            {this.tagsData.map((tag) => (
              <TabPane tab={tag} key={tag} />
            ))}
          </Tabs>
          <List
            id="uploadercontent_project_list"
            itemLayout="horizontal"
            size="large"
            pagination={{
              onShowSizeChange: (current, pageSize) => {
                this.setState({ pageSize });
                let params = this.state.params;
                params['page_size'] = pageSize;
                params['page'] = current - 1;

                this.getProjectList(params, this.state.filters);
              },
              pageSize: this.state.pageSize,
              pageSizeOptions: ['10', '20', '50'],
              showSizeChanger: true,
              total:
                selectedTab === 'My Projects'
                  ? this.state.myNums
                  : this.state.allNums,
              onChange: this.onPageChange,
            }}
            key={'project_list'}
            dataSource={
              selectedTab === 'My Projects'
                ? myProjects
                : this.state.allProjects
            }
            renderItem={(item) => {
              return (
                <List.Item
                  id={`uploader_content_${item?.code}`}
                  key={item.id}
                  className={styles.card}
                  actions={[
                    (selectedTab === 'My Projects' ||
                      this.props.role === 'admin' ||
                      _.some(this.props.containersPermission, (o) => {
                        return parseInt(o.id) === parseInt(item.id);
                      })) && (
                      <Link
                        to={`/project/${item.id}/canvas`}
                        onClick={() =>
                          this.props.setCurrentProjectProfile(item)
                        }
                      >
                        <IconText
                          icon={BarChartOutlined}
                          text="View"
                          key="access"
                        />
                      </Link>
                    ),
                  ]}
                >
                  <List.Item.Meta
                    avatar={
                      item.icon ? (
                        <Avatar src={item.icon} size={30}></Avatar>
                      ) : (
                        <Avatar
                          style={{
                            backgroundColor: '#13c2c2',
                            verticalAlign: 'middle',
                          }}
                          size={30}
                        >
                          <span
                            style={{
                              fontSize: 20,
                              fontWeight: 'bold',
                              textTransform: 'uppercase',
                            }}
                          >
                            {item.name ? item.name.charAt(0) : ''}
                          </span>
                        </Avatar>
                      )
                    }
                    title={
                      <Paragraph
                        style={{
                          fontSize: '20px',
                          marginBottom: '4px',
                          maxWidth: 875,
                          overflowWrap: 'break-word',
                          wordBreak: 'break-all',
                        }}
                        ellipsis={{
                          rows: 2,
                        }}
                      >
                        {selectedTab === 'My Projects' ||
                        this.props.role === 'admin' ||
                        _.some(this.props.containersPermission, (o) => {
                          return parseInt(o.id) === parseInt(item.id);
                        }) ? (
                          <Link
                            to={`/project/${item.id}/canvas`}
                            onClick={() =>
                              this.props.setCurrentProjectProfile(item)
                            }
                          >
                            {item.name + ' '}
                          </Link>
                        ) : this.props.containersPermission.some(
                            (el) => parseInt(el.id) === parseInt(item.id),
                          ) ? (
                          // eslint-disable-next-line
                          <a href="#" style={{ pointerEvents: 'none' }}>
                            {item.name}
                          </a>
                        ) : (
                          <span>{item.name}</span>
                        )}
                        <span
                          style={{
                            marginLeft: '20px',
                            position: 'relative',
                            top: '-3px',
                          }}
                        >
                          {item.tags
                            ? item.tags.map((i) => (
                                <Tag
                                  key={i}
                                  color={
                                    selectedTab === 'My Projects' ||
                                    this.props.role === 'admin' ||
                                    _.some(
                                      this.props.containersPermission,
                                      (o) => {
                                        return (
                                          parseInt(o.id) ===
                                            parseInt(item.id) &&
                                          o.permission !== 'uploader' // Uploader should not enter project
                                        );
                                      },
                                    )
                                      ? 'cyan'
                                      : // : '#CCCC'
                                      this.state.myProjects.some(
                                          (el) =>
                                            parseInt(el.id) ===
                                            parseInt(item.id),
                                        )
                                      ? 'cyan'
                                      : '#CCCC'
                                  }
                                >
                                  {i}
                                </Tag>
                              ))
                            : null}
                        </span>
                      </Paragraph>
                    }
                    description={
                      <>
                        <span
                          style={{
                            display: 'inline-block',
                            marginBottom: '5px',
                          }}
                        >
                          Project code: {item.code}
                        </span>
                        <br />
                        <Paragraph
                          style={{
                            color: 'rgba(0,0,0,0.8)',
                            maxWidth: 875,
                            overflowWrap: 'break-word',
                            wordBreak: 'break-all',
                          }}
                          ellipsis={{
                            rows: 3,
                            expandable: true,
                          }}
                        >
                          {item.description
                            ? item.description
                            : 'no description'}
                        </Paragraph>
                      </>
                    }
                  />
                  <div></div>
                </List.Item>
              );
            }}
          />
        </Content>
      </>
    );
  }
}
export default connect(
  (state) => {
    const { datasetList, containersPermission, role, username } = state;
    return { datasetList, containersPermission, role, username };
  },
  { AddDatasetCreator, setDatasetCreator, setCurrentProjectProfile },
)(Uploader);
