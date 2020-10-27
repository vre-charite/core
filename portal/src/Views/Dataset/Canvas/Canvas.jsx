import React, { Component } from 'react';
import { Row, Spin, Col, Modal, Layout, Button, PageHeader } from 'antd';
import { withRouter, Link } from 'react-router-dom';

import BasicCard from '../../../Components/Cards/BasicCard';
import getCard from './getCard';
import fakeLayout from './fakeLayout';
import DragArea from './DragArea/DragArea';
import _ from 'lodash';
import { connect } from 'react-redux';
import { AddDatasetCreator } from '../../../Redux/actions';
import { getChildrenDataset } from '../../../APIs';
import { namespace, ErrorMessager } from '../../../ErrorMessages';
import { withCurrentProject } from '../../../Utility';

const { Content } = Layout;

const defaultLayout = {
  initial: { lg: [] },
  //Admin panel
  admin: {
    lg: [
      { i: '0', x: 0, y: 0, w: 12, h: 4 },
      { i: '2', x: 12, y: 0, w: 3, h: 4 },
      { i: '3', x: 15, y: 0, w: 9, h: 4 },
      { i: '1', x: 0, y: 7, w: 24, h: 8 },
    ],
    sm: [
      { i: '0', x: 0, y: 0, w: 12, h: 4 },
      { i: '2', x: 0, y: 4, w: 3, h: 4 },
      { i: '3', x: 3, y: 4, w: 9, h: 4 },
      { i: '1', x: 0, y: 8, w: 24, h: 8 },
    ],
  },
  //Uploader panel
  uploader: {
    lg: [
      { i: '0', x: 0, y: 0, w: 12, h: 4 },
      { i: '3', x: 15, y: 0, w: 12, h: 4 },
      { i: '1', x: 0, y: 7, w: 24, h: 7.5 },
    ],
  },
  contributor: {
    lg: [
      { i: '0', x: 0, y: 0, w: 12, h: 4 },
      { i: '3', x: 15, y: 0, w: 12, h: 4 },
      { i: '1', x: 0, y: 7, w: 24, h: 7.5 },
    ],
  },
  //Member panel
  member: {
    lg: [
      { i: '0', x: 0, y: 0, w: 12, h: 4 },
      { i: '3', x: 15, y: 0, w: 12, h: 4 },
      { i: '1', x: 0, y: 7, w: 24, h: 7.5 },
    ],
  },
};

class Canvas extends Component {
  constructor(props) {
    super(props);
    const datasetId = this.findStudyId();

    this.state = {
      children: [],
      currentDataset: datasetId,
      loading: false,
      filter: {},
      modalVisible: false, //large chart modal
      modalTitle: '',
      content: null,
      layout: localStorage.getItem('layout')
        ? JSON.parse(localStorage.getItem('layout'))
        : defaultLayout, //Loads from localstorage, or defaultLayout
      cardTypes: localStorage.getItem('cardTypes')
        ? JSON.parse(localStorage.getItem('cardTypes'))
        : fakeLayout, //loads from locastorage, or fakeData
      updateCount: 0, // a number that forces the dragarea re-render
      roleIndex: 0, //decides which canvas to display
      uploader: false,
      currentRole: '',
      datasetName: '',
      modalWidth: '95vw',
      currentUser: null,
    };
  }
  findStudyId() {
    const urlArr = window.location.href.split('/');
    return urlArr[urlArr.length - 2];
  }
  componentDidMount() {
    // this.init();
    this.setState({ currentUser: this.props.username })
    this.fetchDatasetName();
    this.updatePermision();
  }

  init = () => {
    getChildrenDataset(this.props.datasetId)
      .then((res) => {
        this.setState({ children: res.data.result.children });
      })
      .catch((err) => {
        if (err.response) {
          const errorMessager = new ErrorMessager(
            namespace.dataset.files.getChildrenDataset,
          );
          errorMessager.triggerMsg(err.response.status);
        }
        return;
      });
  };

  componentDidUpdate(prevProps, prevState) {
    let { containersPermission } = this.props;
    if (prevProps.containersPermission !== containersPermission) {
      this.updatePermision();
      this.fetchDatasetName();
    }
  }

  fetchDatasetName = () => {
    const currentProject = this.props.currentProject;
    if (currentProject) {
      this.setState({ datasetName: currentProject.containerName });
    }
  };

  updatePermision = () => {
    const currentProject = this.props.currentProject;
    if (currentProject?.permission) {
      const role = currentProject.permission;
      if (role === 'admin') {
        this.setState({
          roleIndex: 3,
          currentRole: 'admin',
          updateCount: this.state.updateCount + 1,
        });
      } else if (role === 'uploader') {
        this.setState({
          roleIndex: 4,
          currentRole: 'uploader',
          updateCount: this.state.updateCount + 1,
        });
      } else if (role === 'contributor') {
        this.setState({
          roleIndex: 6,
          currentRole: 'contributor',
          updateCount: this.state.updateCount + 1,
        });
      } else {
        this.setState({
          roleIndex: 5,
          currentRole: 'member',
          updateCount: this.state.updateCount + 1,
        });
      }
    }
  };

  filterData = (filter) => {
    let data = this.state.fulldata;
    Object.keys(filter).map((key) => {
      let rule = filter[key];
      if (rule.length > 0) {
        data = data.filter((item) => {
          if (typeof item[key] === 'boolean') {
            return rule.includes(item[key].toString());
          } else {
            return rule.includes(item[key]);
          }
        });
      }
    });
    this.setState({ data });
  };

  handleMapClick = (e, countryCode) => {
    this.setState((preState) => {
      let filter = preState.filter;
      filter['location'] = _.union(filter['location'], [countryCode]);
      this.filterData(filter);
      return { filter };
    });
  };

  handleChartClick = (key, point) => {
    this.setState((preState) => {
      let filter = preState.filter;
      if (key instanceof Array) {
        filter[point.name] = ['true'];
      } else {
        filter[key] = _.union(filter[key], [point.name]);
      }
      this.filterData(filter);
      return { filter };
    });
  };
  actions = {
    handleMapClick: this.handleMapClick,
    handleChartClick: this.handleChartClick,
  };

  closeTag = (key, value) => {
    this.setState((preState) => {
      let filter = preState.filter;
      let item = filter[key];
      filter[key] = item.filter((el) => el !== value);
      this.filterData(filter);
      return { filter };
    });
  };

  resetTag = () => {
    this.setState({ filter: {} });
    this.filterData({});
  };

  setFilter = (filter) => {
    this.setState({ filter });
    this.filterData(filter);
  };

  handleExpand = (content, title, width) => {
    this.setState({
      modalVisible: true,
      content: content,
      modalTitle: title,
      modalWidth: width,
    });
  };

  handleExpandClose = () => {
    this.setState({
      modalVisible: false,
      content: null,
    });
  };

  handleSaveLayout = () => {
    const { layout, cardTypes } = this.state;

    console.log('sending layout to endpoint....', layout);
    localStorage.setItem('layout', JSON.stringify(layout));
    localStorage.setItem('cardTypes', JSON.stringify(cardTypes));
  };

  handleResetLayout = () => {
    this.setState((state) => {
      return {
        layout: defaultLayout,
        cardTypes: fakeLayout,
        updateCount: state.updateCount + 1,
      };
    });
  };

  onLayoutChange = (layout, layouts) => {
    const { currentDataset } = this.state;
    const newLayout = Object.assign({}, this.state.layout);
    newLayout[currentDataset] = layout;
    //Set the cartTypes too!
    this.setState((state) => {
      return {
        layout: newLayout,
        // updateCount: state.updateCount + 1,
      };
    });
  };

  addACard = (value) => {
    let { layout, cardTypes, currentDataset } = this.state;

    //Update the carttypes, and the layout
    const newKey = Math.max(...Object.keys(layout[currentDataset])) + 1;
    const item = {
      type: value.type,
      col: value.col,
      title: value.title,
      defaultSize: 'm',
      key: newKey,
      expandable: true,
      exportable: true,
    };

    if (!cardTypes[currentDataset]) {
      cardTypes[currentDataset] = fakeLayout[1];
    }
    cardTypes[currentDataset].push(item);

    //Handle layout
    if (!layout[currentDataset]) {
      layout[currentDataset] = defaultLayout[1];
    }
    layout[currentDataset][newKey] = {
      w: 5,
      h: 3,
      x: 0,
      y: 0,
      i: newKey.toString(),
      moved: false,
      static: false,
    };

    this.setState((state) => {
      return {
        // updateCount: state.updateCount + 1,
        cardTypes,
        layout,
      };
    });
  };

  showUploaderModal = () => {
    this.setState(
      {
        uploader: true,
      },
      console.log('click upload'),
    );
  };

  handleCancelUploader = () => {
    console.log('cancelling');
    this.setState({ uploader: false });
  };

  render() {
    const {
      data,
      filter,
      loading,
      modalVisible,
      modalTitle,
      content,
      cardTypes,
    } = this.state;
    let tags = [];
    Object.keys(filter).map((key) => {
      let items = filter[key];
      items.map((i) =>
        tags.push({
          key,
          i,
        }),
      );
    });

    const routes = [
      {
        path: 'index',
        breadcrumbName: 'Projects',
      },
      {
        path: 'first',
        breadcrumbName: this.state.datasetName,
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

    let currentRole = this.state.currentRole;

    if (['uploader', 'contributor'].includes(currentRole))
      currentRole = 'Project Contributor';

    if (currentRole === 'admin') {
      if (this.props.role === 'admin') {
        currentRole = 'Portal Administrator';
      } else {
        currentRole = 'Project Administrator';
      }
    }

    return (
      <>
        {loading ? (
          <Spin />
        ) : (
            <>
              <Content className="content">
                <Row style={{ paddingBottom: '10px' }}>
                  <Col span={1} />
                  <Col
                    span={22}
                    style={{
                      paddingTop: '10px',
                    }}
                  >
                    <Row>
                      <PageHeader
                        ghost={false}
                        style={{
                          border: '1px solid rgb(235, 237, 240)',
                          width: '100%',
                          marginTop: '10px',
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
                            Project: {this.state.datasetName}
                          </span>
                        }
                        subTitle={`Your role is ${currentRole}.`}
                        extra={[
                          <Button type="" onClick={this.handleResetLayout}>
                            Reset Layout
                        </Button>,
                        ]}
                        breadcrumb={{ routes, itemRender }}
                      />
                    </Row>
                    <DragArea
                      key={this.state.updateCount}
                      onLayoutChange={this.onLayoutChange}
                      layout={this.state.layout[this.state.currentRole]}
                      handleSaveLayout={this.handleSaveLayout}
                      handleResetLayout={this.handleResetLayout}
                    >
                      {cardTypes[this.state.currentRole] &&
                        cardTypes[this.state.currentRole].map((card) => {
                          return (
                            <div key={card.key}>
                              <BasicCard
                                title={card.title}
                                expandable={card.expandable}
                                exportable={card.exportable}
                                handleExpand={this.handleExpand}
                                defaultSize={card.defaultSize}
                                expandComponent={card.expandComponent}
                                content={getCard(
                                  card,
                                  data,
                                  this.actions,
                                  this.state,
                                  this.handleExpand,
                                )}
                                datasetId={this.state.currentDataset}
                                currentUser={this.props.username}
                                isAdmin={this.state.currentRole === 'admin'}
                              />
                            </div>
                          );
                        })}
                    </DragArea>
                  </Col>
                  <Col span={1} />
                  <Modal
                    title={modalTitle}
                    visible={modalVisible}
                    onCancel={this.handleExpandClose}
                    style={{ minWidth: this.state.modalWidth }}
                    footer={null}
                  >
                    {content}
                  </Modal>
                </Row>
              </Content>
            </>
          )}
      </>
    );
  }
}
export default connect(
  (state) => {
    const { datasetList, containersPermission, username, role } = state;
    return { datasetList, containersPermission, username, role };
  },
  { AddDatasetCreator },
)(withCurrentProject(withRouter(Canvas)));
