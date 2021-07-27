import React, { Component } from 'react';
import { Row, Spin, Col, Modal, Layout } from 'antd';
import { withRouter, Link } from 'react-router-dom';
import BasicCard from '../../../Components/Cards/BasicCard';
import getCard from './getCard';
import fakeLayout from './fakeLayout';
import DragArea from './DragArea/DragArea';
import CanvasPageHeader from './PageHeader/CanvasPageHeader';
import _ from 'lodash';
import { connect } from 'react-redux';
import {
  AddDatasetCreator,
  setCurrentProjectProfile,
} from '../../../Redux/actions';
import {
  getChildrenDataset,
  getProjectInfoAPI,
  getUsersOnDatasetAPI,
} from '../../../APIs';
import { namespace, ErrorMessager } from '../../../ErrorMessages';
import { withCurrentProject } from '../../../Utility';

const { Content } = Layout;

const defaultLayout = {
  initial: { lg: [] },
  //Admin panel
  admin: {
    lg: [
      // { i: '0', x: 0, y: 0, w: 12, h: 4 },
      { i: '2', x: 0, y: 0, w: 9, h: 4 },
      { i: '3', x: 9, y: 0, w: 15, h: 4 },
      { i: '1', x: 0, y: 7, w: 24, h: 10 },
    ],
    md: [
      { i: '2', x: 0, y: 0, w: 11, h: 4 },
      { i: '3', x: 11, y: 0, w: 13, h: 4 },
      { i: '1', x: 0, y: 7, w: 24, h: 10 },
    ],
    sm: [
      // { i: '0', x: 0, y: 0, w: 12, h: 4 },
      { i: '2', x: 0, y: 4, w: 24, h: 2.5 },
      { i: '3', x: 0, y: 4, w: 24, h: 4 },
      { i: '1', x: 0, y: 8, w: 24, h: 10 },
    ],
  },
  contributor: {
    lg: [
      { i: '2', x: 0, y: 0, w: 12, h: 4 },
      { i: '3', x: 15, y: 0, w: 12, h: 4 },
      { i: '1', x: 0, y: 7, w: 24, h: 10 },
    ],
  },
  collaborator: {
    lg: [
      { i: '2', x: 0, y: 0, w: 12, h: 4 },
      { i: '3', x: 15, y: 0, w: 12, h: 4 },
      { i: '1', x: 0, y: 7, w: 24, h: 10 },
    ],
  },
  //Member panel
  member: {
    lg: [
      { i: '0', x: 0, y: 0, w: 12, h: 4 },
      { i: '3', x: 15, y: 0, w: 12, h: 4 },
      { i: '1', x: 0, y: 7, w: 24, h: 10 },
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
      currentProject: '',
      dataSetId: '',
      projectUsersInfo: '',
      pageHeaderExpand: false,
      modalWidth: '95vw',
      currentUser: null,
    };
  }

  findStudyId() {
    const urlArr = window.location.href.split('/');
    return urlArr[urlArr.length - 2];
  }
  componentDidMount() {
    this.setState({ currentUser: this.props.username });
    this.fetchDatasetInfo();
    this.updatePermision();

    // getProjectInfoAPI(this.props.datasetId).then((res) => {
    //   if (res.status === 200 && res.data && res.data.code === 200) {
    //     const profile = res.data.result;
    //     this.props.setCurrentProjectProfile(profile);
    //   }
    // });

    window.setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 0);
  }

  getProjectUsersInfo = async () => {
    const usersInfo = await getUsersOnDatasetAPI(
      this.props.currentProject.globalEntityId,
    );
    if (usersInfo && usersInfo.data && usersInfo.data.result) {
      this.setState({ projectUsersInfo: usersInfo.data.result });
    }
  };

  componentDidUpdate(prevProps, prevState) {
    let { containersPermission } = this.props;
    if (
      prevProps.containersPermission?.length !== containersPermission?.length
    ) {
      this.updatePermision();
      this.fetchDatasetInfo();
    }
  }

  fetchDatasetInfo = () => {
    const currentProject = this.props.currentProject;
    if (currentProject) {
      this.setState(
        {
          currentProject,
          dataSetId: currentProject.id,
        },
        () => {
          if (this.state.currentRole === 'admin') {
            this.getProjectUsersInfo();
          }
        },
      );
    }
  };

  updatePermision = () => {
    const currentProject = this.props.currentProject;
    if (currentProject?.permission) {
      const role = currentProject.permission;

      this.setState({
        currentRole: role,
        updateCount: this.state.updateCount + 1,
      });
    }
  };

  filterData = (filter) => {
    let data = this.state.fulldata;
    // eslint-disable-next-line
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
        cardTypes,
        layout,
      };
    });
  };

  showUploaderModal = () => {
    this.setState({
      uploader: true,
    });
  };

  handleCancelUploader = () => {
    this.setState({ uploader: false });
  };

  render() {
    let cardContents;
    let tags = [];
    const {
      data,
      filter,
      loading,
      modalVisible,
      modalTitle,
      content,
      cardTypes,
      projectUsersInfo,
      currentProject,
      currentRole,
      layout,
    } = this.state;

    if (cardTypes[currentRole]) {
      cardContents = cardTypes[currentRole].filter((el) => el.type !== 'info');
    }

    Object.keys(filter).forEach((key) => {
      let items = filter[key];
      items.forEach((i) =>
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
        breadcrumbName: this.state.dataSetName,
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
        <Link to="/landing">{route.breadcrumbName}</Link>
      );
    }

    return (
      <>
        {loading ? (
          <Spin />
        ) : (
          <>
            <Content className="content" style={{ letterSpacing: '0.4px' }}>
              <Row style={{ paddingBottom: '10px' }}>
                <Col span={24}>
                  <CanvasPageHeader />
                  <DragArea
                    key={this.state.updateCount}
                    onLayoutChange={this.onLayoutChange}
                    layout={this.state.layout[currentRole]}
                    handleSaveLayout={this.handleSaveLayout}
                    handleResetLayout={this.handleResetLayout}
                  >
                    {cardContents &&
                      cardContents.map((card) => {
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
                              isAdmin={currentRole === 'admin'}
                            />
                          </div>
                        );
                      })}
                  </DragArea>
                </Col>
                <Modal
                  title={modalTitle}
                  visible={modalVisible}
                  onCancel={this.handleExpandClose}
                  style={{ minWidth: this.state.modalWidth }}
                  footer={null}
                  maskClosable={false}
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
  { AddDatasetCreator, setCurrentProjectProfile },
)(withCurrentProject(withRouter(Canvas)));
