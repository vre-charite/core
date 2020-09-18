import React, { Component } from 'react';

import { Row, Col, Tree, Tabs } from 'antd';

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
import {
  FolderOpenOutlined,
  DownOutlined,
  FolderOutlined,
} from '@ant-design/icons';

const { TabPane } = Tabs;

const treeData = [
  {
    title: 'Raw',
    key: '0',
    icon: <FolderOpenOutlined />,
  },
  {
    title: 'Processed',
    key: '1',
    icon: <FolderOutlined />,
    disabled: true,
  },
  // {
  //   title: 'Core',
  //   key: '2',
  //   icon: <FolderOutlined />,
  //   disabled: true,
  // },
];

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
      activeKey: '0',
      panes: [], //folder panes
      treeData: treeData, //folder view data
      treeKey: 0, //to mark refresh
      rawData: [],
      totalItem: 0,
      processedData: [],
      totalProcessedItem: 0,
      currentDataset: null,
    };
  }
  componentDidMount() {
    this.fetch();
    const { datasetId } = this.props;
    treeData[0].id = datasetId; //Why updating id here?

    const currentDataset = _.find(this.props.containersPermission, {
      container_id: Number(this.props.match.params.datasetId),
    });
    this.setState((prev) => ({
      treeData: treeData,
      treeKey: this.state.treeKey + 1, //This is causing a warning ? Why do we need this?
      currentDataset,
    }));
  }

  fetchRawData = async (entity_type = null, path = null) => {
    try {
      const filters = {};

      if (path) filters.path = path;

      const currentDataset = this.props.containersPermission && this.props.containersPermission.filter(el => el.container_id === Number(this.props.match.params.datasetId));

      let role = false;

      if (currentDataset && currentDataset.length) role = currentDataset[0].permission;

      const result = await getRawFilesAPI(
        this.props.match.params.datasetId,
        10,
        0,
        'createTime',
        null,
        'desc',
        role === 'admin',
        entity_type,
        filters,
      );
      let { entities, approximateCount } = result.data.result;
      entities = entities.map((item) => ({
        ...item.attributes,
        key: item.attributes.name,
      }));
      this.setState({ rawData: entities, totalItem: approximateCount });

      return { entities, approximateCount };
    } catch (err) {
      console.log(err)
      if (err.response) {
        const errorMessager = new ErrorMessager(
          namespace.dataset.files.getRawFilesAPI,
        );
        errorMessager.triggerMsg(err.response.status);
      }
      return;
    }
  };

  fetchProcesseData = async (path, entity_type) => {
    try {
      const result = await getProcessedFilesAPI(
        this.props.match.params.datasetId,
        10,
        0,
        path,
        'createTime',
        null,
        'desc',
        entity_type,
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

  //Fetch tree data, create default panel
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

    // Compute tree data
    const pureFolders = this.computePureFolders(
      allFolders.data.result.gr,
      subContainers.data.result.children,
    );

    const coreFolders = this.computePureFolders(
      allFolders.data.result.vre,
      subContainers.data.result.children,
    );

    const treeData = getChildrenTree(pureFolders, 0, '');
    const treeData2 = getChildrenTree(coreFolders, 'core', '');

    const processedFolder = _.find(treeData, (ele) => {
      return ele.title === 'processed';
    });
    const newTree = this.state.treeData;
    newTree[1].children = processedFolder.children;

    // newTree[2].children = treeData2;

    const newPanes = this.state.panes;
    const pane = {};
    const firstPane = newTree[0];
    pane.id = firstPane.id;
    pane.path = firstPane.path;
    pane.title = firstPane.title;
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
    this.setState({ activeKey });
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
    const { treeData, treeKey, currentDataset } = this.state;

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
        this.setState({ activeKey: selectedKeys[0] });
      } else {
        //Render raw table if 0
        if (selectedKeys[0] === '0') {
          const pane = {
            title: info.node.title,
            content: (
              <RawTable
                projectId={this.props.match.params.datasetId}
                currentDataset={currentDataset}
                rawData={this.state.rawData}
                totalItem={this.state.totalItem}
              />
            ),
            key: info.node.key.toString(),
            id: info.node.id,
          };
          panes.push(pane);
          this.setState({
            activeKey: selectedKeys[0].toString(),
            panes,
          });
        } else if (selectedKeys[0] === '1') {
          //Render the notification if 1
          const pane = {
            title: info.node.title,
            content: <p>Please click on the pipeline name to view files.</p>,
            key: info.node.key.toString(),
            id: info.node.id,
          };
          panes.push(pane);
          this.setState({
            activeKey: selectedKeys[0].toString(),
            panes,
          });
        } else if (selectedKeys[0] === '1-dicom_edit') {
          // Render container details table if pipleline
          const currentDatasetProccessed = _.find(
            this.props.containersPermission,
            {
              container_id: Number(this.props.match.params.datasetId),
            },
          );

          const {
            processedData,
            totalProcessedItem,
          } = await this.fetchProcesseData(info.node.path, null);

          const pane = {
            title: info.node.title,
            content: (
              <ContainerDetailsContent
                {...info.node}
                datasetId={this.props.match.params.datasetId}
                currentDataset={currentDatasetProccessed}
                processedData={processedData}
                totalProcessedItem={totalProcessedItem}
              />
            ),
            key: info.node.key.toString(),
            id: info.node.id,
          };
          panes.push(pane);
          this.setState({
            activeKey: selectedKeys[0].toString(),
            panes,
          });
        } 
        // else if (selectedKeys[0] && selectedKeys[0].includes('core')) {
        //   let folderName = selectedKeys[0].split('-');
        //   if (folderName && folderName.length > 1) folderName = folderName[1];

        //   const currentDatasetProccessed = _.find(
        //     this.props.containersPermission,
        //     {
        //       container_id: Number(this.props.match.params.datasetId),
        //     },
        //   );

        //   const { entities, approximateCount } = await this.fetchRawData(
        //     'nfs_file_cp',
        //     `/vre-data/tvb/${folderName}`,
        //   );

        //   const pane = {
        //     title: info.node.title,
        //     content: (
        //       <ContainerDetailsContent
        //         {...info.node}
        //         datasetId={this.props.match.params.datasetId}
        //         currentDataset={currentDatasetProccessed}
        //         processedData={entities}
        //         totalProcessedItem={approximateCount}
        //         filePath={`/vre-data/tvb/${folderName}`}
        //       />
        //     ),
        //     key: info.node.key.toString(),
        //     id: info.node.id,
        //   };
        //   panes.push(pane);
        //   this.setState({
        //     activeKey: selectedKeys[0].toString(),
        //     panes,
        //   });
        // } 
        else {
          console.log('no matching keys');
        }
      }
    };

    return (
      <>
        <Row>
          <Col span={4}>
            <Tree
              showIcon
              defaultExpandedKeys={['1', '2']}
              defaultSelectedKeys={['0']}
              switcherIcon={<DownOutlined />}
              onSelect={onSelect}
              treeData={treeData}
              key={treeKey}
            />
          </Col>
          <Col span={20}>
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
      </>
    );
  }
}

export default connect((state) => ({
  datasetList: state.datasetList,
  containersPermission: state.containersPermission,
  uploadList: state.uploadList,
}))(withRouter(FilesContent));
