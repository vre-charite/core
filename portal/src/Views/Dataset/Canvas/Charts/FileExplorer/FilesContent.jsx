import React, { Component } from 'react';

import { Row, Col, Tree, Tabs } from 'antd';

import {
  traverseFoldersContainersAPI,
  getFilesByTypeAPI,
  listAllVirtualFolder,
  listAllfilesVfolder,
} from '../../../../../APIs';
import {
  withCurrentProject,
  getGreenRoomTreeNodes,
  getCoreTreeNodes,
} from '../../../../../Utility';
import RawTable from './RawTable';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import _ from 'lodash';
import { namespace, ErrorMessager } from '../../../../../ErrorMessages';
import {
  DownOutlined,
  HomeOutlined,
  CloudServerOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import { pipelines } from '../../../../../Utility/pipelines';
import Collapse from '../../../../../Components/Collapse/Collapse';
import { DataSourceType } from './RawTableValues';
import CollectionIcon from '../../../../../Components/Icons/Collection';
import {
  setCurrentProjectActivePane,
  setCurrentProjectTree,
} from '../../../../../Redux/actions';
const { TabPane } = Tabs;

function getTitle(title) {
  if (title.includes('Trash')) {
    return (
      <>
        <DeleteOutlined /> {title}
      </>
    );
  }
  if (title.startsWith('Core')) {
    return (
      <>
        <CloudServerOutlined /> {title}
      </>
    );
  } else if (title.startsWith('Collection')) {
    return (
      <>
        <CollectionIcon width={14} />
        {title}
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
    this.clickLock = false;
    this.state = {
      activeKey: 'greenroom-raw',
      panes: [], //folder panes
      treeKey: 0, //to mark refresh
      rawData: [],
      totalItem: 0,
      processedData: [],
      totalProcessedItem: 0,
      currentDataset: null,
      currentRole: null,
      vfolders: [],
    };
  }
  async componentDidMount() {
    this.fetch();
    this.fetchRawData();
  }
  async updateVfolders() {
    const { datasetId } = this.props;
    const res = await listAllVirtualFolder(datasetId);
    const virualFolders = res.data.result;
    this.setState({
      vfolders: virualFolders,
    });
    return virualFolders;
  }

  fetchRawData = async (entity_type = null, path = null) => {
    try {
      const currentDataset = this.props.currentProject;

      let role = false;
      const filters = {};

      if (path) filters.path = path;

      if (currentDataset) role = currentDataset.permission;
      const result = await getFilesByTypeAPI(
        this.props.match.params.datasetId,
        10,
        0,
        pipelines['GREEN_RAW'],
        'createTime',
        'desc',
        role,
        this.props.username,
        this.state.activeKey,
        filters,
      );
      let { entities, approximateCount } = result.data.result;
      entities = entities.map((item) => ({
        ...item.attributes,
        tags: item.labels,
        guid: item.guid,
        geid: item.geid,
        key: item.attributes.name,
        typeName: item.typeName,
        manifest: item.manifest,
      }));
      this.setState({ rawData: entities, totalItem: approximateCount });

      return { entities, approximateCount };
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

  fetchProcesseData = async (pipeline, entity_type, activeKey) => {
    try {
      const currentDataset = this.props.currentProject;

      let role = false;

      if (currentDataset) role = currentDataset.permission;
      const result = await getFilesByTypeAPI(
        this.props.match.params.datasetId,
        10,
        0,
        pipeline,
        'createTime',
        'desc',
        role,
        this.props.username,
        activeKey,
        {},
      );
      let { entities, approximateCount } = result.data.result;
      entities = entities.map((item) => ({
        ...item.attributes,
        key: item.attributes.name,
        typeName: item.typeName,
        guid: item.guid,
        geid: item.geid,
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
        (el) => el.id === Number(datasetId),
      );
    if (currentRole && currentRole.length > 0)
      currentRole = currentRole[0].permission;

    this.setState({
      currentRole,
    });

    let allFolders;
    if (!['uploader'].includes(currentRole)) {
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
      const newTree = getGreenRoomTreeNodes(allFolders);
      const coreTreeData = getCoreTreeNodes(allFolders);
      // add core virtual folders
      await this.updateVfolders();

      const vfoldersNodes = this.state.vfolders.map((folder) => {
        return {
          title: folder.name,
          key: 'vfolder-' + folder.name,
          icon: <CollectionIcon width={14} style={{ color: '#1b90fe' }} />,
          disabled: false,
          children: null,
        };
      });
      const newPanes = this.state.panes;
      const pane = {};
      const firstPane = newTree[0];
      pane.id = firstPane.id;
      pane.path = firstPane.path;
      pane.title = getTitle(`Green Room - ${firstPane.title}  `);
      pane.key = firstPane.key;
      this.props.setCurrentProjectActivePane(firstPane.key);
      pane.content = (
        <RawTable
          projectId={this.props.match.params.datasetId}
          currentDataset={this.state.currentDataset}
          rawData={this.state.rawData}
          totalItem={this.state.totalItem}
          type={DataSourceType.GREENROOM_RAW}
          panelKey={firstPane.key}
        />
      );
      newPanes.push(pane);

      this.setState((prev) => ({
        treeKey: prev.treeKey + 1,
        activeKey: pane.key,
        panes: newPanes,
      }));
      this.props.setCurrentProjectTree({
        greenroom: newTree,
        core: coreTreeData || [],
        vfolders: vfoldersNodes,
      });
    } else {
      this.props.setCurrentProjectActivePane('greenroom-raw');
    }
  };

  //Tab
  onChange = (activeKey) => {
    this.props.setCurrentProjectActivePane(activeKey);
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
    const { treeKey, currentDataset, activeKey } = this.state;

    const onSelect = async (selectedKeys, info) => {
      if (selectedKeys.length === 0) {
        return;
      }

      if (this.clickLock) {
        return;
      }
      this.clickLock = true;
      const { panes } = this.state;
      this.props.setCurrentProjectActivePane(selectedKeys[0].toString());
      const isOpen = _.chain(panes)
        .map('key')
        .find((item) => item === selectedKeys[0])
        .value();
      if (isOpen) {
        //set active pane
        this.setState((prev) => {
          return {
            activeKey: selectedKeys[0].toString(),
            treeKey: prev.treeKey + 1,
          };
        });
      } else {
        this.setState((prev) => {
          return {
            activeKey: selectedKeys[0].toString(),
          };
        });
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
                type={DataSourceType.GREENROOM_RAW}
                panelKey={info.node.key.toString()}
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

          const result = await this.fetchProcesseData(
            pipelines['GENERATE_PROCESS'],
            null,
            selectedKeys[0],
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
                type={DataSourceType.GREENROOM_PROCESSED}
                panelKey={info.node.key.toString()}
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
        } else if (selectedKeys[0] === 'greenroom-processed-straightCopy') {
          // Render container details table if pipleline
          const currentDatasetProccessed = this.props.currentProject;
          info.node.path = pipelines['DATA_COPY'];

          const result = await this.fetchProcesseData(
            pipelines['DATA_COPY'],
            null,
            selectedKeys[0],
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
                type={DataSourceType.GREENROOM_PROCESSED}
                panelKey={info.node.key.toString()}
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
        } else if (selectedKeys[0].includes('trash')) {
          const currentDatasetProccessed = this.props.currentProject;

          const {
            processedData,
            totalProcessedItem,
          } = await this.fetchProcesseData(
            pipelines['DATA_DELETE'],
            'file_data',
            selectedKeys[0],
          );

          let title = getTitle(`Green Room - ${info.node.title}  `);
          let type = DataSourceType.GREENROOM_TRASH;
          if (selectedKeys[0].startsWith('core')) {
            title = getTitle(`Core - ${info.node.title}  `);
            type = DataSourceType.CORE_TRASH;
          }

          const pane = {
            title: title,
            content: (
              <RawTable
                {...info.node}
                projectId={this.props.match.params.datasetId}
                currentDataset={currentDatasetProccessed}
                rawData={processedData}
                totalItem={totalProcessedItem}
                type={type}
                panelKey={info.node.key.toString()}
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
          } = await this.fetchProcesseData(
            pipelines['DATA_COPY'],
            null,
            selectedKeys[0],
          );
          info.node.path = pipelines['DATA_COPY'];

          const title = getTitle(`Core - ${info.node.title}  `);
          let type = 'unknown';
          if (selectedKeys[0].toLowerCase() === 'core-raw') {
            type = DataSourceType.CORE_RAW;
          }
          if (selectedKeys[0].toLowerCase() === 'core-processed') {
            type = DataSourceType.CORE_PROCESSED;
          }
          const pane = {
            title: title,
            content: (
              <RawTable
                {...info.node}
                projectId={this.props.match.params.datasetId}
                currentDataset={currentDatasetProccessed}
                rawData={processedData}
                totalItem={totalProcessedItem}
                panelKey={info.node.key.toString()}
                type={type}
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
        } else if (selectedKeys[0].startsWith('vfolder')) {
          let vfolder = this.state.vfolders.find(
            (v) => v.name === info.node.title,
          );
          if (!vfolder) {
            await this.updateVfolders();
            vfolder = this.state.vfolders.find(
              (v) => v.name === info.node.title,
            );
          }
          if (vfolder) {
            const filesRes = await listAllfilesVfolder(
              vfolder.id,
              1,
              10,
              'desc',
              'createTime',
            );
            if (filesRes.data.result) {
              const vfilesData = filesRes.data.result.entities.map((item) => ({
                ...item.attributes,
                key: item.attributes.name,
                typeName: item.typeName,
                guid: item.guid,
                geid: item.geid,
                tags: item.labels,
              }));
              const title = getTitle(`Collection - ${info.node.title}  `);
              const pane = {
                title: title,
                content: (
                  <RawTable
                    projectId={this.props.match.params.datasetId}
                    currentDataset={currentDataset}
                    rawData={vfilesData}
                    totalItem={filesRes.data.total}
                    type={DataSourceType.CORE_VIRTUAL_FOLDER}
                    panelKey={info.node.key.toString()}
                    folderId={vfolder.id}
                    removePanel={this.remove}
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
            }
          }
        }
      }
      this.clickLock = false;
    };

    return (
      <>
        {!['uploader'].includes(this.state.currentRole) &&
        this.props.project &&
        this.props.project.tree &&
        this.props.project.tree['greenroom'] ? (
          <Row style={{ minWidth: 750 }}>
            <Col
              xs={24}
              sm={24}
              md={24}
              lg={24}
              xl={4}
              className="vre-file-dir"
            >
              <Collapse
                title={'Green Room'}
                icon={<HomeOutlined />}
                active={activeKey.startsWith('greenroom')}
              >
                <Tree
                  className="green_room"
                  showIcon
                  defaultExpandedKeys={['greenroom-raw', 'greenroom-processed']}
                  defaultSelectedKeys={[activeKey]}
                  switcherIcon={<DownOutlined />}
                  onSelect={onSelect}
                  treeData={this.props.project.tree['greenroom']}
                  key={treeKey}
                />
              </Collapse>
              {['admin', 'collaborator', 'contributor'].includes(
                this.state.currentRole,
              ) && this.props.project.tree['core']?.length > 0 ? (
                <Collapse
                  title={'Core'}
                  icon={<CloudServerOutlined />}
                  active={activeKey.startsWith('core')}
                  maxHeight={600}
                >
                  <Tree
                    showIcon
                    defaultExpandedKeys={['core-raw']}
                    selectedKeys={[activeKey]}
                    switcherIcon={<DownOutlined />}
                    onSelect={onSelect}
                    treeData={this.props.project.tree['core'].concat(
                      this.props.project.tree['vfolders'],
                    )}
                    key={treeKey}
                  />
                </Collapse>
              ) : null}
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
            type={DataSourceType.GREENROOM_RAW}
            panelKey={'greenroom-raw'}
          />
        )}
      </>
    );
  }
}

export default connect(
  (state) => ({
    datasetList: state.datasetList,
    containersPermission: state.containersPermission,
    uploadList: state.uploadList,
    project: state.project,
    username: state.username,
  }),
  { setCurrentProjectTree, setCurrentProjectActivePane },
)(withCurrentProject(withRouter(FilesContent)));
