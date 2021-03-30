import React, { useEffect, useState, useRef } from 'react';

import { Row, Col, Tree, Tabs } from 'antd';

import {
  traverseFoldersContainersAPI,
  listAllVirtualFolder,
  listAllfilesVfolder,
} from '../../../../../APIs';
import {
  getGreenRoomTreeNodes,
  getCoreTreeNodes,
  useCurrentProject,
} from '../../../../../Utility';
import RawTable from './RawTable';
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
import { usePanel } from './usePanel';
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

let clickLock = false;
/**
 * props: need datasetId
 *
 * @class FilesContent
 * @extends {Component}
 */
function FilesContent(props) {
  const { panes, addPane, removePane, activePane, activatePane } = usePanel();
  const [treeKey, setTreeKey] = useState(0);
  const [vfolders, setVfolders] = useState([]);
  const [currentDataset] = useCurrentProject();
  const isInit = useRef(false);
  const currentRole = currentDataset?.permission;
  const projectId = currentDataset.id;
  //Fetch tree data, create default panel
  const fetch = async () => {
    let allFolders;
    if (!['uploader'].includes(currentRole)) {
      try {
        allFolders = await traverseFoldersContainersAPI(projectId);
      } catch (err) {
        if (err.response) {
          const errorMessager = new ErrorMessager(
            namespace.dataset.files.traverseFoldersContainersAPI,
          );
          errorMessager.triggerMsg(err.response.status, null, { projectId });
        }
        return;
      }
      const newTree = getGreenRoomTreeNodes(allFolders);
      const coreTreeData = getCoreTreeNodes(allFolders);
      // add core virtual folders
      const vfoldersRes = await updateVfolders();
      const vfoldersNodes = vfoldersRes.map((folder) => {
        return {
          title: folder.name,
          key: 'vfolder-' + folder.name,
          icon: <CollectionIcon width={14} style={{ color: '#1b90fe' }} />,
          disabled: false,
          children: null,
        };
      });

      const firstPane = newTree[0];
      /*       if(panes.map(pane=>pane.key).includes(firstPane.key)){
        if(activePane!==firstPane.key){
          activatePane(firstPane.key)
        };
        return;
      } */
      addPane({
        id: firstPane.id,
        path: firstPane.path,
        title: getTitle(`Green Room - ${firstPane.title}  `),
        key: firstPane.key,
        content: {
          projectId,
          type: DataSourceType.GREENROOM_RAW,
        },
      });
      props.setCurrentProjectActivePane(firstPane.key);
      activatePane(firstPane.key);
      props.setCurrentProjectTree({
        greenroom: newTree,
        core: coreTreeData || [],
        vfolders: vfoldersNodes,
      });
    } else {
      props.setCurrentProjectActivePane('greenroom-raw');
      activatePane('greenroom-raw');
    }
    isInit.current = true;
  };

  useEffect(() => {
    fetch();
  }, [projectId]);

  async function updateVfolders() {
    const res = await listAllVirtualFolder(projectId);
    const virualFolders = res.data.result;
    setVfolders(virualFolders);
    return virualFolders;
  }

  //Tab
  const onChange = (activePane) => {
    props.setCurrentProjectActivePane(activePane);
    activatePane(activePane);
    setTreeKey((prev) => {
      return prev.treeKey + 1;
    });
  };

  const onEdit = (targetKey, action) => {
    //this[action](targetKey);
    switch (action) {
      case 'remove': {
        remove(targetKey);
        break;
      }
      default: {
        break;
      }
    }
    setTreeKey((prev) => {
      return prev.treeKey + 1;
    });
  };

  const remove = (targetKey) => {
    let lastIndex;
    let newActiveKey = activePane;
    panes.forEach((pane, i) => {
      if (pane.key === targetKey) {
        lastIndex = i - 1;
      }
    });
    const panesFiltered = panes.filter((pane) => pane.key !== targetKey);
    if (panesFiltered.length && activePane === targetKey) {
      if (lastIndex >= 0) {
        newActiveKey = panesFiltered[lastIndex].key;
      } else {
        newActiveKey = panesFiltered[0].key;
      }
    }
    props.setCurrentProjectActivePane(newActiveKey);
    activatePane(newActiveKey);
    removePane(targetKey);
  };

  const onSelect = async (selectedKeys, info) => {
    if (!isInit.current) {
      return;
    }
    if (selectedKeys.length === 0) {
      return;
    }

    if (clickLock) {
      return;
    }
    clickLock = true;
    props.setCurrentProjectActivePane(selectedKeys[0].toString());
    const isOpen = _.chain(panes)
      .map('key')
      .find((item) => item === selectedKeys[0])
      .value();
    if (isOpen) {
      //set active pane
      activatePane(selectedKeys[0].toString());
      setTreeKey((prev) => {
        return prev.treeKey + 1;
      });
    } else {
      setTreeKey((prev) => {
        return prev.treeKey + 1;
      });
      //Render raw table if 0
      const newPane = await getNewPane(selectedKeys, info);
      setTreeKey((prev) => {
        return prev.treeKey + 1;
      });
      activatePane(selectedKeys[0].toString());
      addPane(newPane);
    }
    clickLock = false;
  };

  return (
    <>
      {!['uploader'].includes(currentRole) &&
      props?.project?.tree?.greenroom ? (
        <Row style={{ minWidth: 750 }}>
          <Col xs={24} sm={24} md={24} lg={24} xl={4} className="vre-file-dir">
            <Collapse
              title={'Green Room'}
              icon={<HomeOutlined />}
              active={activePane.startsWith('greenroom')}
            >
              <Tree
                className="green_room"
                showIcon
                defaultExpandedKeys={['greenroom-raw', 'greenroom-processed']}
                defaultSelectedKeys={[activePane]}
                switcherIcon={<DownOutlined />}
                onSelect={onSelect}
                treeData={props.project.tree['greenroom']}
                key={treeKey}
              />
            </Collapse>
            {['admin', 'collaborator', 'contributor'].includes(currentRole) &&
            props.project.tree['core']?.length > 0 ? (
              <Collapse
                title={'Core'}
                icon={<CloudServerOutlined />}
                active={activePane.startsWith('core')}
                maxHeight={600}
              >
                <Tree
                  showIcon
                  defaultExpandedKeys={['core-raw']}
                  selectedKeys={[activePane]}
                  switcherIcon={<DownOutlined />}
                  onSelect={onSelect}
                  treeData={props.project.tree['core'].concat(
                    props.project.tree['vfolders'],
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
                onChange={onChange}
                activeKey={activePane}
                type="editable-card"
                onEdit={onEdit}
                style={{
                  paddingLeft: '30px',
                  borderLeft: '1px solid rgb(240,240,240)',
                }}
              >
                {panes.map((pane) => (
                  <TabPane tab={pane.title} key={pane.key.toString()}>
                    <div
                      style={{
                        minHeight: '300px',
                      }}
                    >
                      <RawTable
                        {...pane.content.infoNode}
                        projectId={pane.content.projectId}
                        type={pane.content.type}
                        panelKey={pane.key}
                        folderId={pane.content.folderId}
                        removePanel={remove}
                      />
                    </div>
                  </TabPane>
                ))}
              </Tabs>
            </div>
          </Col>
        </Row>
      ) : (
        <RawTable
          projectId={projectId}
          type={DataSourceType.GREENROOM_RAW}
          panelKey={'greenroom-raw'}
        />
      )}
    </>
  );

  async function getNewPane(selectedKeys, info) {
    let newPane = {};
    if (selectedKeys[0] === 'greenroom-raw') {
      const title = getTitle(`Green Room - ${info.node.title}  `);
      newPane = {
        title,
        content: {
          infoNode: info.node,
          projectId,
          type: DataSourceType.GREENROOM_RAW,
        },
        id: info.node.id,
        key: info.node.key.toString(),
      };
    } else if (selectedKeys[0] === 'greenroom-processed-dicomEdit') {
      // Render container details table if pipleline
      info.node.path = pipelines['GENERATE_PROCESS'];

      const title = getTitle(`Green Room - ${info.node.title}  `);

      newPane = {
        title: title,
        content: {
          infoNode: info.node,
          projectId: projectId,
          type: DataSourceType.GREENROOM_PROCESSED,
        },
        key: info.node.key.toString(),
        id: info.node.id,
      };
    } else if (selectedKeys[0] === 'greenroom-processed-straightCopy') {
      // Render container details table if pipleline
      info.node.path = pipelines['DATA_COPY'];

      const title = getTitle(`Green Room - ${info.node.title}  `);

      newPane = {
        title: title,
        content: {
          infoNode: info.node,
          projectId: projectId,
          type: DataSourceType.GREENROOM_PROCESSED,
        },
        key: info.node.key.toString(),
        id: info.node.id,
      };
    } else if (selectedKeys[0].includes('trash')) {
      let title = getTitle(`Green Room - ${info.node.title}  `);
      let type = DataSourceType.GREENROOM_TRASH;
      if (selectedKeys[0].startsWith('core')) {
        title = getTitle(`Core - ${info.node.title}  `);
        type = DataSourceType.CORE_TRASH;
      }
      newPane = {
        title: title,
        content: {
          infoNode: info.node,
          projectId: projectId,
          type,
        },
        key: info.node.key.toString(),
        id: info.node.id,
      };
    } else if (selectedKeys[0].startsWith('core')) {
      // for data copy
      info.node.path = pipelines['DATA_COPY'];

      const title = getTitle(`Core - ${info.node.title}  `);
      let type = 'unknown';
      if (selectedKeys[0].toLowerCase() === 'core-raw') {
        type = DataSourceType.CORE_RAW;
      }
      if (selectedKeys[0].toLowerCase() === 'core-processed') {
        type = DataSourceType.CORE_PROCESSED;
      }
      newPane = {
        title: title,
        content: {
          infoNode: info.node,
          projectId: projectId,
          type,
        },
        key: info.node.key.toString(),
        id: info.node.id,
      };
    } else if (selectedKeys[0].startsWith('vfolder')) {
      let vfolder = vfolders.find((v) => v.name === info.node.title);
      if (!vfolder) {
        const vfoldersRes = await updateVfolders();
        vfolder = vfoldersRes.find((v) => v.name === info.node.title);
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
          const title = getTitle(`Collection - ${info.node.title}  `);
          newPane = {
            title: title,
            content: {
              infoNode: info.node,
              projectId: projectId,
              type: DataSourceType.CORE_VIRTUAL_FOLDER,
              folderId: vfolder.id,
            },
            key: info.node.key.toString(),
            id: info.node.id,
          };
        }
      }
    }
    return newPane;
  }
}

export default connect(
  (state) => ({
    project: state.project,
    username: state.username,
  }),
  { setCurrentProjectTree, setCurrentProjectActivePane },
)(FilesContent);
