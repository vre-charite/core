import React, { Component } from 'react';

import { Row, Col, Tree, Tabs } from 'antd';

import {
  traverseFoldersContainersAPI,
  getFilesByTypeAPI,
} from '../../../../../APIs';
import { getChildrenTree, withCurrentProject } from '../../../../../Utility';
import RawTable from './RawTable';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import _ from 'lodash';
import { namespace, ErrorMessager } from '../../../../../ErrorMessages';
import {
  FolderOpenOutlined,
  DownOutlined,
  FolderOutlined,
  HomeOutlined,
  CloudServerOutlined,
} from '@ant-design/icons';
import { pipelines } from '../../../../../Utility/pipelines';
import Collapse from '../../../../../Components/Collapse/Collapse';

const { TabPane } = Tabs;

function getTitle(title) {
  if (title.startsWith('Core')) {
    return (
      <>
        <CloudServerOutlined /> {title}
      </>
    );
  } else {
    return (
      <>
        <HomeOutlined /> {title}
      </>
    );
  }
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
      activeKey: 'greenroom-raw',
      panes: [], //folder panes
      treeData: [
        {
          title: 'Raw',
          key: 'greenroom-raw',
          icon: <FolderOpenOutlined />,
        },
      ], //folder view data
      coreTreeData: [],
      treeKey: 0, //to mark refresh
      rawData: [],
      totalItem: 0,
      processedData: [],
      totalProcessedItem: 0,
      currentDataset: null,
      currentRole: null,
    };
  }

  componentDidMount() {
    this.fetch();
    const { datasetId } = this.props;
    const treeData = this.state.treeData;
    treeData[0].id = datasetId; //Why updating id here?

    const currentDataset = this.props.currentProject;

    this.setState((prev) => ({
      treeData: treeData,
      // treeKey: this.state.treeKey + 1, //This is causing a warning ? Why do we need this?
      currentDataset,
    }));
  }

  fetchRawData = async (entity_type = null, path = null) => {
    try {
      const filters = {};

      if (path) filters.path = path;

      const currentDataset = this.props.currentProject;

      let role = false;

      if (currentDataset) role = currentDataset.permission;

      const result = await getFilesByTypeAPI(
        this.props.match.params.datasetId,
        10,
        0,
        null,
        'createTime',
        'desc',
        role === 'admin',
        entity_type,
        filters,
      );
      let { entities, approximateCount } = result.data.result;
      entities = entities.map((item) => ({
        ...item.attributes,
        tags: item.labels,
        guid: item.guid,
        key: item.attributes.name,
        typeName: item.typeName,
      }));
      this.setState({ rawData: entities, totalItem: approximateCount });

      return { entities, approximateCount };
    } catch (err) {
      console.log(err);
      if (err.response) {
        const errorMessager = new ErrorMessager(
          namespace.dataset.files.getFilesByTypeAPI,
        );
        errorMessager.triggerMsg(err.response.status);
      }
      return;
    }
  };

  fetchProcesseData = async (path, entity_type) => {
    try {
      const currentDataset = this.props.currentProject;

      let role = false;

      if (currentDataset) role = currentDataset.permission;

      const result = await getFilesByTypeAPI(
        this.props.match.params.datasetId,
        10,
        0,
        path,
        'createTime',
        'desc',
        role === 'admin',
        entity_type,
        {},
      );
      let { entities, approximateCount } = result.data.result;
      entities = entities.map((item) => ({
        ...item.attributes,
        key: item.attributes.name,
        typeName: item.typeName,
        guid: item.guid,
        tags: item.labels,
      }));
      this.setState({
        processedData: entities,
        totalProcessedItem: approximateCount,
      });

      return { processedData: entities, totalProcessedItem: approximateCount };
    } catch (err) {
      if (err.response) {
        const errorMessager = new ErrorMessager(
          namespace.dataset.files.getFilesByTypeAPI,
        );
        errorMessager.triggerMsg(err.response.status);
      }
      return;
    }
  };

  //Fetch tree data, create default panel
  fetch = async () => {
    const { datasetId } = this.props;
    let currentRole =
      this.props.containersPermission &&
      this.props.containersPermission.filter(
        (el) => el.containerId === Number(datasetId),
      );
    if (currentRole && currentRole.length > 0)
      currentRole = currentRole[0].permission;

    this.setState({
      currentRole,
    });

    let allFolders;

    await this.fetchRawData();

    if (!['uploader', 'contributor'].includes(currentRole)) {
      try {
        allFolders = await traverseFoldersContainersAPI(datasetId);
      } catch (err) {
        if (err.response) {
          const errorMessager = new ErrorMessager(
            namespace.dataset.files.traverseFoldersContainersAPI,
          );
          errorMessager.triggerMsg(err.response.status, null, { datasetId });
        }
        return;
      }

      // Compute tree data
      let pureFolders = this.computePureFolders(
        allFolders.data.result.gr,
        // subContainers.data.result.children,
        undefined,
      );

      const treeData = getChildrenTree(pureFolders, 'greenroom', '');

      const processedFolder = _.find(treeData, (ele) => {
        return ele.title === 'processed';
      });

      const newTree = this.state.treeData;

      if (processedFolder) {
        newTree.push({
          title: 'Processed',
          key: 'greenroom-processed',
          icon: <FolderOutlined />,
          disabled: true,
          children: processedFolder.children,
        });
      }

      //Calculate the core folders
      let coreFolders = allFolders.data.result.vre;

      //core folders only care about items "raw" or "processed"
      coreFolders = coreFolders
        .filter(
          (el) =>
            Object.keys(el) &&
            (Object.keys(el)[0] === 'raw' ||
              Object.keys(el)[0] === 'processed') &&
            el[Object.keys(el)[0]]?.length,
        )
        .map((el) => {
          //Uppercasing the first letter of folder name
          const title =
            Object.keys(el)[0].charAt(0).toUpperCase() +
            Object.keys(el)[0].slice(1);
          const content = el[Object.keys(el)[0]];
          delete el[Object.keys(el)[0]];
          el[title] = content;

          return el;
        });

      let coreTreeData = getChildrenTree(coreFolders, 'core', '');

      //If there are processed data folder, add it to the tree
      if (coreTreeData) {
        const processedCoreFolder = _.find(coreTreeData, (ele) => {
          return ele.title === 'processed';
        });

        coreTreeData.push({
          title: 'Processed',
          key: 'core-processed',
          icon: <FolderOutlined />,
          disabled: true,
          children: processedCoreFolder?.children,
        });
      }

      this.setState({
        coreTreeData: coreTreeData?.map((el) => {
          return { ...el, children: undefined };
        }),
      });

      //Calculate default pane
      const newPanes = this.state.panes;
      const pane = {};
      const firstPane = newTree[0];
      pane.id = firstPane.id;
      pane.path = firstPane.path;
      pane.title = getTitle(`Green Room - ${firstPane.title}  `);
      pane.key = firstPane.key;
      pane.content = (
        <RawTable
          projectId={this.props.match.params.datasetId}
          currentDataset={this.state.currentDataset}
          rawData={this.state.rawData}
          totalItem={this.state.totalItem}
        />
      );
      newPanes.push(pane);

      this.setState((prev) => ({
        treeData: newTree,
        treeKey: prev.treeKey + 1,
        activeKey: pane.key,
        panes: newPanes,
      }));
    }
  };

  computePureFolders = (allFolders, subContainers) => {
    return _.differenceWith(allFolders, subContainers, (af, sc) => {
      if (typeof af !== 'object') {
        return false;
      }
      return sc['dataset_name'] === Object.keys(af)[0];
    });
  };

  //Tab
  onChange = (activeKey) => {
    this.setState((prev) => {
      return { activeKey, treeKey: prev.treeKey + 1 };
    });
  };

  onEdit = (targetKey, action) => {
    this[action](targetKey);
    this.setState((prev) => {
      return { treeKey: prev.treeKey + 1 };
    });
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
    const {
      treeData,
      coreTreeData,
      treeKey,
      currentDataset,
      activeKey,
    } = this.state;

    const onSelect = async (selectedKeys, info) => {
      if (selectedKeys.length === 0) {
        return;
      }

      const { panes } = this.state;

      const isOpen = _.chain(panes)
        .map('key')
        .find((item) => item === selectedKeys[0])
        .value();

      if (isOpen) {
        //set active pane
        this.setState((prev) => {
          return { activeKey: selectedKeys[0], treeKey: prev.treeKey + 1 };
        });
      } else {
        //Render raw table if 0
        if (selectedKeys[0] === 'greenroom-raw') {
          const title = getTitle(`Green Room - ${info.node.title}  `);
          const pane = {
            title: title,
            content: (
              <RawTable
                {...info.node}
                projectId={this.props.match.params.datasetId}
                currentDataset={currentDataset}
                rawData={this.state.rawData}
                totalItem={this.state.totalItem}
                type="raw table"
              />
            ),
            key: info.node.key.toString(),
            id: info.node.id,
          };
          panes.push(pane);
          this.setState((prev) => {
            return {
              activeKey: selectedKeys[0].toString(),
              panes,
              treeKey: prev.treeKey + 1,
            };
          });
        } else if (selectedKeys[0] === 'greenroom-processed-dicomEdit') {
          // Render container details table if pipleline
          const currentDatasetProccessed = this.props.currentProject;
          info.node.path = pipelines['GENERATE_PROCESS'];

          // const {
          //   processedData,
          //   totalProcessedItem,
          // } = await this.fetchProcesseData(pipelines['GENERATE_PROCESS'], null);

          const result = await this.fetchProcesseData(
            pipelines['GENERATE_PROCESS'],
            null,
          );

          const processedData = result && result.processedData;
          const totalProcessedItem = result && result.totalProcessedItem;

          const title = getTitle(`Green Room - ${info.node.title}  `);

          const pane = {
            title: title,
            content: (
              <RawTable
                {...info.node}
                projectId={this.props.match.params.datasetId}
                currentDataset={currentDatasetProccessed}
                rawData={processedData}
                totalItem={totalProcessedItem}
                type="processed table"
                hideUpload={true}
              />
            ),
            key: info.node.key.toString(),
            id: info.node.id,
          };
          panes.push(pane);
          this.setState((prev) => {
            return {
              activeKey: selectedKeys[0].toString(),
              panes,
              treeKey: prev.treeKey + 1,
            };
          });
        } else if (selectedKeys[0].startsWith('core')) {
          const currentDatasetProccessed = this.props.currentProject;
          // for data copy

          const {
            processedData,
            totalProcessedItem,
          } = await this.fetchProcesseData(pipelines['DATA_COPY'], null);
          info.node.path = pipelines['DATA_COPY'];

          const title = getTitle(`Core - ${info.node.title}  `);

          const pane = {
            title: title,
            content: (
              <RawTable
                {...info.node}
                projectId={this.props.match.params.datasetId}
                currentDataset={currentDatasetProccessed}
                rawData={processedData}
                totalItem={totalProcessedItem}
                type="processed table"
                hideUpload={true}
              />
            ),
            key: info.node.key.toString(),
            id: info.node.id,
          };
          panes.push(pane);
          this.setState((prev) => {
            return {
              activeKey: selectedKeys[0].toString(),
              panes,
              treeKey: prev.treeKey + 1,
            };
          });
        } else {
          console.log('no matching keys');
        }
      }
    };
    return (
      <>
        {!['uploader', 'contributor'].includes(this.state.currentRole) ? (
          <Row>
            <Col xs={24} sm={24} md={24} lg={24} xl={4}>
              <Collapse
                title={'Green Room'}
                icon={<HomeOutlined />}
                active={activeKey.startsWith('greenroom')}
              >
                <Tree
                  showIcon
                  defaultExpandedKeys={['greenroom-raw', 'greenroom-processed']}
                  defaultSelectedKeys={[activeKey]}
                  switcherIcon={<DownOutlined />}
                  onSelect={onSelect}
                  treeData={treeData}
                  key={treeKey}
                />
              </Collapse>
              {coreTreeData?.length > 0 && this.state.currentRole === 'admin' && (
                <Collapse
                  title={'Core'}
                  icon={<CloudServerOutlined />}
                  active={activeKey.startsWith('core')}
                >
                  <Tree
                    showIcon
                    defaultExpandedKeys={['core-raw']}
                    defaultSelectedKeys={[activeKey]}
                    switcherIcon={<DownOutlined />}
                    onSelect={onSelect}
                    treeData={coreTreeData}
                    key={treeKey}
                  />
                </Collapse>
              )}
            </Col>
            <Col xs={24} sm={24} md={24} lg={24} xl={20}>
              <div>
                <Tabs
                  hideAdd
                  onChange={this.onChange}
                  activeKey={this.state.activeKey.toString()}
                  type="editable-card"
                  onEdit={this.onEdit}
                  style={{
                    paddingLeft: '30px',
                    borderLeft: '1px solid rgb(240,240,240)',
                  }}
                >
                  {this.state.panes.map((pane) => (
                    <TabPane tab={pane.title} key={pane.key.toString()}>
                      <div
                        style={{
                          minHeight: '300px',
                        }}
                      >
                        {pane.content}
                      </div>
                    </TabPane>
                  ))}
                </Tabs>
              </div>
            </Col>
          </Row>
        ) : (
          <RawTable
            projectId={this.props.match.params.datasetId}
            currentDataset={currentDataset}
            rawData={this.state.rawData}
            totalItem={this.state.totalItem}
          />
        )}
      </>
    );
  }
}

export default connect((state) => ({
  datasetList: state.datasetList,
  containersPermission: state.containersPermission,
  uploadList: state.uploadList,
}))(withCurrentProject(withRouter(FilesContent)));
