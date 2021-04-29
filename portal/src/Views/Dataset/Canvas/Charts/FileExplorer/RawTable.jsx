import React, { useState } from 'react';
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
  LeftOutlined,
} from '@ant-design/icons';

import { ErrorMessager, namespace } from '../../../../../ErrorMessages';
import {
  appendDownloadListCreator,
  setFolderRouting,
} from '../../../../../Redux/actions';
import {
  downloadFilesAPI,
  fileLineageAPI,
  listAllfilesVfolder,
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
  pathsMap,
} from '../../../../../Utility';
import { setSuccessNum } from '../../../../../Redux/actions';
import LineageGraph from './LineageGraph';
import FileBasics from './FileBasics';
import FileBasicsModal from './FileBasicsModal';
import LineageGraphModal from './LineageGraphModal';
import { DataSourceType, TABLE_STATE, SYSTEM_TAGS } from './RawTableValues';
import Copy2CorePlugin from './Plugins/Copy2Core/Copy2CorePlugin';
import VirtualFolderPlugin from './Plugins/VirtualFolders/VirtualFolderPlugin';
import VirtualFolderFilesDeletePlugin from './Plugins/VirtualFolderDeleteFiles/VirtualFolderFilesDeletePlugin';
import VirtualFolderDeletePlugin from './Plugins/VirtualFolderDelete/VirtualFolderDeletePlugin';
import ZipContentPlugin from './Plugins/ZipContent/ZipContentPlugin';
import DeleteFilesPlugin from './Plugins/DeleteFiles/DeleteFilesPlugin';
import ManifestManagementPlugin from './Plugins/ManifestManagement/ManifestManagementPlugin';
import { tokenManager } from '../../../../../Service/tokenManager';
import FileManifest from './FileManifest';
import i18n from '../../../../../i18n';
const { Panel } = Collapse;
const { Title } = Typography;
const _ = require('lodash');

function RawTable(props) {
  const { panelKey, folderId, removePanel } = props;
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

  const [tableWidth, setTableWidth] = useState('90%');
  const [tableLoading, setTableLoading] = useState(false);
  const [detailsPanelWidth, setDetailsPanelWidth] = useState(300);
  const [tableState, setTableState] = useState(TABLE_STATE.NORMAL);
  const [lineageLoading, setLineageLoading] = useState(false);
  const [direction, setDirection] = useState('INPUT');

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
  let permission = false;
  if (currentDataset) permission = currentDataset.permission;
  const updateFileManifest = (record, manifestIndex) => {
    const index = _.findIndex(rawFiles.data, (item) => item.key === record.key);
    rawFiles.data[index].manifest[manifestIndex].value =
      record.manifest[manifestIndex].value;
    setRawFiles({ ...rawFiles, data: [...rawFiles.data] });
  };

  const getCurrentGeid = () => {
    let geid;
    if (currentRouting && currentRouting.length) {
      geid = currentRouting[currentRouting.length - 1].globalEntityId;
    } else {
      geid = datasetGeid;
    }
    return geid;
  };

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
      }
    }
  }, [rawFiles.data]);
  let columns = [
    {
      title: '',
      dataIndex: 'nodeLabel',
      key: 'nodeLabel',
      width: 25,
      render: (text, record) => {
        if (record.nodeLabel.indexOf('Folder') !== -1) {
          return <FolderOutlined />;
        } else {
          return <FileOutlined />;
        }
      },
    },
    {
      title: 'Name',
      dataIndex: 'fileName',
      key: 'fileName',
      sorter: true,
      width: sidepanel ? '65%' : '25%',
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
              record.nodeLabel.indexOf('Folder') !== -1 &&
                refreshFiles({
                  geid: record.geid,
                  sourceType: 'Folder',
                });
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
                el.fileName === record.fileName &&
                el.source === record.name &&
                el.status === 'running',
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
      width: '17%',
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
    currentDataset.code === 'generate' &&
    !panelKey.includes('trash') &&
    !panelKey.startsWith('vfolder-')
      ? {
          title: 'Generate ID',
          dataIndex: 'generateId',
          key: 'generateID',
          sorter: true,
          width: '18%',
          searchKey: 'generateID',
          ellipsis: true,
          render: (text, record) => {
            if (text === 'undefined') {
              return 'N/A';
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
          width: '14%',
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
          width: '14%',
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
            if (record.nodeLabel.indexOf('Greenroom') !== -1) {
              return 'Green Room';
            } else if (record.nodeLabel.indexOf('VRECore') !== -1) {
              return 'Core';
            } else {
              return '';
            }
          },
          ellipsis: true,
          width: '18%',
        }
      : {},
    {
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
      width: '10%',
    },
    {
      title: 'Action',
      key: 'action',
      width: '75px',
      render: (text, record) => {
        let file = record.name;
        var folder = file && file.substring(0, file.lastIndexOf('/') + 1);
        var filename =
          file && file.substring(file.lastIndexOf('/') + 1, file.length);
        let files = [
          {
            file: filename,
            path: folder,
            full_path: record.qualifiedName,
            geid: record.geid,
            project_code: currentDataset.code,
          },
        ];

        const menu = (
          <Menu>
            <Menu.Item onClick={(e) => openFileSider(record)}>
              Properties
            </Menu.Item>
            {!panelKey.includes('trash') && <Menu.Divider />}
            {!panelKey.includes('trash') && (
              <Menu.Item
                onClick={(e) => {
                  downloadFilesAPI(
                    props.projectId,
                    files,
                    null,
                    props.appendDownloadListCreator,
                    sessionId,
                    currentDataset.code,
                    props.username,
                    panelKey.startsWith('greenroom') ? 'greenroom' : 'vre-core',
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
                          namespace.dataset.files.downloadFilesAPI,
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
                    const { name } = record;
                    const zipRes = await getZipContentAPI(name);
                    if (zipRes.status === 200)
                      record = {
                        ...record,
                        zipContent: zipRes.data && zipRes.data.result,
                      };
                    setCurrentRecord(record);
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
              el.status === 'running',
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
    },
  ];

  columns = columns.filter((v) => Object.keys(v).length !== 0);
  if (sidepanel) {
    columns = columns.filter((v) => v.key === 'fileName' || v.key === 'action');
  }
  useEffect(() => {
    setPageLoading(false);
  }, [
    // page,
    // pageSize,
    searchInput,
    props.projectId,
    props.rawData,
    // props.successNum,
  ]);

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
          geid: routeToGo.globalEntityId,
          sourceType: 'Folder',
          resetTable: true,
        });
        setRefreshing(false);
      }
    } else {
      await refreshFiles({
        geid: datasetGeid, // TODO: or dataset or folder Geid
        sourceType: getSourceType(),
        resetTable: true,
      });
    }
  }
  useEffect(() => {
    if (panelKey === projectActivePanel && datasetGeid) {
      fetchData();
    }
    // eslint-disable-next-line
  }, [props.successNum, datasetGeid]);

  /*   //when the copy succeed reload the page
  useEffect(()=>{

  },[copyEvent]); */

  const onSelectChange = (selectedRowKeys, selectedRowsNew) => {
    setSelectedFilesKeys(selectedRowKeys);
    let tmpSelectedRows = selectedRows
      .concat(selectedRowsNew)
      .filter((item) => item !== undefined);
    let totalSelectedRows = selectedRowKeys.map(
      (key) => tmpSelectedRows.filter((item) => item.key === key)[0],
    );
    setSelectedFiles(totalSelectedRows);
  };

  async function onPanelChange(keys) {}

  async function openFileSider(record) {
    setCurrentRecord(record);
    setSidepanel(true);
    if (record.nodeLabel.indexOf('Folder') === -1) {
      await updateLineage(record, 'INPUT');
    }
  }

  async function updateLineage(record, direction) {
    const { key } = record;
    let recordWithLineage = {};
    const res = await fileLineageAPI(key, 'file_data', direction);

    const lineageData = res.data && res.data.result;

    const entities = lineageData && lineageData.guidEntityMap;
    for (const key in entities) {
      const entity = entities[key];
      const pathArray =
        entity.attributes && entity.attributes.name
          ? entity.attributes.name.split('/')
          : [];
      const space = pathsMap(pathArray);
      if (entity && space === 'Green Room/Home') {
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
    setCurrentRecord(recordWithLineage);
    setLineageLoading(false);
    setDirection(direction);
  }

  function closeFileSider() {
    setSidepanel(false);
  }

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
    getCheckboxProps: (record) => {
      if (tableState === TABLE_STATE.MANIFEST_APPLY) {
        if (
          currentDataset.permission !== 'admin' &&
          record.owner !== props.username
        ) {
          return {
            disabled: true,
          };
        } else if (record.manifest && record.manifest.length !== 0) {
          return {
            disabled: true,
          };
        }
      }
      if (
        record &&
        record.nodeLabel &&
        record.nodeLabel.indexOf('Folder') !== -1
      ) {
        return {
          disabled: true,
        };
      }
      if (deletedFileList) {
        const isDeleted = deletedFileList.find(
          (el) =>
            el.fileName === record.fileName &&
            el.source === record.name &&
            el.status === 'running',
        );

        if (isDeleted) {
          return {
            disabled: true,
          };
        }
      }
    },
  };

  const downloadFiles = () => {
    setLoading(true);
    let files = [];
    selectedRows.forEach((i) => {
      let file = i;
      files.push({
        geid: file.geid,
        full_path: file.qualifiedName,
        project_code: currentDataset.code,
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
      panelKey.startsWith('greenroom') ? 'greenroom' : 'vre-core',
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
            namespace.dataset.files.downloadFilesAPI,
          );
          errorMessager.triggerMsg(err.response.status);
        }
        return;
      });
    clearSelection();
  };
  const hasSelected = selectedRowKeys.length > 0;

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
        setTableWidth('90%');
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
  async function goHome() {
    const folderRoutingTemp = folderRouting || {};
    folderRoutingTemp[panelKey] = null;
    dispatch(setFolderRouting(folderRoutingTemp));
    await refreshFiles({
      geid: datasetGeid,
      sourceType: 'Project',
      resetTable: true,
    });
  }

  const getSourceType = () => {
    if (checkIsVirtualFolder(panelKey)) {
      return null;
    } else {
      if (currentRouting?.length) {
        return 'Folder';
      }
      if (panelKey.toLowerCase().includes('trash')) {
        return 'TrashFile';
      }
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
  async function refreshFiles({
    geid,
    page = 0,
    pageSize = 10,
    orderBy = 'createTime',
    orderType = 'desc',
    query = {},
    partial,
    sourceType,
    resetTable = false,
  }) {
    if (tableLoading) return;
    setTableLoading(true);
    const isVirtualFolder = checkIsVirtualFolder(panelKey);
    let res;
    try {
      if (isVirtualFolder) {
        res = await listAllfilesVfolder(
          folderId,
          page,
          pageSize,
          orderType,
          mapColumnKey(orderBy),
        );
      } else {
        if (!partial) {
          partial = [];
          Object.keys(query).forEach((key) => {
            partial.push(mapColumnKey(key));
          });
        }
        if (!geid) throw new Error('geid is required');
        res = await getFiles(
          geid,
          page,
          pageSize,
          mapColumnKey(orderBy),
          orderType,
          mapQueryKeys(query),
          getZone(panelKey, permission),
          sourceType,
          partial,
        );
      }
      if (props.type === DataSourceType.GREENROOM_HOME) {
        //only green room home first level files have manifest
        res = await insertManifest(res);
      }

      const { files, total } = resKeyConvert(res);

      setRawFiles({
        data: files,
        total: total,
      });

      updateFolderRouting(res);
    } catch (error) {
      message.error(
        `${i18n.t('errormessages:rawTable.getFilesApi.default.0')}`,
      );
    }
    setTableLoading(false);

    if (resetTable) setTableKey(tableKey + 1);
  }

  const orderRouting =
    currentRouting &&
    currentRouting.sort((a, b) => {
      return a.folderLevel - b.folderLevel;
    });
  const ToolTipsAndTable = (
    <div style={{ position: 'relative' }}>
      <div
        style={{ marginBottom: 36, marginTop: 20, position: 'relative' }}
        className={styles.file_explore_actions}
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
                className={styles.file_folder_path}
              >
                <Breadcrumb.Item
                  style={{
                    cursor: 'pointer',
                  }}
                  onClick={goHome}
                >
                  Home
                </Breadcrumb.Item>
                {currentRouting.length > 4 ? (
                  <Breadcrumb.Item>...</Breadcrumb.Item>
                ) : null}
                {orderRouting.slice(-3).map((v) => {
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
                          geid: v.globalEntityId,
                          sourceType: 'Folder',
                        });
                      }}
                    >
                      {v.name.length > 23 ? (
                        <Tip title={v.name}>{v.name.slice(0, 20) + '...'}</Tip>
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
            <Breadcrumb.Item onClick={goHome}>Home</Breadcrumb.Item>
          </Breadcrumb>
        )}

        {!hasSelected && (
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
        )}
        {!hasSelected && props.type === DataSourceType.GREENROOM_HOME ? (
          <Button
            id="raw_table_upload"
            type="link"
            onClick={() => toggleModal(true)}
            icon={<UploadOutlined />}
            style={{ marginRight: 8 }}
          >
            Upload
          </Button>
        ) : null}
        {!panelKey.includes('trash') && hasSelected ? (
          <Button
            onClick={downloadFiles}
            loading={loading}
            type="link"
            icon={<CloudDownloadOutlined />}
            style={{ marginRight: 8 }}
          >
            Download
          </Button>
        ) : null}
        {props.type === DataSourceType.GREENROOM_HOME &&
        permission === 'admin' &&
        !currentRouting?.length ? (
          <Copy2CorePlugin
            tableState={tableState}
            setTableState={setTableState}
            selectedRowKeys={selectedRowKeys}
            clearSelection={clearSelection}
            selectedRows={selectedRows}
            panelKey={panelKey}
          />
        ) : null}
        {props.type === DataSourceType.CORE_HOME &&
        !currentRouting?.length &&
        hasSelected ? (
          <VirtualFolderPlugin
            tableState={tableState}
            setTableState={setTableState}
            selectedRowKeys={selectedRowKeys}
            clearSelection={clearSelection}
            selectedRows={selectedRows}
            panelKey={panelKey}
          />
        ) : null}
        {hasSelected && props.type === DataSourceType.GREENROOM_HOME ? (
          <ManifestManagementPlugin
            tableState={tableState}
            setTableState={setTableState}
            selectedRowKeys={selectedRowKeys}
            clearSelection={clearSelection}
            selectedRows={selectedRows}
            panelKey={panelKey}
          />
        ) : null}
        {props.type === DataSourceType.CORE_VIRTUAL_FOLDER &&
        !currentRouting?.length &&
        hasSelected ? (
          <VirtualFolderFilesDeletePlugin
            tableState={tableState}
            setTableState={setTableState}
            selectedRowKeys={selectedRowKeys}
            clearSelection={clearSelection}
            selectedRows={selectedRows}
            panelKey={panelKey}
          />
        ) : null}
        {props.type !== DataSourceType.CORE_VIRTUAL_FOLDER &&
          !currentRouting?.length &&
          !panelKey.includes('trash') &&
          hasSelected && (
            <DeleteFilesPlugin
              tableState={tableState}
              selectedRows={selectedRows}
              selectedRowKeys={selectedRowKeys}
              clearSelection={clearSelection}
              setTableState={setTableState}
              panelKey={panelKey}
              permission={permission}
            />
          )}
        {props.type === DataSourceType.CORE_VIRTUAL_FOLDER &&
        !currentRouting?.length &&
        !hasSelected ? (
          <VirtualFolderDeletePlugin
            tableState={tableState}
            setTableState={setTableState}
            selectedRowKeys={selectedRowKeys}
            clearSelection={clearSelection}
            selectedRows={selectedRows}
            panelKey={panelKey}
            removePanel={removePanel}
          />
        ) : null}
        {hasSelected ? (
          <div
            style={{ float: 'right', display: 'inline-block', marginRight: 40 }}
          >
            <CloseOutlined
              style={{ marginRight: 10 }}
              onClick={(e) => {
                clearSelection();
              }}
            />
            <span>
              {hasSelected ? `Selected ${selectedRowKeys.length} items` : ''}
            </span>
          </div>
        ) : null}
      </div>

      <FilesTable
        columns={columns}
        dataSource={rawFiles.data}
        currentRouting={currentRouting}
        totalItem={rawFiles.total}
        updateTable={refreshFiles}
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
        getSourceType={getSourceType}
      />
      {tableLoading ? (
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
      ) : null}
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

      {sidepanel ? (
        <div id="rawTable-sidePanel" style={{ display: 'flex' }} ref={ref}>
          <div
            style={{
              borderRight: '1px solid rgb(240, 240, 240)',
              // paddingRight: '16px',
              marginRight: '16px',
              width: tableWidth,
              // overflow: 'scroll',
            }}
          >
            {ToolTipsAndTable}
          </div>
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
              {props.type === DataSourceType.GREENROOM_HOME &&
              currentRecord.nodeLabel.indexOf('Folder') === -1 ? (
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
        </div>
      ) : (
        <div
        // style={{ overflow: 'scroll' }}
        >
          {ToolTipsAndTable}
        </div>
      )}
      <GreenRoomUploader
        isShown={isShown}
        cancel={() => {
          toggleModal(false);
        }}
        datasetId={parseInt(props.projectId)}
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
      .filter((e) => e.displayText)
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
 * @returns {"Greenroom" | "VRECore" | "All"} "Greenroom" | "VRECore" | "All"
 */
const getZone = (panelKey, role) => {
  if (panelKey.includes('trash')) {
    return role === 'contributor' ? 'Greenroom' : 'All';
  }
  if (panelKey.startsWith('greenroom')) {
    return 'Greenroom';
  }
  if (panelKey.startsWith('core')) {
    return 'VRECore';
  }
  throw new TypeError('only greenroom, core and trash can use getZone');
};

/**
 *
 * @param {string} panelKey the current open panel key
 * @returns {boolean} true if the current panel is a virtual folder
 */
const checkIsVirtualFolder = (panelKey) => {
  return !(
    panelKey.includes('trash') ||
    panelKey.startsWith('greenroom') ||
    panelKey.startsWith('core')
  );
};

function resKeyConvert(res) {
  const total = res.data?.result?.approximateCount;
  const result = res.data?.result?.entities;
  const files = result.map((item) => {
    return {
      ...item.attributes,
      tags: item.labels,
      guid: item.guid,
      geid: item.geid,
      key: item.attributes.name,
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
    generateID: 'generate_id',
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
