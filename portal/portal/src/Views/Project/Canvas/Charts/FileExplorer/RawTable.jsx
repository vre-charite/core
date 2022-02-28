import React, { useState, useRef } from 'react';
import {
  Button,
  Collapse,
  Progress,
  Spin,
  Typography,
  Select,
  Tag,
  Menu,
  Dropdown,
  Popover,
  Tooltip as Tip,
  Breadcrumb,
  message,
  Modal,
} from 'antd';
import { connect, useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import {
  CloudDownloadOutlined,
  UploadOutlined,
  SyncOutlined,
  MoreOutlined,
  CloseOutlined,
  FullscreenOutlined,
  PauseOutlined,
  FileOutlined,
  FolderOutlined,
  EllipsisOutlined,
  UserOutlined,
} from '@ant-design/icons';

import { ErrorMessager, namespace } from '../../../../../ErrorMessages';
import {
  appendDownloadListCreator,
  setFolderRouting,
  setTableLayoutReset,
} from '../../../../../Redux/actions';
import {
  downloadFilesAPI,
  fileLineageAPI,
  getZipContentAPI,
  getFileManifestAttrs,
  getFiles,
} from '../../../../../APIs';
import GreenRoomUploader from '../../../Components/GreenRoomUploader';
import FilesTable from './FilesTable';
import styles from './index.module.scss';
import {
  getCurrentProject,
  getFileSize,
  timeConvert,
  checkIsVirtualFolder,
  checkUserHomeFolder,
  checkRootFolder,
  checkGreenAndCore,
} from '../../../../../Utility';
import { setSuccessNum } from '../../../../../Redux/actions';
import LineageGraph from './LineageGraph';
import FileBasics from './FileBasics';
import FileBasicsModal from './FileBasicsModal';
import LineageGraphModal from './LineageGraphModal';
import {
  DataSourceType,
  TABLE_STATE,
  SYSTEM_TAGS,
  PanelKey,
} from './RawTableValues';
import Copy2CorePlugin from './Plugins/Copy2Core/Copy2CorePlugin';
import VirtualFolderPlugin from './Plugins/VirtualFolders/VirtualFolderPlugin';
import VirtualFolderFilesDeletePlugin from './Plugins/VirtualFolderDeleteFiles/VirtualFolderFilesDeletePlugin';
import VirtualFolderDeletePlugin from './Plugins/VirtualFolderDelete/VirtualFolderDeletePlugin';
import ZipContentPlugin from './Plugins/ZipContent/ZipContentPlugin';
import DeleteFilesPlugin from './Plugins/DeleteFiles/DeleteFilesPlugin';
import ManifestManagementPlugin from './Plugins/ManifestManagement/ManifestManagementPlugin';
import AddTagsPlugin from './Plugins/AddTags/AddTagsPlugin';
import RequestToCorePlugin from './Plugins/RequestToCore/RequestToCorePlugin';
import DatasetsPlugin from './Plugins/Datasets/DatasetsPlugin';
import CreateFolderPlugin from './Plugins/CreateFolder/CreateFolderPlugin';
import { tokenManager } from '../../../../../Service/tokenManager';
import FileManifest from './FileManifest';
import i18n from '../../../../../i18n';
import { FILE_OPERATIONS } from './FileOperationValues';
import { JOB_STATUS } from '../../../../../Components/Layout/FilePanel/jobStatus';
import { hideButton } from './hideButtons';
import { dcmProjectCode, DcmSpaceID } from '../../../../../config';
const { Panel } = Collapse;
const { Title } = Typography;
const _ = require('lodash');

function RawTable(props) {
  const { panelKey, removePanel, geid, titleText, activePane } = props; //the geid is for vfolder
  const dispatch = useDispatch();
  const ref = React.useRef(null);
  const [loading, setLoading] = useState(false);
  const [groupDownloadStatus] = useState({});
  let [rawFiles, setRawFiles] = useState({ data: [], total: 0 });
  const [reFreshing, setRefreshing] = useState(false);
  const [searchInput] = useState({});
  const [pageLoading, setPageLoading] = useState(true);
  const [isShown, toggleModal] = useState(false);
  const [tableKey, setTableKey] = useState(0);
  const [value, setValue] = useState([]);
  const [sidepanel, setSidepanel] = useState(false);
  const [currentRecord, setCurrentRecord] = useState({});
  const [fileModalVisible, setFileModalVisible] = useState(false);
  const [lineageModalVisible, setLineageModalVisible] = useState(false);
  const [previewModalVisible, setPreviewModalVisible] = useState(false);

  const [tableWidth, setTableWidth] = useState('100%');
  const [tableLoading, setTableLoading] = useState(false);
  const [detailsPanelWidth, setDetailsPanelWidth] = useState(300);
  const [tableState, setTableState] = useState(TABLE_STATE.NORMAL);
  const [lineageLoading, setLineageLoading] = useState(false);
  const [direction, setDirection] = useState('INPUT');
  const [menuItems, setMenuItems] = useState(0);
  const [tableReady, setTableReady] = useState(false);
  const [showPlugins, setShowPlugins] = useState(true);
  // const [tableLoading, setTableLoading] = useState(false);

  const sessionId = tokenManager.getCookie('sessionId');
  const currentDataset = getCurrentProject(props.projectId);
  const projectActivePanel = useSelector(
    (state) => state.project && state.project.tree && state.project.tree.active,
  );
  const [selectedRows, setSelectedFiles] = useState([]);
  const [selectedRowKeys, setSelectedFilesKeys] = useState([]);
  const folderRouting = useSelector(
    (state) => state.fileExplorer && state.fileExplorer.folderRouting,
  );
  const currentRouting = folderRouting[panelKey]
    ? folderRouting[panelKey].filter(
        (r) => typeof r.folderLevel !== 'undefined',
      )
    : folderRouting[panelKey];
  const deletedFileList = useSelector((state) => state.deletedFileList);
  const currentRecordNameSync = useRef(undefined);
  let permission = false;
  if (currentDataset) permission = currentDataset.permission;
  const updateFileManifest = (record, manifestIndex) => {
    const index = _.findIndex(rawFiles.data, (item) => item.key === record.key);
    rawFiles.data[index].manifest[manifestIndex].value =
      record.manifest[manifestIndex].value;
    setRawFiles({ ...rawFiles, data: [...rawFiles.data] });
  };
  const isRootFolder =
    checkGreenAndCore(panelKey) &&
    currentRouting &&
    currentRouting.length === 0;

  const getCurrentGeid = () => {
    let currentGeid;
    if (currentRouting && currentRouting.length) {
      currentGeid = currentRouting[currentRouting.length - 1].globalEntityId;
      if (currentRouting[currentRouting.length - 1].name === props.username) {
        currentGeid = null;
      }
    } else {
      if (isVFolder) {
        return geid;
      }
      currentGeid = datasetGeid;
    }

    return currentGeid;
  };
  const currentRouteLength = 0 || currentRouting?.length;

  const actionBarRef = useRef(null);
  const moreActionRef = useRef(null);
  const isVFolder = checkIsVirtualFolder(panelKey);
  useEffect(() => {
    //when routing changes, clear the row selection
    clearSelection();
  }, [currentRouteLength]);

  useEffect(() => {
    const debounced = _.debounce(() => {
      if (
        actionBarRef &&
        actionBarRef.current &&
        moreActionRef &&
        moreActionRef.current
      ) {
        const menuItems = hideButton(actionBarRef, moreActionRef);
        setMenuItems(menuItems);
        console.log(menuItems, 'menuItems');
      }
    }, 200);
    window.addEventListener('resize', debounced);
  }, []);
  const hasSelected = selectedRowKeys.length > 0;
  useEffect(() => {
    const menuItems = hideButton(actionBarRef, moreActionRef);
    setMenuItems(menuItems);
  }, [panelKey, hasSelected, props.type, permission, currentRouteLength]);

  useEffect(() => {
    if (
      rawFiles.data &&
      rawFiles.data.length &&
      currentRecord &&
      currentRecord.geid
    ) {
      const newRecord = rawFiles.data.find(
        (x) => x.geid === currentRecord.geid,
      );
      if (newRecord) {
        setCurrentRecord(newRecord);
        currentRecordNameSync.current = newRecord.name;
      }
    }
  }, [rawFiles.data]);

  const getColumnWidth = (
    panelKey,
    isDCM,
    isRootFolder,
    sidepanelOpen,
    columnKey,
  ) => {
    const OPEN_SIDE = {
      name: '65%',
      action: 100,
    };
    const TRASH = {
      name: undefined,
      owner: '17%',
      deleteTime: 120,
      originalLocation: 150,
      size: 100,
      action: 80,
    };
    const COLLECTION = {
      name: '25%',
      owner: '17%',
      createTime: 120,
      size: 100,
      action: 100,
    };
    const GREENROOM_CORE_NOMAL = {
      name: '25%',
      owner: '17%',
      createTime: 120,
      size: 100,
      action: 100,
    };
    const GREENROOM_CORE_ROOT = {
      name: '35%',
      owner: '35%',
      createTime: '25%',
    };
    const GREENROOM_CORE_NOMAL_GEN = {
      name: '25%',
      owner: '17%',
      dcmID: 140,
      createTime: 120,
      size: 100,
      action: 80,
    };
    if (sidepanelOpen) {
      return OPEN_SIDE[columnKey];
    }

    if (panelKey.includes('trash')) {
      return TRASH[columnKey];
    }
    if (panelKey.startsWith('vfolder-')) {
      return COLLECTION[columnKey];
    }
    if (checkGreenAndCore(panelKey)) {
      if (isRootFolder) {
        return GREENROOM_CORE_ROOT[columnKey];
      } else {
        if (isDCM) {
          return GREENROOM_CORE_NOMAL_GEN[columnKey];
        } else {
          return GREENROOM_CORE_NOMAL[columnKey];
        }
      }
    }
  };
  let columns = [
    {
      title: '',
      dataIndex: 'nodeLabel',
      key: 'nodeLabel',
      width: 60,
      render: (text, record) => {
        if (record.nodeLabel.indexOf('Folder') !== -1) {
          if (checkGreenAndCore(panelKey) && currentRouting?.length === 0) {
            return <UserOutlined style={{ float: 'right' }} />;
          } else {
            return <FolderOutlined style={{ float: 'right' }} />;
          }
        } else {
          return <FileOutlined style={{ float: 'right' }} />;
        }
      },
    },
    {
      title: 'Name',
      dataIndex: 'fileName',
      key: 'fileName',
      sorter: true,
      width: getColumnWidth(
        panelKey,
        currentDataset.code === dcmProjectCode,
        isRootFolder,
        sidepanel,
        'name',
      ),
      searchKey: !panelKey.startsWith('vfolder-') ? 'name' : null,
      render: (text, record) => {
        let filename = text;
        if (!filename) {
          const fileArray = record.name && record.name.split('/');
          if (fileArray && fileArray.length)
            filename = fileArray[fileArray.length - 1];
        }
        let hasPopover = false;
        let popoverContent = '';
        if (filename && filename.length > 45) {
          hasPopover = true;
          popoverContent = filename;
        }
        if (tableState === TABLE_STATE.MANIFEST_APPLY && record.manifest) {
          hasPopover = true;
          popoverContent = filename + ' has an annotate attached';
        }
        return (
          <div
            style={{
              cursor:
                record.nodeLabel.indexOf('Folder') !== -1
                  ? 'pointer'
                  : 'default',
            }}
            onClick={(e) => {
              if (
                deletedFileList &&
                deletedFileList.find(
                  (el) =>
                    el.payload?.geid === record.geid &&
                    el.status === JOB_STATUS.RUNNING,
                )
              ) {
                return;
              }
              let recordGeid = record.geid;
              if (
                checkGreenAndCore(panelKey) &&
                currentRouting?.length === 0 &&
                record.name === props.username
              ) {
                recordGeid = null;
              }
              if (record.nodeLabel.indexOf('Folder') !== -1) {
                dispatch(setTableLayoutReset(panelKey));
                refreshFiles({
                  geid: recordGeid,
                  sourceType: 'Folder',
                  node: { nodeLabel: record.nodeLabel },
                  resetTable: true,
                });
              }
            }}
          >
            {record.tags &&
            record.tags.indexOf(SYSTEM_TAGS['COPIED_TAG']) !== -1 &&
            tableState === TABLE_STATE.COPY_TO_CORE ? (
              <Tag color="default">{SYSTEM_TAGS['COPIED_TAG']}</Tag>
            ) : null}
            {deletedFileList &&
            deletedFileList.find(
              (el) =>
                el.payload?.geid === record.geid &&
                el.status === JOB_STATUS.RUNNING,
            ) ? (
              <Tag color="default">to be deleted</Tag>
            ) : null}
            {hasPopover ? (
              <Popover content={<span>{popoverContent}</span>}>
                {filename && filename.length > 45
                  ? `${filename.slice(0, 45)}...`
                  : filename}
              </Popover>
            ) : (
              <span>{filename}</span>
            )}
          </div>
        );
      },
    },
    {
      title: 'Added',
      dataIndex: 'owner',
      key: 'owner',
      sorter:
        projectActivePanel === 'greenroom-raw' &&
        ['collaborator', 'contributor'].includes(permission)
          ? false
          : true,
      width: getColumnWidth(
        panelKey,
        currentDataset.code === dcmProjectCode,
        isRootFolder,
        sidepanel,
        'owner',
      ),
      searchKey:
        (projectActivePanel &&
          projectActivePanel.startsWith('greenroom-') &&
          ['collaborator', 'contributor'].includes(permission)) ||
        panelKey.startsWith('vfolder-')
          ? null
          : 'owner',
      ellipsis: true,
    },
    currentDataset &&
    currentDataset.code === dcmProjectCode &&
    !panelKey.includes('trash') &&
    !panelKey.startsWith('vfolder-')
      ? {
          title: DcmSpaceID,
          dataIndex: "dcmId",
          key: "dcmID",
          sorter: true,
          width: getColumnWidth(
            panelKey,
            currentDataset.code === dcmProjectCode,
            isRootFolder,
            sidepanel,
            "dcmID",
          ),
          searchKey: "dcmID",
          ellipsis: true,
          render: (text, record) => {
            if (text === 'undefined') {
              return '';
            } else {
              return text;
            }
          },
        }
      : {},
    !panelKey.includes('trash')
      ? {
          title: 'Created',
          dataIndex: 'createTime',
          key: 'createTime',
          sorter: true,
          width: getColumnWidth(
            panelKey,
            currentDataset.code === dcmProjectCode,
            isRootFolder,
            sidepanel,
            'createTime',
          ),
          ellipsis: true,
          render: (text, record) => {
            return text && timeConvert(text, 'date');
          },
        }
      : {},
    panelKey.includes('trash')
      ? {
          title: 'Deleted Date',
          dataIndex: 'createTime',
          key: 'createTime',
          sorter: true,
          width: getColumnWidth(
            panelKey,
            currentDataset.code === dcmProjectCode,
            isRootFolder,
            sidepanel,
            'deleteTime',
          ),
          ellipsis: true,
          render: (text, record) => {
            return text && timeConvert(text, 'date');
          },
        }
      : {},
    panelKey.includes('trash')
      ? {
          title: 'Original Location',
          dataIndex: 'nodeLabel',
          key: 'nodeLabel',
          render: (text, record) => {
            if (
              record.nodeLabel.indexOf('Greenroom') !== -1 ||
              record.nodeLabel.indexOf('greenroom') !== -1
            ) {
              return 'Green Room';
            } else if (record.nodeLabel.indexOf('Core') !== -1) {
              return 'Core';
            } else {
              return '';
            }
          },
          ellipsis: true,
          width: getColumnWidth(
            panelKey,
            currentDataset.code === dcmProjectCode,
            isRootFolder,
            sidepanel,
            'originalLocation',
          ),
        }
      : {},
    (checkGreenAndCore(panelKey) && !isRootFolder) ||
    !checkGreenAndCore(panelKey)
      ? {
          title: 'Size',
          dataIndex: 'fileSize',
          key: 'fileSize',
          render: (text, record) => {
            if ([undefined, null].includes(record.fileSize)) {
              return '';
            }
            return getFileSize(text);
          },
          sorter: true,
          ellipsis: true,
          width: getColumnWidth(
            panelKey,
            currentDataset.code === dcmProjectCode,
            isRootFolder,
            sidepanel,
            'size',
          ),
        }
      : {},
    (checkGreenAndCore(panelKey) && !isRootFolder) ||
    !checkGreenAndCore(panelKey)
      ? {
          title: 'Action',
          key: 'action',
          width: getColumnWidth(
            panelKey,
            currentDataset.code === dcmProjectCode,
            isRootFolder,
            sidepanel,
            'action',
          ),
          render: (text, record) => {
            let file = record.name;
            var folder = file && file.substring(0, file.lastIndexOf('/') + 1);
            var filename =
              file && file.substring(file.lastIndexOf('/') + 1, file.length);
            let files = [
              {
                file: filename,
                path: folder,
                geid: record.geid,
                project_code: currentDataset.code,
              },
            ];

            const menu = (
              <Menu>
                <Menu.Item
                  disabled={
                    deletedFileList &&
                    deletedFileList.find(
                      (el) =>
                        el.payload?.geid === record.geid &&
                        el.status === JOB_STATUS.RUNNING,
                    ) &&
                    true
                  }
                  onClick={(e) => openFileSider(record)}
                >
                  Properties
                </Menu.Item>
                {!panelKey.includes('trash') && <Menu.Divider />}
                {!panelKey.includes('trash') && (
                  <Menu.Item
                    disabled={
                      deletedFileList &&
                      deletedFileList.find(
                        (el) =>
                          el.payload?.geid === record.geid &&
                          el.status === JOB_STATUS.RUNNING,
                      ) &&
                      true
                    }
                    onClick={async (e) => {
                      downloadFilesAPI(
                        props.projectId,
                        files,
                        null,
                        props.appendDownloadListCreator,
                        sessionId,
                        currentDataset.code,
                        props.username,
                        panelKey.startsWith('greenroom') ? 'greenroom' : 'Core',
                      )
                        .then((res) => {
                          if (res) {
                            const url = res;
                            window.open(url, '_blank');
                            setTimeout(() => {
                              dispatch(setSuccessNum(props.successNum + 1));
                            }, 3000);
                          }
                        })
                        .catch((err) => {
                          if (err.response) {
                            const errorMessager = new ErrorMessager(
                              namespace.project.files.downloadFilesAPI,
                            );
                            errorMessager.triggerMsg(err.response.status);
                          }
                          return;
                        });
                    }}
                  >
                    Download
                  </Menu.Item>
                )}
                {!panelKey.includes('trash') &&
                  record &&
                  record.name &&
                  record.name.split('.').pop() === 'zip' && <Menu.Divider />}
                {!panelKey.includes('trash') &&
                  record &&
                  record.name &&
                  record.name.split('.').pop() === 'zip' && (
                    <Menu.Item
                      style={{ textAlign: 'center' }}
                      onClick={async () => {
                        const { geid } = record;
                        const zipRes = await getZipContentAPI(
                          geid,
                          currentDataset && currentDataset.globalEntityId,
                        );
                        if (zipRes.status === 200)
                          record = {
                            ...record,
                            zipContent: zipRes.data && zipRes.data.result,
                          };
                        setCurrentRecord(record);
                        currentRecordNameSync.current = record.name;
                        setPreviewModalVisible(true);
                      }}
                    >
                      Preview
                    </Menu.Item>
                  )}
              </Menu>
            );
            const isDeleted =
              deletedFileList &&
              deletedFileList.find(
                (el) =>
                  el.fileName === record.fileName &&
                  el.source === record.name &&
                  el.status === JOB_STATUS.RUNNING,
              );
            return (
              <Dropdown
                overlay={menu}
                placement="bottomRight"
                disabled={isDeleted !== undefined}
              >
                <Button shape="circle">
                  <MoreOutlined />
                </Button>
              </Dropdown>
            );
          },
        }
      : {},
  ];

  columns = columns.filter((v) => Object.keys(v).length !== 0);
  if (sidepanel) {
    columns = columns.filter((v) => v.key === 'fileName' || v.key === 'action');
  }
  useEffect(() => {
    setPageLoading(false);
  }, [searchInput, props.projectId, props.rawData]);

  const datasetGeid = currentDataset?.globalEntityId;
  async function fetchData() {
    if (currentRouting && currentRouting.length) {
      const leveledRoutes = currentRouting.sort((a, b) => {
        return a.folderLevel - b.folderLevel;
      });
      const routeToGo = leveledRoutes.pop();
      if (routeToGo) {
        setRefreshing(true);
        await refreshFiles({
          geid:
            routeToGo.displayPath === props.username
              ? null
              : routeToGo.globalEntityId,
          sourceType: 'Folder',
          node: { nodeLabel: routeToGo.labels },
          resetTable: true,
        });
        dispatch(setTableLayoutReset(panelKey));
        setRefreshing(false);
      }
    } else {
      setRefreshing(true);
      await refreshFiles({
        geid: isVFolder ? geid : datasetGeid, // TODO: or dataset or folder Geid
        sourceType: getSourceType(),
        resetTable: true,
      });
      dispatch(setTableLayoutReset(panelKey));
      setRefreshing(false);
    }
  }
  useEffect(() => {
    if (panelKey === projectActivePanel && datasetGeid && tableReady) {
      fetchData();
    }
    // eslint-disable-next-line
  }, [props.successNum, datasetGeid]);

  async function firstTimeLoad() {
    let geidParam;
    if (isVFolder) {
      geidParam = geid;
    } else {
      if (checkUserHomeFolder(panelKey)) {
        geidParam = null;
      } else {
        geidParam = datasetGeid;
      }
    }
    const getSourceTypeParam = () => {
      if (checkIsVirtualFolder(panelKey)) {
        return 'Collection';
      } else if (panelKey.toLowerCase().includes('trash')) {
        return 'TrashFile';
      }
      if (checkRootFolder(panelKey)) {
        return 'Project';
      } else {
        return 'Folder';
      }
    };
    refreshFiles({
      geid: geidParam, // TODO: or dataset or folder Geid
      sourceType: getSourceTypeParam(),
      resetTable: true,
    });
  }
  useEffect(() => {
    // first time loading
    setTableReady(true);
    firstTimeLoad();
    // createFolderIfNotExist();
  }, []);

  const onSelectChange = (selectedRowKeys, selectedRowsNew) => {
    setSelectedFilesKeys(selectedRowKeys);
    let tmpSelectedRows = selectedRows
      .concat(selectedRowsNew)
      .filter((item) => item !== undefined);
    let totalSelectedRows = selectedRowKeys.map(
      (key) => tmpSelectedRows.filter((item) => item.geid === key)[0],
    );
    setSelectedFiles(totalSelectedRows);
  };

  async function onPanelChange(keys) {}

  async function openFileSider(record) {
    setCurrentRecord(record);
    currentRecordNameSync.current = record.name;
    setSidepanel(true);
    if (record.nodeLabel.indexOf('Folder') === -1) {
      await updateLineage(record, 'INPUT');
    }
  }

  async function updateLineage(record, direction) {
    try {
      const { geid } = record;
      let recordWithLineage = {};
      const res = await fileLineageAPI(geid, 'file_data', direction);
      const lineageData = res.data && res.data.result;
      const entities = lineageData && lineageData.guidEntityMap;
      for (const key in entities) {
        const entity = entities[key];
        if (
          entity &&
          entity.attributes.zone &&
          entity.attributes.zone.indexOf('Greenroom') !== -1
        ) {
          const data = [];
          data.push(entity.attributes.globalEntityId);
          const manifestRes = await getFileManifestAttrs(data, true);

          if (manifestRes.status === 200) {
            entity.fileManifests =
              manifestRes.data.result &&
              manifestRes.data.result[entity.attributes.globalEntityId];
          }
        }
      }

      recordWithLineage = { ...record, lineage: lineageData };

      setLineageLoading(false);
      if (
        currentRecordNameSync.current !== undefined &&
        recordWithLineage.name !== currentRecordNameSync.current
      )
        return;
      setCurrentRecord(recordWithLineage);
      currentRecordNameSync.current = recordWithLineage.name;
      setDirection(direction);
    } catch (error) {
      setLineageLoading(false);
    }
  }

  function closeFileSider() {
    setSidepanel(false);
  }

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
    getCheckboxProps: (record) => {
      if (tableState === TABLE_STATE.MANIFEST_APPLY) {
        if (record.manifest && record.manifest.length !== 0) {
          return {
            disabled: true,
          };
        }
      }
      if (deletedFileList) {
        const isDeleted = deletedFileList.find((el) => {
          return (
            el.payload.geid === record.geid && el.status === JOB_STATUS.RUNNING
          );
        });

        if (isDeleted) {
          return {
            disabled: true,
          };
        }
      }
    },
  };

  const downloadFiles = async () => {
    setLoading(true);
    let files = [];
    selectedRows.forEach((i) => {
      let file = i;
      files.push({
        owner: file.owner,
        geid: file.geid,
        project_code: currentDataset.code,
        location: file.location,
      });
    });
    downloadFilesAPI(
      props.projectId,
      files,
      setLoading,
      props.appendDownloadListCreator,
      sessionId,
      currentDataset.code,
      props.username,
      panelKey.startsWith('greenroom') ? 'greenroom' : 'Core',
    )
      .then((res) => {
        // if (files && files.length === 1)
        //   dispatch(setSuccessNum(props.successNum + 1));
        if (res) {
          const url = res;
          window.open(url, '_blank');
          setTimeout(() => {
            dispatch(setSuccessNum(props.successNum + 1));
          }, 3000);
        }
      })
      .catch((err) => {
        setLoading(false);
        if (err.response) {
          const errorMessager = new ErrorMessager(
            namespace.project.files.downloadFilesAPI,
          );
          errorMessager.triggerMsg(err.response.status);
        }
        return;
      })
      .finally(() => {
        if (setLoading) {
          setLoading(false);
        }
      });
    clearSelection();
  };

  const onFold = (key) => {
    const data = [];

    for (let el of rawFiles.data) {
      if (el.key === key) el = { ...el, lineage: {} };

      data.push(el);
    }
    setRawFiles({
      ...rawFiles,
      data: data,
    });
  };

  function handleOk(e) {
    setFileModalVisible(false);
  }

  function handleLineageCancel(e) {
    setLineageModalVisible(false);
  }

  function handlePreviewCancel(e) {
    setPreviewModalVisible(false);
  }

  function mouseDown(e) {
    document.addEventListener('mousemove', mouseMove, true);
    document.addEventListener('mouseup', stopMove, true);
  }
  function clearSelection() {
    clearFilesSelection();
  }

  /**
   * Set the panel width based on mouse position and width of the file panel
   *
   * @param {*} e
   */
  function mouseMove(e) {
    const mouseX = e.clientX;
    const parentX = ref.current.getClientRects()[0].x;
    const parentWidth = ref.current.getClientRects()[0].width;
    const delta = mouseX - parentX;
    const maxPanelwidth = 500;
    const panelWidth =
      parentWidth - delta > maxPanelwidth ? maxPanelwidth : parentWidth - delta;
    const tableWidth = parentWidth - panelWidth;

    setTableWidth(tableWidth < 500 ? 500 : tableWidth);
    setDetailsPanelWidth(panelWidth);
  }

  function stopMove() {
    document.removeEventListener('mousemove', mouseMove, true);
    document.removeEventListener('mouseup', stopMove, true);
  }

  useEffect(() => {
    const debounce = _.debounce(
      () => {
        setTableWidth('100%');
        setDetailsPanelWidth(300);
      },
      1000,
      { leading: false },
    );
    window.addEventListener('resize', debounce);

    return () => window.removeEventListener('resize', debounce);
  }, []);

  function clearFilesSelection() {
    setSelectedFiles([]);
    setSelectedFilesKeys([]);
  }
  async function goRoot() {
    let sourceType;
    const folderRoutingTemp = folderRouting || {};
    folderRoutingTemp[panelKey] = null;
    dispatch(setFolderRouting(folderRoutingTemp));
    dispatch(setTableLayoutReset(panelKey));
    const isVFolder = checkIsVirtualFolder(panelKey);

    if (isVFolder) {
      sourceType = 'Collection';
    } else if (panelKey.toLowerCase().includes('trash')) {
      sourceType = 'TrashFile';
    } else {
      sourceType = 'Project';
    }

    await refreshFiles({
      geid: isVFolder ? geid : datasetGeid,
      sourceType,
      resetTable: true,
    });
  }

  const getSourceType = () => {
    if (checkIsVirtualFolder(panelKey)) {
      return 'Collection';
    } else if (panelKey.toLowerCase().includes('trash')) {
      return 'TrashFile';
    }

    // this check is for table columns sorting and get source type when clicing on refresh button.
    if (checkGreenAndCore(panelKey) && currentRouting?.length > 0) {
      return 'Folder';
    } else {
      return 'Project';
    }
  };

  /**
   * The function take an object as the parameter. The following are the properties of that object
   * @param {string} geid the geid of project or folder. virtual folder will skip geid since it uses folderId
   * @param {number} page
   * @param {number} pageSize
   * @param {string} orderBy order by which column
   * @param {"desc"|"asc"} orderType "desc"|"asc"
   * @param {*} query the query search text. should convert it to an object if it's an array
   * @param {string[]} partial what queries are partial search. If it's undefined, all keys in query will be search partially.
   * @param {"Project"|"Folder"|"TrashFile"} sourceType "Project"|"Folder"|"TrashFile" skip this for virtual folder
   * @param {boolean} resetTable wether needed to reset the table page, page size, sorting and search text.
   * @returns
   */
  async function refreshFiles(params) {
    let {
      geid,
      page = 0,
      pageSize = 10,
      orderBy = 'createTime',
      orderType = 'desc',
      query = {},
      partial,
      sourceType,
      resetTable = false,
      node = null,
    } = params;
    if (tableLoading) return;
    setTableLoading(true);
    let res;

    try {
      if (!partial) {
        partial = [];
        Object.keys(query).forEach((key) => {
          partial.push(mapColumnKey(key));
        });
      }
      res = await getFiles(
        geid,
        page,
        pageSize,
        mapColumnKey(orderBy),
        orderType,
        mapQueryKeys(query),
        getZone(panelKey, permission, sourceType, node),
        sourceType,
        partial,
        panelKey,
        datasetGeid,
      );
      res = await insertManifest(res);
      const { files, total } = resKeyConvert(res);

      setRawFiles({
        data: files,
        total: total,
      });

      updateFolderRouting(res);
      setShowPlugins(true);
    } catch (error) {
      setShowPlugins(false);
      console.error(error);
      if (error.response && error.response.status === 404) {
        message.error('No user folder found');
      } else {
        message.error(
          `${i18n.t('errormessages:rawTable.getFilesApi.default.0')}`,
        );
      }
    }
    setTableLoading(false);

    if (resetTable) setTableKey(tableKey + 1);
  }

  const orderRouting =
    currentRouting &&
    currentRouting.sort((a, b) => {
      return a.folderLevel - b.folderLevel;
    });
  const plugins = [
    {
      condition: !isRootFolder && checkGreenAndCore(panelKey),
      elm: (
        <CreateFolderPlugin
          refresh={() => {
            !reFreshing && fetchData();
          }}
          currentRouting={currentRouting}
          projectCode={currentDataset.code}
          uploader={props.username}
          panelKey={panelKey}
        />
      ),
    },
    {
      condition: !hasSelected,
      elm: (
        <Button
          onClick={() => {
            !reFreshing && fetchData();
          }}
          type="link"
          icon={<SyncOutlined spin={reFreshing} />}
          style={{ marginRight: 8 }}
        >
          Refresh
        </Button>
      ),
    },
    {
      condition:
        !isRootFolder &&
        !hasSelected &&
        (props.type === DataSourceType.GREENROOM_HOME ||
          props.type === DataSourceType.GREENROOM),
      elm: (
        <Button
          id="raw_table_upload"
          type="link"
          onClick={() => toggleModal(true)}
          icon={<UploadOutlined />}
          style={{ marginRight: 8 }}
        >
          Upload
        </Button>
      ),
    },
    {
      condition: !panelKey.includes('trash') && hasSelected,
      elm: (
        <Button
          onClick={downloadFiles}
          loading={loading}
          type="link"
          icon={<CloudDownloadOutlined />}
          style={{ marginRight: 8 }}
        >
          Download
        </Button>
      ),
    },
    {
      condition:
        !isRootFolder &&
        (props.type === DataSourceType.GREENROOM_HOME ||
          props.type === DataSourceType.GREENROOM) &&
        permission === 'admin',
      elm: (
        <Copy2CorePlugin
          tableState={tableState}
          setTableState={setTableState}
          selectedRowKeys={selectedRowKeys}
          clearSelection={clearSelection}
          selectedRows={selectedRows}
          panelKey={panelKey}
        />
      ),
    },
    {
      condition:
        !isRootFolder &&
        (props.type === DataSourceType.CORE_HOME ||
          props.type === DataSourceType.CORE) &&
        hasSelected,
      elm: (
        <VirtualFolderPlugin
          tableState={tableState}
          setTableState={setTableState}
          selectedRowKeys={selectedRowKeys}
          clearSelection={clearSelection}
          selectedRows={selectedRows}
          panelKey={panelKey}
        />
      ),
    },
    {
      condition:
        !panelKey.includes('trash') &&
        (props.type === DataSourceType.CORE_VIRTUAL_FOLDER || !isRootFolder),
      elm: (
        <AddTagsPlugin
          tableState={tableState}
          setTableState={setTableState}
          selectedRowKeys={selectedRowKeys}
          clearSelection={clearSelection}
          selectedRows={selectedRows}
          panelKey={panelKey}
        />
      ),
    },
    {
      condition:
        !panelKey.includes('trash') &&
        (props.type === DataSourceType.CORE_VIRTUAL_FOLDER || !isRootFolder),
      elm: (
        <ManifestManagementPlugin
          tableState={tableState}
          setTableState={setTableState}
          selectedRowKeys={selectedRowKeys}
          clearSelection={clearSelection}
          selectedRows={selectedRows}
          panelKey={panelKey}
        />
      ),
    },
    {
      condition:
        !isRootFolder &&
        (props.type === DataSourceType.CORE_HOME ||
          props.type === DataSourceType.CORE) &&
        (permission === 'admin' || 'collaborator'),
      elm: (
        <DatasetsPlugin
          tableState={tableState}
          setTableState={setTableState}
          selectedRowKeys={selectedRowKeys}
          clearSelection={clearSelection}
          selectedRows={selectedRows}
          panelKey={panelKey}
        />
      ),
    },
    {
      condition:
        props.type === DataSourceType.CORE_VIRTUAL_FOLDER &&
        !currentRouting?.length &&
        hasSelected,
      elm: (
        <VirtualFolderFilesDeletePlugin
          tableState={tableState}
          setTableState={setTableState}
          selectedRowKeys={selectedRowKeys}
          clearSelection={clearSelection}
          selectedRows={selectedRows}
          panelKey={panelKey}
        />
      ),
    },
    {
      condition:
        props.type !== DataSourceType.CORE_VIRTUAL_FOLDER &&
        !panelKey.includes('trash') &&
        !isRootFolder &&
        hasSelected,
      elm: (
        <DeleteFilesPlugin
          tableState={tableState}
          selectedRows={selectedRows}
          selectedRowKeys={selectedRowKeys}
          clearSelection={clearSelection}
          setTableState={setTableState}
          panelKey={panelKey}
          permission={permission}
        />
      ),
    },
    {
      condition:
        !isRootFolder &&
        (props.type === DataSourceType.GREENROOM_HOME ||
          props.type === DataSourceType.GREENROOM) &&
        hasSelected &&
        permission === 'collaborator',
      elm: (
        <RequestToCorePlugin
          tableState={tableState}
          setTableState={setTableState}
          selectedRowKeys={selectedRowKeys}
          clearSelection={clearSelection}
          selectedRows={selectedRows}
          panelKey={panelKey}
          currentRouting={currentRouting}
          orderRouting={orderRouting}
        />
      ),
    },
    {
      condition:
        props.type === DataSourceType.CORE_VIRTUAL_FOLDER &&
        !currentRouting?.length &&
        !hasSelected,
      elm: (
        <VirtualFolderDeletePlugin
          tableState={tableState}
          setTableState={setTableState}
          selectedRowKeys={selectedRowKeys}
          clearSelection={clearSelection}
          selectedRows={selectedRows}
          panelKey={panelKey}
          removePanel={removePanel}
        />
      ),
    },
  ];
  const ToolTipsAndTable = (
    <div style={{ position: 'relative' }}>
      <div
        style={{
          marginBottom: 36,
          marginTop: 20,
          position: 'relative',
        }}
        className={`${styles.file_explore_actions} file_explorer_header_bar`}
        ref={actionBarRef}
      >
        {currentRouting?.length ? (
          <>
            <div
              style={{
                marginLeft: 10,
                marginRight: 20,
                display: 'inline-block',
              }}
            >
              <Breadcrumb
                separator=">"
                style={{ maxWidth: 500, display: 'inline-block' }}
                className={`${styles.file_folder_path}`}
              >
                <Breadcrumb.Item
                  style={{
                    cursor: 'pointer',
                  }}
                  onClick={goRoot}
                >
                  {checkIsVirtualFolder(panelKey)
                    ? titleText
                    : panelKey.toLowerCase().includes('trash')
                    ? 'Trash'
                    : panelKey.toLowerCase().includes('core')
                    ? 'Core'
                    : 'Green Room'}
                </Breadcrumb.Item>
                {currentRouting.length > 4 ? (
                  <Breadcrumb.Item>...</Breadcrumb.Item>
                ) : null}
                {orderRouting
                  .slice(checkIsVirtualFolder(panelKey) ? -1 : -3)
                  .map((v) => {
                    let geid = v.globalEntityId;
                    if (v.displayPath === props.username) {
                      geid = null;
                    }
                    return (
                      <Breadcrumb.Item
                        style={
                          v.globalEntityId ===
                          orderRouting[orderRouting.length - 1].globalEntityId
                            ? null
                            : { cursor: 'pointer' }
                        }
                        onClick={() => {
                          if (
                            v.globalEntityId ===
                            orderRouting[orderRouting.length - 1].globalEntityId
                          ) {
                            return;
                          }
                          clearFilesSelection();
                          refreshFiles({
                            geid,
                            sourceType: 'Folder',
                            resetTable: true,
                            node: { nodeLabel: v.labels },
                          });
                          dispatch(setTableLayoutReset(panelKey));
                        }}
                      >
                        {v.name.length > 23 ? (
                          <Tip title={v.name}>
                            {v.name.slice(0, 20) + '...'}
                          </Tip>
                        ) : (
                          v.name
                        )}
                      </Breadcrumb.Item>
                    );
                  })}
              </Breadcrumb>
            </div>
          </>
        ) : (
          <Breadcrumb
            style={{
              maxWidth: 500,
              display: 'inline-block',
              marginLeft: 10,
              marginRight: 30,
            }}
            className={styles.file_folder_path}
          >
            <Breadcrumb.Item onClick={goRoot}>
              {checkIsVirtualFolder(panelKey)
                ? titleText
                : panelKey.toLowerCase().includes('trash')
                ? 'Trash'
                : panelKey.toLowerCase().includes('core')
                ? 'Core'
                : 'Green Room'}
            </Breadcrumb.Item>
          </Breadcrumb>
        )}
        {showPlugins &&
          plugins.map(({ condition, elm }) => {
            if (condition) {
              return elm;
            } else {
              return null;
            }
          })}
        {showPlugins && (
          <Dropdown
            overlayClassName={styles['drop-down']}
            overlay={
              <Menu className={styles[`show-menu-${menuItems}`]}>
                {plugins.map(({ condition, elm }) => {
                  if (condition) {
                    return <Menu.Item>{elm}</Menu.Item>;
                  } else {
                    return null;
                  }
                })}
              </Menu>
            }
          >
            <Button
              ref={moreActionRef}
              type="link"
              icon={<EllipsisOutlined />}
            ></Button>
          </Dropdown>
        )}

        {
          <div
            style={{
              float: 'right',
              marginRight: 40,
              marginTop: 4,
              display: `${hasSelected ? 'block' : 'none'}`,
            }}
          >
            {/* <CloseOutlined
              style={{ marginRight: 10 }}
              onClick={(e) => {
                clearSelection();
              }}
            /> */}
            <span>
              {hasSelected ? `Selected ${selectedRowKeys.length} items` : ''}
            </span>
          </div>
        }
      </div>

      <FilesTable
        columns={columns}
        dataSource={rawFiles.data}
        totalItem={rawFiles.total}
        updateTable={refreshFiles}
        activePane={activePane}
        projectId={props.projectId}
        rowSelection={rowSelection}
        tableKey={tableKey}
        panelKey={panelKey}
        successNum={props.successNum}
        // onExpand={onExpand}
        onFold={onFold}
        tags={value}
        selectedRecord={currentRecord}
        tableState={tableState}
        getCurrentGeid={getCurrentGeid}
        tableLoading={tableLoading}
        currentRouting={currentRouting}
      />
      {/* {tableLoading ? (
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(255,255,255,0.2)',
          }}
        ></div>
      ) : null} */}
    </div>
  );

  return (
    <Spin spinning={pageLoading}>
      {Object.keys(groupDownloadStatus).length !== 0 && (
        <Collapse
          bordered={false}
          defaultActiveKey={['1']}
          style={{ marginBottom: '15px' }}
        >
          <Panel header="Group Download Status" key="1">
            {Object.keys(groupDownloadStatus).map((f) => (
              <span>
                {f}
                <Progress percent={groupDownloadStatus[f]} />
              </span>
            ))}
          </Panel>
        </Collapse>
      )}

      <div id="rawTable-sidePanel" style={{ display: 'flex' }} ref={ref}>
        <div
          style={{
            borderRight: '1px solid rgb(240, 240, 240)',
            // paddingRight: '16px',
            marginRight: sidepanel ? '16px' : 0,
            width: tableWidth,
          }}
        >
          {ToolTipsAndTable}
        </div>
        {sidepanel && (
          <div
            style={{
              width: detailsPanelWidth,
              position: 'relative',
              minWidth: '180px',
              maxWidth: '500px',
            }}
          >
            <Button
              onMouseDown={mouseDown}
              type="link"
              style={{
                position: 'absolute',
                top: '50%',
                left: `-31px`,
                transform: 'translateY(-50%)',
                transition: 'none',
                cursor: 'ew-resize',
              }}
            >
              <PauseOutlined />
            </Button>
            <div style={{ position: 'relative' }}>
              <CloseOutlined
                onClick={() => {
                  setDirection('INPUT');
                  closeFileSider();
                  setCurrentRecord({});
                  currentRecordNameSync.current = undefined;
                }}
                style={{
                  zIndex: '99',
                  float: 'right',
                  marginTop: '11px',
                }}
              />
              <Title level={4} style={{ lineHeight: '1.9' }}>
                Properties
              </Title>
            </div>
            <Collapse defaultActiveKey={['1']} onChange={onPanelChange}>
              <Panel
                header="General"
                key="1"
                extra={
                  <Button
                    type="link"
                    onClick={(event) => {
                      // If you don't want click extra trigger collapse, you can prevent this:
                      setFileModalVisible(true);
                      event.stopPropagation();
                    }}
                    style={{ padding: 0, height: 'auto' }}
                  >
                    <FullscreenOutlined />
                  </Button>
                }
              >
                <FileBasics
                  panelKey={panelKey}
                  record={currentRecord}
                  pid={props.projectId}
                />
              </Panel>
              {currentRecord.nodeLabel.indexOf('Folder') === -1 ? (
                <Panel header="File Attributes" key="Manifest">
                  <FileManifest
                    updateFileManifest={updateFileManifest}
                    permission={permission}
                    currentRecord={currentRecord}
                  />
                </Panel>
              ) : null}
              {currentRecord.nodeLabel.indexOf('Folder') === -1 ? (
                <Panel
                  header={
                    <span
                      style={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        width: '80%',
                        whiteSpace: 'nowrap',
                        display: 'inline-block',
                      }}
                    >
                      Data Lineage Graph
                    </span>
                  }
                  key="2"
                  extra={
                    <Button
                      type="link"
                      onClick={(event) => {
                        // If you don't want click extra trigger collapse, you can prevent this:
                        updateLineage(currentRecord, 'INPUT');
                        setLineageModalVisible(true);
                        event.stopPropagation();
                      }}
                      style={{ padding: 0, height: 'auto' }}
                    >
                      <FullscreenOutlined />
                    </Button>
                  }
                  style={{ position: 'relative' }}
                >
                  <LineageGraph
                    type={props.type}
                    record={currentRecord}
                    width={detailsPanelWidth - 70}
                  />
                </Panel>
              ) : null}
            </Collapse>
          </div>
        )}
      </div>
      <GreenRoomUploader
        isShown={isShown}
        cancel={() => {
          toggleModal(false);
        }}
        datasetId={parseInt(props.projectId)}
        panelKey={panelKey}
      />
      <FileBasicsModal
        visible={fileModalVisible}
        record={currentRecord}
        pid={props.projectId}
        handleOk={handleOk}
        // handleCancel={handleCancel}
      />

      <LineageGraphModal
        visible={lineageModalVisible}
        type={props.type}
        record={currentRecord}
        handleLineageCancel={handleLineageCancel}
        updateLineage={updateLineage}
        loading={lineageLoading}
        setLoading={setLineageLoading}
        direction={direction}
        setDirection={setDirection}
      />

      <ZipContentPlugin
        record={currentRecord}
        visible={previewModalVisible}
        handlePreviewCancel={handlePreviewCancel}
      />
    </Spin>
  );

  function updateFolderRouting(res) {
    const folderRoutingTemp = folderRouting || {};
    folderRoutingTemp[panelKey] = res.data?.result?.routing;
    dispatch(setFolderRouting(folderRoutingTemp));
  }

  async function insertManifest(res) {
    const geidsList = res.data.result.entities
      .filter((e) => e.attributes?.nodeLabel?.indexOf('Folder') === -1)
      .map((e) => e.geid);
    let attrsMap = await getFileManifestAttrs(geidsList);
    attrsMap = attrsMap.data.result;
    res.data.result.entities = res.data.result.entities.map((entity) => {
      return {
        ...entity,
        manifest:
          attrsMap[entity.geid] && attrsMap[entity.geid].length
            ? attrsMap[entity.geid]
            : null,
      };
    });
    return res;
  }
}

export default connect(
  (state) => ({
    uploadList: state.uploadList,
    role: state.role,
    username: state.username,
    containersPermission: state.containersPermission,
    successNum: state.successNum,
  }),
  { appendDownloadListCreator },
)(RawTable);

/**
 * Do NOT call this function on virtual folder panel
 * @param {string} panelKey the current open panel key
 * @returns {"Greenroom" | "Core" | "All"} "Greenroom" | "Core" | "All"
 */
const getZone = (panelKey, role, sourceType, node) => {
  if (panelKey.includes('trash')) {
    if (sourceType === 'Folder') {
      if (node.nodeLabel.indexOf('Core') !== -1) {
        return 'Core';
      } else {
        return 'Greenroom';
      }
    } else {
      return role === 'contributor' ? 'Greenroom' : 'All';
    }
  }
  if (panelKey.startsWith('greenroom')) {
    return 'Greenroom';
  }
  if (panelKey.startsWith('core')) {
    return 'Core';
  }
  if (checkIsVirtualFolder(panelKey)) {
    return 'Core';
  }
  throw new TypeError('only greenroom, core and trash can use getZone');
};

function resKeyConvert(res) {
  const total = res.data?.result?.approximateCount;
  const result = res.data?.result?.entities;
  const files = result.map((item) => {
    return {
      ...item.attributes,
      name: item.attributes.fileName || item.geid,
      tags: item.labels,
      guid: item.guid,
      geid: item.geid,
      key: item.attributes.fileName || item.geid,
      manifest: item.manifest,
    };
  });
  return { files, total };
}

const mapColumnKey = (column) => {
  const columnMap = {
    createTime: 'time_created',
    fileName: 'name',
    owner: 'uploader',
    fileSize: 'file_size',
    dcmID: "dcm_id",
  };
  return columnMap[column] || column;
};

const mapQueryKeys = (query) => {
  let newQuery = {};
  Object.keys(query).forEach((oldKey) => {
    newQuery[mapColumnKey(oldKey)] = query[oldKey];
  });
  return newQuery;
};
