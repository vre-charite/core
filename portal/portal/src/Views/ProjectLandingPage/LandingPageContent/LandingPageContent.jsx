import React, { Component } from 'react';
import { listUsersContainersPermission, getDatasetsAPI } from '../../../APIs';
import { connect } from 'react-redux';
import {
  List,
  Tag,
  Tabs,
  Layout,
  Typography,
  Button,
  Dropdown,
  Menu,
  Card,
  Form,
  Input,
  Select,
  DatePicker,
} from 'antd';
import {
  UpOutlined,
  DownOutlined,
  SortAscendingOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import {
  AddDatasetCreator,
  setDatasetCreator,
  setCurrentProjectProfile,
} from '../../../Redux/actions';
import NewProjectPanel from './newProjectPanel';
import styles from './index.module.scss';
import _ from 'lodash';
import moment from 'moment';
import { convertUTCDateToLocalDate } from '../../../Utility';
import ProjectItemCard from '../Components/ProjectItemCard/ProjectItemCard';

const { TabPane } = Tabs;
const { RangePicker } = DatePicker;

const initPane = '0';
const formRef = React.createRef();

class LandingPageContent extends Component {
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
      pageSize: 10,
      page: 0,
      selectedTab: 'My Projects',
      isSearch: false,
      createNewProject: false,
      filters: {},
      allProjects: [],
      myProjects: [],
      myProjectsLoading: false,
      allProjectsLoading: false,
      allNums: 0,
      myNums: 0,
    };
  }

  getProjectList = (params, filters, selectedTab = null) => {
    if (Object.keys(filters) && Object.keys(filters).length)
      params['end_params'] = filters;

    if (selectedTab === 'My Projects') {
      this.setState({
        myProjectsLoading: true,
      });
      listUsersContainersPermission(this.props.username, params).then((res) => {
        let { code, result, total } = res.data;
        if (code === 200) {
          this.setState({
            myProjects: result,
            myNums: total,
            myProjectsLoading: false,
          });
        }
      });
    } else if (selectedTab === 'All Projects') {
      params = { ...params, ...filters };

      getDatasetsAPI(params).then((res) => {
        const { code, result, total } = res.data;
        this.setState({
          allProjectsLoading: true,
        });
        if (code === 200) {
          this.setState({
            allProjects: result,
            allNums: total,
            allProjectsLoading: false,
          });
        }
      });
    } else {
      this.setState({
        myProjectsLoading: true,
      });
      listUsersContainersPermission(this.props.username, params).then((res) => {
        let { code, result, total } = res.data;
        if (code === 200) {
          this.setState({
            myProjects: result,
            myNums: total,
            myProjectsLoading: false,
          });
        }
      });

      params = { ...params, ...filters };
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
    let params = {};

    switch (sortRule) {
      case 'time-desc':
        params['order_by'] = 'time_created';
        params['order_type'] = 'desc';
        break;
      case 'time-asc':
        params['order_by'] = 'time_created';
        params['order_type'] = 'asc';

        break;
      case 'name-desc':
        params['order_by'] = 'name';
        params['order_type'] = 'desc';

        break;
      case 'name-asc':
        params['order_by'] = 'name';
        params['order_type'] = 'asc';
        break;
      case 'code-desc':
        params['order_by'] = 'code';
        params['order_type'] = 'desc';

        break;
      case 'code-asc':
        params['order_by'] = 'code';
        params['order_type'] = 'asc';

        break;
      default:
        break;
    }

    params['page'] = this.state.page;
    params['page_size'] = this.state.pageSize;
    this.setState({
      sortby: params['order_by'],
      order: params['order_type'],
      page: params['page'],
      pageSize: params['page_size'],
    });
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

  onToggleCreateNewProject = () => {
    this.setState({ createNewProject: !this.state.createNewProject });
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
      order_by: this.state.orderBy ? this.state.orderBy : 'time_created',
      order_type: this.state.order ? this.state.order : 'desc',
      page: 0,
      page_size: 10,
    };

    let params4All = { ...params };

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
    this.setState({
      myProjectsLoading: true,
      allProjectsLoading: true,
    });
    listUsersContainersPermission(this.props.username, params).then((res) => {
      const { code, result, total } = res.data;

      if (code === 200) {
        this.setState({
          myProjects: result,
          myNums: total,
          myProjectsLoading: false,
        });
      }
    });
    getDatasetsAPI(params4All).then((res) => {
      const { code, result, total } = res.data;

      if (code === 200) {
        this.setState({
          allProjects: result,
          allNums: total,
          allProjectsLoading: false,
        });
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
  projectListRender = () => {
    return (
      <div style={{ margin: '20px 50px 50px' }}>
        <List
          id="uploadercontent_project_list"
          itemLayout="horizontal"
          size="large"
          loading={
            this.state.selectedTab === 'My Projects'
              ? this.state.myProjectsLoading
              : this.state.allProjectsLoading
          }
          pagination={{
            onShowSizeChange: (current, pageSize) => {
              this.setState({ pageSize, page: 0 });
              let params = {
                order_by: this.state.sortby,
                order_type: this.state.order,
                page: 0,
                page_size: pageSize,
              };
              this.getProjectList(params, this.state.filters);
            },
            pageSize: this.state.pageSize,
            pageSizeOptions: ['10', '20', '50'],
            showSizeChanger: true,
            total:
              this.state.selectedTab === 'My Projects'
                ? this.state.myNums
                : this.state.allNums,
            onChange: this.onPageChange,
          }}
          key={'project_list'}
          dataSource={
            this.state.selectedTab === 'My Projects'
              ? this.state.myProjects
              : this.state.allProjects
          }
          renderItem={(item) => {
            const permission = this.props.containersPermission.find(
              (v) => v.code === item.code,
            );
            return (
              <ProjectItemCard
                item={item}
                currentRole={permission ? permission.permission : null}
                platformRole={this.props.role}
              />
            );
          }}
        />
      </div>
    );
  };
  render() {
    const { sortby, order, filters } = this.state;

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
              <Tag style={{ marginLeft: 5 }} color="cyan" key="name">
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
                  <Tag style={{ marginLeft: 5 }} color="cyan" key={tag}>
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
          First created
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
      <Card className={styles.searchCard}>
        <Form ref={formRef} onFinish={this.onFinish} initialValues={filters}>
          <div className={styles.firstInputLine}>
            <div style={{ width: '30%' }}>
              <p>Project Name</p>
              <Form.Item name="name" style={{ width: '100%' }}>
                <Input placeholder="Project Name" />
              </Form.Item>
            </div>
            <div style={{ width: '10%' }}>
              <p>Project Code</p>
              <Form.Item name="code" style={{ width: '100%' }}>
                <Input placeholder="Project Code" />
              </Form.Item>
            </div>
            <div style={{ width: '20%' }}>
              <p>Created Time</p>
              <Form.Item name="date">
                <RangePicker
                  disabledDate={disabledDate}
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </div>
            <div style={{ width: '35%' }}>
              <p>Tags</p>
              <Form.Item
                name="tags"
                rules={[
                  {
                    pattern: new RegExp(/^\S*$/), // Format BXT-1234
                    message: 'Tag should not contain space.',
                  },
                ]}
                style={{ width: '100%' }}
              >
                <Select mode="tags" showSearch></Select>
              </Form.Item>
            </div>
          </div>
          <div className={styles.secondInputLine}>
            <div style={{ flex: 1 }}>
              <p>Description</p>
              <Form.Item name="description" style={{ marginBottom: 0 }}>
                <Input style={{ width: '100%' }} placeholder="Description" />
              </Form.Item>
            </div>
            <div
              style={{ width: '216px', textAlign: 'right', marginRight: '1%' }}
            >
              <Button
                type="primary"
                htmlType="submit"
                style={{ width: '112px' }}
              >
                <SearchOutlined /> Search
              </Button>
              <Button
                style={{ border: 'none' }}
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
                  this.setState({ isSearch: false });
                }}
              >
                <span style={{ color: '#1790FA' }}>Cancel</span>
              </Button>
            </div>
          </div>
        </Form>
      </Card>
    );

    const extraContent1 = (
      <div>
        <p style={{ display: 'inline-block', marginRight: '10px' }}>Sort by</p>
        <Dropdown overlay={sortPanel} placement="bottomRight">
          <Button id="uploadercontent_dropdown" style={{ borderRadius: '6px' }}>
            <SortAscendingOutlined />
            Sort {`${sortby && sortby.slice(0, 4)} : ${order}`}
            <DownOutlined />
          </Button>
        </Dropdown>
        {this.state.isSearch ? (
          <Button
            onClick={this.onToggleSearchPanel}
            style={{ backgroundColor: '#F0F0F0' }}
          >
            <SearchOutlined />
            <DownOutlined />
          </Button>
        ) : (
          <Button onClick={this.onToggleSearchPanel}>
            <SearchOutlined />
            <UpOutlined />
          </Button>
        )}
        {this.props.role === 'admin' ? (
          <Button
            style={{ border: 'none' }}
            onClick={() => {
              this.setState({ isSearch: false }, () => {
                this.onToggleCreateNewProject();
              });
            }}
          >
            <p
              style={{
                color: '#1890FF',
                fontWeight: '600',
              }}
            >
              <span
                style={{
                  marginRight: '5px',
                  fontSize: '18px',
                }}
              >
                +
              </span>
              <span>New Project</span>
            </p>
          </Button>
        ) : null}
      </div>
    );

    return (
      <div
        style={{
          marginLeft: 0,
          marginRight: 25,
          marginTop: 25,
          position: 'relative',
        }}
      >
        <Tabs
          className={styles.tab}
          tabBarExtraContent={
            this.state.createNewProject ? null : extraContent1
          }
          onChange={this.onTabChange}
          defaultActiveKey="My Projects"
        >
          <TabPane tab="My Projects" key="My Projects">
            {this.state.isSearch ? <div style={{ height: 208 }}></div> : null}
            {this.state.createNewProject ? (
              <NewProjectPanel
                onToggleCreateNewProject={this.onToggleCreateNewProject}
              />
            ) : null}
            {this.projectListRender()}
          </TabPane>
          <TabPane tab="All Projects" key="All Projects">
            {this.state.isSearch ? <div style={{ height: 208 }}></div> : null}
            {this.state.createNewProject ? (
              <NewProjectPanel
                onToggleCreateNewProject={this.onToggleCreateNewProject}
              />
            ) : null}
            {this.projectListRender()}
          </TabPane>
        </Tabs>
        {this.state.isSearch ? SearchPanel : null}
      </div>
    );
  }
}
export default connect(
  (state) => {
    const { datasetList, containersPermission, role, username } = state;
    return { datasetList, containersPermission, role, username };
  },
  {
    AddDatasetCreator,
    setDatasetCreator,
    setCurrentProjectProfile,
  },
)(LandingPageContent);
