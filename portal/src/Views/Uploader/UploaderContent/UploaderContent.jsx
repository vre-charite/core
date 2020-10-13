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
} from 'antd';
import {
  BarChartOutlined,
  DownOutlined,
  SortAscendingOutlined,
} from '@ant-design/icons';

import { connect } from 'react-redux';
import { AddDatasetCreator, setDatasetCreator } from '../../../Redux/actions';
import styles from './index.module.scss';
import _ from 'lodash';
import moment from 'moment';

const { Paragraph, Text } = Typography;
const { TabPane } = Tabs;
const { Content } = Layout;
const IconText = ({ icon, text }) => (
  <span style={{ color: '#1890ff' }}>
    {React.createElement(icon, { style: { marginRight: 8 } })}
    {text}
  </span>
);
const initPane = '0';

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
      sortby: 'timeCreated',
      order: 'desc',
      sortReset: false,
      pageSize: 10,
      selectedTab: 'My Projects',
    };
  }

  componentDidMount() {
    this.refresh();
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevProps.datasetList !== this.props.datasetList) {
      this.refresh();
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
    console.log('showUploaderModal -> id', id);
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
    console.log(activeKey, 'activeKey');
    this.setState({ activeTab: activeKey });
  };

  handleSortClick = (e) => {
    const sortRule = e.item.props.value;
    this.setState({ sortReset: true });

    switch (sortRule) {
      case 'time-desc':
        this.setState({ sortby: 'timeCreated', order: 'desc' });
        return;
      case 'time-asc':
        this.setState({ sortby: 'timeCreated', order: 'asc' });
        return;
      case 'name-desc':
        this.setState({ sortby: 'name', order: 'desc' });
        return;
      case 'name-asc':
        this.setState({ sortby: 'name', order: 'asc' });
        return;
      case 'code-desc':
        this.setState({ sortby: 'code', order: 'desc' });
        return;
      case 'code-asc':
        this.setState({ sortby: 'code', order: 'asc' });
        return;
      default:
        return;
    }
  };

  resetSort = () => {
    this.setState({ sortby: 'timeCreated', order: 'desc', sortReset: false });
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
    });
  };

  render() {
    const {
      uploader,
      datasetId,
      sortby,
      order,
      sortReset,
      selectedTab,
    } = this.state;
    const { datasetList: tabs = [] } = this.props;

    let projectNoPermission = [];

    let projectPermission = [];

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

    //Get projects based on selctedTags
    const allProjects = this.getProjectsWithTab({
      selectedTab,
      projectNoPermission,
      projectPermission,
    });

    const sortPanel = (
      <Menu onClick={this.handleSortClick}>
        <Menu.Item key="1" value="time-desc">
          Last created
        </Menu.Item>
        <Menu.Item key="2" value="time-asc">
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

    return (
      <>
        <Content className={`content ${styles.wrapper}`}>
          <Row>
            <Col span={12}>
              <Tabs defaultActiveKey="My Projects" onChange={this.onTabChange}>
                {this.tagsData.map((tag) => (
                  <TabPane tab={tag} key={tag} />
                ))}
              </Tabs>
            </Col>
            <Col span={12}>
              <Space style={{ float: 'right', marginBottom: '16px' }}>
                {sortReset && (
                  <Button onClick={this.resetSort}>Reset sort</Button>
                )}
                <Dropdown overlay={sortPanel} placement="bottomRight">
                  <Button>
                    <SortAscendingOutlined />
                    Sort {`${sortby && sortby.slice(0, 4)} : ${order}`}
                    <DownOutlined />
                  </Button>
                </Dropdown>
              </Space>
            </Col>
          </Row>
          {tabs.map((tab, index) => (
            <List
              itemLayout="horizontal"
              size="large"
              pagination={{
                onShowSizeChange: (current, pageSize) => {
                  this.setState({ pageSize });
                },
                pageSize: this.state.pageSize,
                showSizeChanger: true,
              }}
              key={index}
              dataSource={allProjects}
              renderItem={(item) => (
                <List.Item
                  key={item.id}
                  className={styles.card}
                  actions={[
                    (this.props.role === 'admin' ||
                      _.some(this.props.containersPermission, (o) => {
                        return parseInt(o.containerId) === parseInt(item.id);
                      })) && (
                      <Link to={`/dataset/${item.id}/canvas`}>
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
                    title={
                      <Paragraph
                        style={{
                          fontSize: '20px',
                          marginBottom: '4px',
                        }}
                        ellipsis={{
                          rows: 2,
                        }}
                      >
                        {this.props.role === 'admin' ||
                        _.some(this.props.containersPermission, (o) => {
                          return parseInt(o.containerId) === parseInt(item.id);
                        }) ? (
                          <Link to={`/dataset/${item.id}/canvas`}>
                            {item.name + ' '}
                          </Link>
                        ) : this.props.containersPermission.some(
                            (el) =>
                              parseInt(el.containerId) === parseInt(item.id),
                          ) ? (
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
                                    this.props.role === 'admin' ||
                                    _.some(
                                      this.props.containersPermission,
                                      (o) => {
                                        return (
                                          parseInt(o.containerId) ===
                                            parseInt(item.id) &&
                                          o.permission !== 'uploader' // Uploader should not enter project
                                        );
                                      },
                                    )
                                      ? 'cyan'
                                      : // : '#CCCC'
                                      this.props.containersPermission.some(
                                          (el) =>
                                            parseInt(el.containerId) ===
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

                          {/* {Object.keys(item).map((key) => {
                            return key.startsWith('_') ? (
                              <Tag
                                key={key}
                                color={
                                  this.props.role === 'admin' ||
                                  _.some(
                                    this.props.containersPermission,
                                    (o) => {
                                      return (
                                        parseInt(o.containerId) ===
                                        parseInt(item.id)
                                      );
                                    },
                                  )
                                    ? 'green'
                                    : // : '#CCCC'
                                    this.props.containersPermission.some(
                                        (el) =>
                                          parseInt(el.containerId) ===
                                          parseInt(item.id),
                                      )
                                    ? 'green'
                                    : '#CCCC'
                                }
                              >
                                {key.substr(1)}:{item[key]}
                              </Tag>
                            ) : null;
                          })} */}
                        </span>
                      </Paragraph>
                    }
                    // description={
                    //   'Created at ' +
                    //   (item.created_time
                    //     ? item.created_time
                    //     : '2020-08-22 11:45')
                    // }
                    description={
                      <>
                        <span
                          style={{
                            display: 'inline-block',
                            marginBottom: '5px',
                          }}
                        >
                          Project code: {item.code && item.code}
                          {/* Created at{' '}
                          {item.created_at
                            ? item.created_at
                            : '2020-08-22 10:45'} */}
                        </span>
                        <br />
                        <Paragraph
                          style={{
                            color: 'rgba(0,0,0,0.8)',
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
              )}
            />
          ))}
        </Content>
        {/* {uploader && (
          <UploadFileToFolder
            isShown={uploader}
            datasetId={datasetId}
            datasetList={this.props.datasetList}
            cancel={() => {
              this.handleCancelUploader();
            }}
          />
        )} */}
      </>
    );
  }
}
export default connect(
  (state) => {
    const { datasetList, containersPermission, role } = state;
    return { datasetList, containersPermission, role };
  },
  { AddDatasetCreator, setDatasetCreator },
)(Uploader);
