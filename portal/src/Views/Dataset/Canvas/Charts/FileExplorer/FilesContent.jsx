import React, { Component } from 'react';
import { Link } from 'react-router-dom';

import { Row, Col, Tree, Tabs, Button } from 'antd';

import { ContainerOutlined } from '@ant-design/icons';
import {
  getChildrenDataset,
  traverseFoldersContainersAPI,
  getRawFilesAPI,
  getProcessedFilesAPI,
} from '../../../../../APIs';
import { getChildrenTree } from '../../../../../Utility';
import ContainerDetailsContent from './ContainerDetailsContent';
import RawTable from './RawTable';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import _ from 'lodash';
import { namespace, ErrorMessager } from '../../../../../ErrorMessages';

const { TabPane } = Tabs;

const treeData0 = [
  {
    title: 'Process',
    key: '0-0',
    children: [],
    type: 'folder',
    icon: <ContainerOutlined />,
  },
];

function compare(otherArray) {
  return function (current) {
    return (
      otherArray.filter(function (other) {
        return (
          other.value === current.value && other.display === current.display
        );
      }).length === 0
    );
  };
}

/**
 * props: need datasetId
 *
 * @class FilesContent
 * @extends {Component}
 */
class FilesContent extends Component {
  constructor(props) {
    super(props);

    this.state = {
      showLine: false,
      showIcon: true,
      activeKey: 0,
      panes: [], //folder panes
      treeData: treeData0, //folder view data
      treeKey: 0, //to mark refresh
      isCreateFolderModalShown: false,
      createUnderPath: '',
      isUploadModalShown: false,
      selectedPane: null,
      modalKey: 1,
      rawData: [],
      totalItem: 0,
      processedData: [],
      totalProcessedItem: 0,
      currentNode: null,
      currentPath: null,
    };
  }
  componentDidMount() {
    this.fetch();
    // console.log('this.context', this.context);
    const { datasetId } = this.props;
    treeData0[0].id = datasetId;

    this.setState((prev) => ({
      treeData: treeData0,
      treeKey: prev.treeKey + 1,
    }));
  }

  // componentDidUpdate(prevPros) {
  //   const prevUploadList = prevPros.uploadList;
  //   if (prevPros.uploadList !== this.props.uploadList) {
  //     console.log(prevUploadList, this.props.uploadList)
  //   }
  // }

  fetchRawData = async () => {
    try {
      const result = await getRawFilesAPI(
        this.props.match.params.datasetId,
        10,
        0,
        'createTime',
        null,
        'desc',
      );
      let { entities, approximateCount } = result.data.result;
      entities = entities.map((item) => ({
        ...item.attributes,
        key: item.attributes.name,
      }));
      this.setState({ rawData: entities, totalItem: approximateCount });
    } catch (err) {
      if (err.response) {
        const errorMessager = new ErrorMessager(
          namespace.dataset.files.getRawFilesAPI,
        );
        errorMessager.triggerMsg(err.response.status);
      }
      return;
    }
  };

  fetchProcesseData = async (path) => {
    try {
      const result = await getProcessedFilesAPI(
        this.props.match.params.datasetId,
        10,
        0,
        path,
        'createTime',
        null,
        'desc',
      );
      let { entities, approximateCount } = result.data.result;
      entities = entities.map((item) => ({
        ...item.attributes,
        key: item.attributes.name,
      }));
      this.setState({
        processedData: entities,
        totalProcessedItem: approximateCount,
      });

      return { processedData: entities, totalProcessedItem: approximateCount };
    } catch (err) {
      if (err.response) {
        const errorMessager = new ErrorMessager(
          namespace.dataset.files.getProcessedFilesAPI,
        );
        errorMessager.triggerMsg(err.response.status);
      }
      return;
    }
  };

  fetch = async () => {
    const { datasetId } = this.props;
    let subContainers, allFolders;

    try {
      allFolders = await traverseFoldersContainersAPI(datasetId);
    } catch (err) {
      if (err.response) {
        const errorMessager = new ErrorMessager(
          namespace.dataset.files.traverseFoldersContainersAPI,
        );
        // console.log(err.response.status);
        errorMessager.triggerMsg(err.response.status, null, { datasetId });
      }
      return;
    }

    try {
      subContainers = await getChildrenDataset(datasetId);
    } catch (err) {
      if (err.response) {
        const errorMessager = new ErrorMessager(
          namespace.dataset.files.getChildrenDataset,
        );
        errorMessager.triggerMsg(err.response.status);
      }
      return;
    }

    await this.fetchRawData();

    const pureFolders = this.computePureFolders(
      allFolders.data.result,
      subContainers.data.result.children,
    );

    //Showing sub dataset as subtree
    /*  if (_.isEmpty(pureFolders.filter((item) => typeof item === "object"))) {
      return;
    } */

    const treeData = getChildrenTree(pureFolders, 0, '');

    treeData0[0].children = treeData[1].children;
    const processedFolder = _.find(treeData, (ele) => {
      return ele.title === 'processed';
    });
    // console.log(treeData[1].children, 'treeData[1].children');
    this.setState((prev) => ({
      treeData: processedFolder.children,
      treeKey: prev.treeKey + 1,
    }));
    console.log(
      'FilesContent -> fetch -> processedFolder.children',
      processedFolder.children,
    );
  };

  computePureFolders = (allFolders, subContainers) => {
    return _.differenceWith(allFolders, subContainers, (af, sc) => {
      if (typeof af !== 'object') {
        return false;
      }
      return sc['dataset_name'] === Object.keys(af)[0];
    });
  };

  onSelect = async (selectedKeys, info) => {
    console.log(selectedKeys);
    if (info.node && info.node.type === 'add') {
      this.setState({
        isCreateFolderModalShown: true,
        createUnderPath: info.node.parentPath,
      });
      return;
    }
    if (selectedKeys.length === 0) {
      return;
    } //return if deselecting

    const { panes } = this.state;

    const isOpen = _.chain(panes)
      .map('key')
      .find((item) => item === selectedKeys[0])
      .value();

    if (isOpen) {
      //set active pane
      this.setState({ activeKey: selectedKeys[0] });
    } else {
      //Create a panel if new

      const currentDatasetProccessed = _.find(this.props.containersPermission, {
        container_id: Number(this.props.match.params.datasetId),
      });

      const {
        processedData,
        totalProcessedItem,
      } = await this.fetchProcesseData(info.node.path);

      const pane = {
        title: info.node.title,
        content: (
          <ContainerDetailsContent
            datasetId={this.props.match.params.datasetId}
            {...info.node}
            currentDataset={currentDatasetProccessed}
            processedData={processedData}
            totalProcessedItem={totalProcessedItem}
          />
        ),
        key: info.node.key,
        id: info.node.id,
        path: info.node.path,
      };
      panes.push(pane);
      // console.log(info.node.id, info.node.path)
      this.setState({
        activeKey: selectedKeys[0],
        panes,
        currentNode: info.node.id,
        currentPath: info.node.path,
      });
    }
  };

  //Tab
  onChange = (activeKey) => {
    this.setState({ activeKey });
  };

  //view Tab
  callback = async (key) => {
    if (key === 'raw') {
      await this.fetchRawData();
    } else if (key === 'processed') {
      const panes = this.state.panes;
      const treeData = this.state.treeData;

      if (panes && panes.length > 0) {
        for (const item of panes) {
          if (item.id === this.state.currentNode) {
            const {
              processedData,
              totalProcessedItem,
            } = await this.fetchProcesseData(this.state.currentPath);

            const currentDatasetProccessed = _.find(
              this.props.containersPermission,
              {
                container_id: Number(this.props.match.params.datasetId),
              },
            );

            item.content = (
              <ContainerDetailsContent
                datasetId={this.props.match.params.datasetId}
                path={this.state.currentPath}
                id={this.state.currentNode}
                currentDataset={currentDatasetProccessed}
                processedData={processedData}
                totalProcessedItem={totalProcessedItem}
              />
            );
          }
        }
      } else if (treeData && treeData.length > 0) {
        const pane = {};
        const firstFolder = treeData[0];
        pane.id = firstFolder.id;
        pane.path = firstFolder.path;
        pane.title = firstFolder.title;
        pane.key = `1-${firstFolder.id}`;

        const result = await this.fetchProcesseData(pane.path);

        if (result) {
          const { processedData, totalProcessedItem } = result;

          const currentDatasetProccessed = _.find(
            this.props.containersPermission,
            {
              container_id: Number(this.props.match.params.datasetId),
            },
          );

          pane.content = (
            <ContainerDetailsContent
              datasetId={this.props.match.params.datasetId}
              path={pane.path}
              id={pane.id}
              currentDataset={currentDatasetProccessed}
              processedData={processedData}
              totalProcessedItem={totalProcessedItem}
            />
          );

          panes.push(pane);
        }
      }

      this.setState({ panes, activeKey: panes && panes[0] && panes[0].key });
    }
  };

  onEdit = (targetKey, action) => {
    this[action](targetKey);
  };

  remove = (targetKey) => {
    let { activeKey } = this.state;
    let lastIndex;
    this.state.panes.forEach((pane, i) => {
      if (pane.key === targetKey) {
        lastIndex = i - 1;
      }
    });
    const panes = this.state.panes.filter((pane) => pane.key !== targetKey);
    if (panes.length && activeKey === targetKey) {
      if (lastIndex >= 0) {
        activeKey = panes[lastIndex].key;
      } else {
        activeKey = panes[0].key;
      }
    }

    this.setState({ panes, activeKey });
  };

  render() {
    const { showLine, showIcon, treeData, treeKey, panes } = this.state;

    const currentDataset = _.find(this.props.containersPermission, {
      container_id: Number(this.props.match.params.datasetId),
    });

    return (
      <Tabs
        defaultActiveKey="1"
        tabPosition="left"
        onChange={this.callback}
        hideAdd={true}
      >
        <TabPane key="raw" tab="Raw">
          <RawTable
            projectId={this.props.match.params.datasetId}
            currentDataset={currentDataset}
            rawData={this.state.rawData}
            totalItem={this.state.totalItem}
          />
        </TabPane>
        <TabPane tab="Processed" key="processed">
          <Row>
            {/* <Col span={3}>
              <Tree
                showLine={showLine}
                showIcon={showIcon}
                defaultExpandedKeys={['0-0']}
                onSelect={this.onSelect}
                treeData={treeData}
                key={treeKey}
                defaultSelectedKeys={treeData && treeData[0] && treeData[0].key}
              />
            </Col> */}
            <Col span={24} style={{ marginLeft: '-20px' }}>
              <div>
                {panes.length > 0 ? (
                  <Tabs
                    hideAdd
                    onChange={this.onChange}
                    activeKey={this.state.activeKey}
                    onEdit={this.onEdit}
                    tabPosition="left"
                  >
                    {panes.map((pane) => (
                      <TabPane
                        tab={pane.title}
                        key={pane.key}
                        style={{ marginBottom: '4px' }}
                      >
                        <div>{pane.content}</div>
                      </TabPane>
                    ))}
                  </Tabs>
                ) : (
                  <p style={{ marginLeft: '20px' }}>There's no files here.</p>
                )}
              </div>
            </Col>
          </Row>
        </TabPane>
      </Tabs>
    );
  }
}

export default connect((state) => ({
  datasetList: state.datasetList,
  containersPermission: state.containersPermission,
  uploadList: state.uploadList,
}))(withRouter(FilesContent));
