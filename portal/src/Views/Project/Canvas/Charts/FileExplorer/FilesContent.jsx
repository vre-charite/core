import React, { useEffect, useState, useRef } from 'react';

import { Row, Col, Tree, Tabs, Button, Input, Form, message } from 'antd';

import {
  listAllVirtualFolder,
  createVirtualFolder,
  deleteVirtualFolder,
  updateVirtualFolder,
} from '../../../../../APIs';
import { useCurrentProject, trimString } from '../../../../../Utility';
import RawTable from './RawTable';
import { connect } from 'react-redux';
import _ from 'lodash';
import {
  DownOutlined,
  HomeOutlined,
  CloudServerOutlined,
  DeleteOutlined,
  CompassOutlined,
  PlusOutlined,
  SaveOutlined,
  EditOutlined,
  CloseOutlined,
  LoadingOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { DataSourceType, PanelKey } from './RawTableValues';
import CollectionIcon from '../../../../../Components/Icons/Collection';
import {
  setCurrentProjectActivePane,
  setCurrentProjectTree,
} from '../../../../../Redux/actions';
import i18n from '../../../../../i18n';
import { usePanel } from './usePanel';
import styles from './index.module.scss';
import { createHash } from 'crypto';
import currentProject from '../../../../../Redux/Reducers/currentProject';

const { TabPane } = Tabs;
const VFOLDER_CREATE_LEAF = 'vfolder-create';
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
  const { panes, addPane, removePane, activePane, activatePane, updatePanes } =
    usePanel();
  const [treeKey, setTreeKey] = useState(0);
  const [vfolders, setVfolders] = useState([]);
  const [editCollection, setEditCollection] = useState(false);
  const [saveBtnLoading, setSaveBtnLoading] = useState(false);
  const [deleteBtnLoading, setDeleteBtnLoading] = useState(false);
  const [updateBtnLoading, setUpdateBtnLoading] = useState(false);
  const [updateTimes, setUpdateTimes] = useState(0);
  // const [updatedPanes, setUpdatedPanes] = useState([]);
  const [deletedPaneKey, setDeletedPaneKey] = useState('');
  const [deleteItemId, setDeleteItemId] = useState('');
  const [createCollection, setCreateCollection] = useState(false);
  const [currentDataset] = useCurrentProject();
  const isInit = useRef(false);
  const [form] = Form.useForm();
  const currentRole = currentDataset?.permission;
  const projectGeid = currentDataset?.globalEntityId;
  const projectId = currentDataset.id;
  const greenRoomData = [
    {
      title: 'Home',
      key: PanelKey.GREENROOM_HOME,
      icon: <UserOutlined />,
    },
  ];

  const coreData = [
    {
      title: 'Home',
      key: PanelKey.CORE_HOME,
      icon: <UserOutlined />,
    },
  ];
  const firstPane = greenRoomData[0];
  //Fetch tree data, create default panel
  const fetch = async () => {
    // let allFolders;

    addPane({
      path: firstPane.path,
      title: getTitle(`Green Room - ${firstPane.title}  `),
      key: firstPane.key,
      content: {
        projectId,
        type: DataSourceType.GREENROOM_HOME,
      },
    });
    props.setCurrentProjectActivePane(firstPane.key);
    activatePane(firstPane.key);
    if (currentDataset.permission !== 'contributor') {
      const vfoldersRes = await updateVfolders();
      const vfoldersNodes = vfoldersRes.map((folder) => {
        return {
          title: folder.name,
          key: 'vfolder-' + folder.name,
          icon: <CollectionIcon width={12} style={{ color: '#1b90fe' }} />,
          disabled: false,
          children: null,
          createdTime: folder.timeCreated,
          geid: folder.geid,
        };
      });
      props.setCurrentProjectTree({
        vfolders: vfoldersNodes,
      });
    }

    isInit.current = true;
  };

  const updateVfolderTree = async (
    editCollection,
    createCollection,
    deleteBtnLoading,
    updateBtnLoading,
  ) => {
    const vfoldersRes = await updateVfolders(); //already called on fetch Data, not sure if it can be deleted
    const vfoldersNodes = vfoldersRes.map((folder) => {
      return {
        title: folder.name,
        key: 'vfolder-' + folder.name,
        icon: <CollectionIcon width={12} style={{ color: '#1b90fe' }} />,
        disabled: false,
        children: null,
        createdTime: folder.timeCreated,
        geid: folder.geid,
      };
    });

    props.setCurrentProjectTree({
      vfolders: vfoldersNodes,
    });

    if (createCollection && saveBtnLoading) {
      setSaveBtnLoading(false);
      setCreateCollection(false);
      message.success(`${i18n.t('success:collections.addCollection')}`);
    }

    if (editCollection) {
      if (deleteBtnLoading) {
        setDeleteBtnLoading(false);
        remove(deletedPaneKey);
        message.success(`${i18n.t('success:collections.deleteCollection')}`);
      }

      if (updateBtnLoading) {
        setUpdateBtnLoading(false);
        setEditCollection(false);
        message.success(`${i18n.t('success:collections.updateCollections')}`);
      }
    }
  };

  useEffect(() => {
    fetch();
  }, [projectId]);

  useEffect(() => {
    if (currentDataset.permission !== 'contributor') {
      updateVfolderTree(
        editCollection,
        createCollection,
        deleteBtnLoading,
        updateBtnLoading,
      );
    }
  }, [vfolders.length, updateTimes]);

  async function updateVfolders() {
    try {
      const res = await listAllVirtualFolder(projectGeid);
      const virualFolders = res.data.result;
      setVfolders(virualFolders);
      return virualFolders;
    } catch (e) {
      return [];
    }
  }

  //Tab
  const onChange = (selectedActivePane) => {
    props.setCurrentProjectActivePane(selectedActivePane);
    activatePane(selectedActivePane);
    setTreeKey((prev) => {
      return prev.treeKey + 1;
    });
  };

  const onEdit = (targetKey, action) => {
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
    if (selectedKeys[0] && selectedKeys[0].toString() === VFOLDER_CREATE_LEAF) {
      return;
    }
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

  const onCreateCollectionFormFinish = async (values) => {
    const { newCollectionName } = values;
    try {
      setSaveBtnLoading(true);
      await createVirtualFolder(projectGeid, newCollectionName);
      updateVfolders();
    } catch (error) {
      setSaveBtnLoading(false);
      switch (error.response?.status) {
        case 409: {
          message.error(
            `${i18n.t('errormessages:createVirtualFolder.duplicate.0')}`,
            3,
          );
          break;
        }
        case 400: {
          message.error(
            `${i18n.t('errormessages:createVirtualFolder.limit.0')}`,
            3,
          );
          break;
        }
        default: {
          message.error(
            `${i18n.t('errormessages:createVirtualFolder.default.0')}`,
            3,
          );
        }
      }
    }
  };

  const onUpdateCollectionFormFinish = async (values) => {
    try {
      let updateCollectionList = [];
      const originalNameList = vfolders.map((el) => el.name);
      const updateNameList = Object.values(values);
      const diffNameList = updateNameList.filter((el) => {
        if (!originalNameList.includes(el)) {
          return el;
        }
      });
      const geidList = Object.keys(values);
      geidList.forEach((el) => {
        if (diffNameList.includes(values[el])) {
          updateCollectionList.push({
            name: values[el],
            geid: el,
          });
        }
      });
      setUpdateBtnLoading(true);
      const res = await updateVirtualFolder(projectGeid, updateCollectionList);
      if (res.data.result.length > 0) {
        setUpdateTimes(updateTimes + 1);

        //update collection panel name
        const updatedPane = [...panes];

        if (panes.length > 0) {
          const vfolderIds = panes
            .filter((el) => el.key.startsWith('vfolder-'))
            .map((el) => el.content.geid);
          res.data.result.forEach((el) => {
            if (vfolderIds.includes(el.globalEntityId)) {
              const selectPane = updatedPane.find(
                (item) => item.content.geid === el.globalEntityId,
              );
              selectPane.title = getTitle(`Collection - ${el.name}  `);
              if (selectPane.key === activePane) {
                selectPane.key = `vfolder-${el.name}`;
                activatePane(selectPane.key);
              } else {
                selectPane.key = `vfolder-${el.name}`;
              }
            }
          });
          updatePanes(updatedPane);
        }
      } else {
        setUpdateBtnLoading(false);
        message.warning(
          `${i18n.t('errormessages:updateVirtualFolder.noFoldersToUpdate.0')}`,
        );
      }
    } catch (error) {
      setUpdateBtnLoading(false);
      message.error(`${i18n.t('errormessages:updateVirtualFolder.default.0')}`);
    }
  };

  const deleteCollection = async (geid, key) => {
    try {
      setDeleteBtnLoading(true);
      setDeletedPaneKey(key);
      await deleteVirtualFolder(geid);
      updateVfolders();
    } catch (error) {
      setDeleteBtnLoading(false);
      message.error(`${i18n.t('errormessages:deleteVirtualFolder.default.0')}`);
    }
  };

  const showEditButton = (
    editCollection,
    createCollection,
    vFolder,
    saveBtnLoading,
    deleteBtnLoading,
    updateBtnLoading,
  ) => {
    if (!editCollection && !createCollection) {
      if (vFolder && vFolder['vfolders'] && vFolder['vfolders'].length === 0) {
        return null;
      } else {
        return (
          <strong>
            <EditOutlined
              onClick={() => {
                setEditCollection(true);
                updateVfolders();
              }}
            />
          </strong>
        );
      }
    } else if (
      editCollection &&
      !createCollection &&
      !deleteBtnLoading &&
      !updateBtnLoading
    ) {
      return <CloseOutlined onClick={() => setEditCollection(false)} />;
    } else if (
      (editCollection && !createCollection && deleteBtnLoading) ||
      updateBtnLoading
    ) {
      return null;
    } else if (createCollection && !editCollection && !saveBtnLoading) {
      return <CloseOutlined onClick={() => setCreateCollection(false)} />;
    } else if (createCollection && !editCollection && saveBtnLoading) {
      return null;
    }
  };

  const showForm = (editCollection, createCollection) => {
    if (!editCollection && !createCollection) {
      return (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            margin: '3px 0px 0px 33px',
          }}
        >
          <PlusOutlined
            style={{
              width: '14px',
              height: '14px',
              color: '#1890FF',
              marginRight: '10px',
            }}
          />
          <span
            style={{
              fontSize: '12px',
              color: '#818181',
              cursor: 'pointer',
            }}
            onClick={() => setCreateCollection(true)}
          >
            Create Collection
          </span>
        </div>
      );
    } else if (editCollection && !createCollection) {
      return (
        <div style={{ display: 'flex', marginLeft: '33px' }}>
          <Form onFinish={onUpdateCollectionFormFinish}>
            {vfolders.map((el, index) => (
              <div style={{ display: 'flex', alignItems: 'baseline' }}>
                <Form.Item
                  className={styles.update_collection_name}
                  name={el.geid}
                  initialValue={el.name}
                  rules={[
                    {
                      required: true,
                      validator: (rule, value) => {
                        const collection = value ? trimString(value) : null;
                        if (!collection) {
                          return Promise.reject(
                            'Collection name should be 1 ~ 20 characters',
                          );
                        }
                        const isLengthValid =
                          collection.length >= 1 && collection.length <= 20;
                        if (!isLengthValid) {
                          return Promise.reject(
                            'Collection name should be 1 ~ 20 characters',
                          );
                        } else {
                          const specialChars = [
                            '\\',
                            '/',
                            ':',
                            '?',
                            '*',
                            '<',
                            '>',
                            '|',
                            '"',
                            "'",
                          ];
                          for (let char of specialChars) {
                            if (collection.indexOf(char) !== -1) {
                              return Promise.reject(
                                `Collection name can not contain any of the following character ${specialChars.join(
                                  ' ',
                                )}`,
                              );
                            }
                          }
                          return Promise.resolve();
                        }
                      },
                    },
                  ]}
                >
                  <Input
                    //defaultValue={el.name}
                    style={{
                      borderRadius: '6px',
                      marginLeft: '16px',
                      marginRight: '10px',
                      height: '28px',
                    }}
                  ></Input>
                </Form.Item>
                {deleteBtnLoading && deleteItemId === el.geid ? (
                  <LoadingOutlined spin style={{ marginRight: '10px' }} />
                ) : (
                  <DeleteOutlined
                    style={{ color: '#FF6D72', marginRight: '10px' }}
                    onClick={() => {
                      deleteCollection(el.geid, 'vfolder-' + el.name);
                      setDeleteItemId(el.geid);
                    }}
                  />
                )}
              </div>
            ))}
            <Form.Item
              style={{
                position: 'absolute',
                top: '0px',
                right: '33px',
                margin: '0px',
              }}
            >
              <Button
                type="primary"
                htmlType="submit"
                icon={<SaveOutlined />}
                loading={updateBtnLoading}
                style={{
                  height: '22px',
                  width: '70px',
                  borderRadius: '6px',
                  padding: '0px',
                }}
              >
                <span style={{ marginLeft: '6px' }}>Save</span>
              </Button>
            </Form.Item>
          </Form>
        </div>
      );
    } else if (createCollection && !editCollection) {
      return (
        <div style={{ display: 'flex', marginLeft: '33px' }}>
          <Form onFinish={onCreateCollectionFormFinish}>
            <div style={{ display: 'flex', alignItems: 'baseline' }}>
              <CollectionIcon width={12} style={{ color: '#1890FF' }} />
              <Form.Item
                className={styles.create_new_collection}
                name="newCollectionName"
                rules={[
                  {
                    required: true,
                    validator: (rule, value) => {
                      const collection = value ? trimString(value) : null;
                      if (!collection) {
                        return Promise.reject(
                          'Collection name should be 1 ~ 20 characters',
                        );
                      }
                      const isLengthValid =
                        collection.length >= 1 && collection.length <= 20;
                      if (!isLengthValid) {
                        return Promise.reject(
                          'Collection name should be 1 ~ 20 characters',
                        );
                      } else {
                        const specialChars = [
                          '\\',
                          '/',
                          ':',
                          '?',
                          '*',
                          '<',
                          '>',
                          '|',
                          '"',
                          "'",
                        ];
                        for (let char of specialChars) {
                          if (collection.indexOf(char) !== -1) {
                            return Promise.reject(
                              `Collection name can not contain any of the following character ${specialChars.join(
                                ' ',
                              )}`,
                            );
                          }
                        }
                        return Promise.resolve();
                      }
                    },
                  },
                ]}
              >
                <Input
                  placeholder="Enter Collection Name"
                  style={{
                    borderRadius: '6px',
                    marginLeft: '10px',
                    marginRight: '10px',
                    fontSize: '13px',
                  }}
                ></Input>
              </Form.Item>
            </div>
            <Form.Item
              style={{
                position: 'absolute',
                top: '0px',
                right: '33px',
                margin: '0px',
              }}
            >
              <Button
                type="primary"
                htmlType="submit"
                loading={saveBtnLoading}
                icon={<SaveOutlined />}
                style={{
                  height: '22px',
                  width: '70px',
                  borderRadius: '6px',
                  padding: '0px',
                }}
              >
                <span style={{ marginLeft: '6px' }}>Save</span>
              </Button>
            </Form.Item>
          </Form>
        </div>
      );
    }
  };
  return (
    <>
      <Row style={{ minWidth: 750 }}>
        <Col
          xs={24}
          sm={24}
          md={24}
          lg={24}
          xl={4}
          className={styles.file_dir}
        >
          <div className={styles.greenroom_section}>
            <div
              style={
                activePane === 'greenroom'
                  ? {
                      width: '135px',
                      backgroundColor: '#ACE4FD',
                      padding: '5px 11px',
                    }
                  : { padding: '5px 11px' }
              }
            >
              <strong>
                <HomeOutlined style={{ marginRight: '10px' }} />
                <span
                  className={styles.greenroom_title}
                  onClick={(e) =>
                    onSelect([PanelKey.GREENROOM], {
                      node: {
                        key: PanelKey.GREENROOM,
                        title: 'Green Room',
                      },
                    })
                  }
                >
                  Green Room
                </span>
              </strong>
            </div>
            <Tree
              className="green_room"
              showIcon
              selectedKeys={[activePane]}
              switcherIcon={<DownOutlined />}
              onSelect={onSelect}
              treeData={greenRoomData}
              key={treeKey}
            />
          </div>
          {!['contributor'].includes(currentRole) && (
            <div style={{ position: 'relative' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginTop: 5,
                  padding: '5px 11px 5px 0',
                }}
              >
                <div
                  style={
                    activePane === 'core'
                      ? {
                          width: '135px',
                          backgroundColor: '#ACE4FD',
                          padding: '5px 11px',
                        }
                      : { padding: '5px 11px' }
                  }
                >
                  <strong>
                    <CloudServerOutlined style={{ marginRight: '10px' }} />
                    <span
                      className={styles.core_title}
                      id='core_title'
                      onClick={(e) =>
                        onSelect([PanelKey.CORE], {
                          node: {
                            key: PanelKey.CORE,
                            title: 'Core',
                          },
                        })
                      }
                    >
                      Core
                    </span>
                  </strong>
                </div>
                <div>
                  {showEditButton(
                    editCollection,
                    createCollection,
                    props.project.tree,
                    saveBtnLoading,
                    deleteBtnLoading,
                    updateBtnLoading,
                  )}
                </div>
              </div>
              <Tree
                defaultExpandedKeys={[PanelKey.CORE_HOME]}
                showIcon
                selectedKeys={[activePane]}
                switcherIcon={<DownOutlined />}
                onSelect={onSelect}
                treeData={
                  props.project.tree &&
                  props.project.tree['vfolders'] &&
                  !editCollection
                    ? coreData.concat(props.project.tree['vfolders'])
                    : coreData
                }
                key={treeKey}
              />
              {showForm(editCollection, createCollection)}
            </div>
          )}
          {/* <Collapse
              title={'Saved Searches'}
              icon={<SaveOutlined style={{ marginRight: '4px' }} />}
            >
              <Tree className="save_search" showIcon />
            </Collapse> */}
          <div
            style={{ margin: '15px 0px 20px 10px' }}
            onClick={(e) =>
              onSelect([PanelKey.TRASH], {
                node: {
                  key: PanelKey.TRASH,
                  title: 'Trash Bin',
                },
              })
            }
          >
            <DeleteOutlined />
            <span className={styles.trash_bin}>Trash Bin</span>
          </div>
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
              {panes &&
                panes.map((pane) => (
                  <TabPane tab={pane.title} key={pane.key.toString()}>
                    <div
                      style={{
                        minHeight: '300px',
                      }}
                    >
                      <RawTable
                        projectId={pane.content.projectId}
                        type={pane.content.type}
                        panelKey={pane.key}
                        activePane={activePane}
                        removePanel={remove}
                        geid={pane.content.geid} // only for vfolder
                        title={pane.title}
                        titleText={pane.titleText}
                      />
                    </div>
                  </TabPane>
                ))}
            </Tabs>
          </div>
        </Col>
      </Row>
    </>
  );

  async function getNewPane(selectedKeys, info) {
    let newPane = {};
    if (selectedKeys[0] === PanelKey.GREENROOM_HOME) {
      const title = getTitle(`Green Room - ${info.node.title}  `);
      newPane = {
        title,
        content: {
          projectId,
          type: DataSourceType.GREENROOM_HOME,
        },
        key: info.node.key.toString(),
      };
    } else if (selectedKeys[0] === PanelKey.GREENROOM) {
      const title = getTitle('Green Room');
      newPane = {
        title,
        content: {
          projectId,
          type: DataSourceType.GREENROOM,
        },
        key: info.node.key.toString(),
      };
    } else if (selectedKeys[0] === PanelKey.CORE) {
      const title = getTitle('Core');
      newPane = {
        title,
        content: {
          projectId,
          type: DataSourceType.CORE,
        },
        key: info.node.key.toString(),
      };
    } else if (selectedKeys[0] === PanelKey.TRASH) {
      let title = getTitle(`Trash Bin`);
      let type = DataSourceType.TRASH;
      newPane = {
        title: title,
        content: {
          projectId: projectId,
          type,
        },
        key: info.node.key.toString(),
      };
    } else if (selectedKeys[0] === PanelKey.CORE_HOME) {
      const title = getTitle(`Core - ${info.node.title}  `);
      newPane = {
        title: title,
        content: {
          projectId: projectId,
          type: DataSourceType.CORE_HOME,
        },
        key: info.node.key.toString(),
      };
    } else if (selectedKeys[0].startsWith('vfolder')) {
      let vfolder = vfolders.find((v) => v.name === info.node.title);
      if (!vfolder) {
        const vfoldersRes = await updateVfolders();
        vfolder = vfoldersRes.find((v) => v.name === info.node.title);
      }
      if (vfolder) {
        const title = getTitle(`Collection - ${info.node.title}  `);
        newPane = {
          title: title,
          titleText: info.node.title,
          content: {
            projectId: projectId,
            type: DataSourceType.CORE_VIRTUAL_FOLDER,
            geid: info.node.geid,
          },
          key: info.node.key.toString(),
        };
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
