import React, { useState, useRef } from 'react';
import {
  Button,
  Space,
  Collapse,
  Progress,
  Spin,
  Typography,
  Select,
  Tag,
  Menu,
  Dropdown,
  Tooltip,
  Popover,
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
} from '@ant-design/icons';

import { ErrorMessager, namespace } from '../../../../../ErrorMessages';
import { appendDownloadListCreator } from '../../../../../Redux/actions';
import {
  downloadFilesAPI,
  getFilesByTypeAPI,
  listProjectTagsAPI,
  fileLineageAPI,
  listAllfilesVfolder,
} from '../../../../../APIs';
import GreenRoomUploader from '../../../Components/GreenRoomUploader';
import FilesTable from './FilesTable';
import {
  getCurrentProject,
  getFileSize,
  timeConvert,
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
import Copy2ProcessedPlugin from './Plugins/Copy2Processed/Copy2ProcessedPlugin';
import { pipelines } from '../../../../../Utility/pipelines';
const { Panel } = Collapse;
const { Option } = Select;
const { Paragraph, Title } = Typography;
const _ = require('lodash');

function RawTable(props) {
  const { path, panelKey, folderId, removePanel } = props;
  const dispatch = useDispatch();
  const ref = React.useRef(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pageSize] = useState(10);
  const [page] = useState(0);
  const [totalItem, setTotalItem] = useState(0);
  const [groupDownloadStatus] = useState({});
  let [rawFiles, setRawFiles] = useState([]);
  const [reFreshing, setRefreshing] = useState(false);
  const [searchText] = useState([]);
  const [searchInput] = useState({});
  const [sortColumn] = useState('createTime');
  const [order] = useState('desc');
  const [pageLoading, setPageLoading] = useState(true);
  const [isShown, toggleModal] = useState(false);
  const [isQuery, toggleQueryPanel] = useState(false);
  const [tableKey, setTableKey] = useState(0);
  const [isEdit, toggleEditModal] = useState(false);
  const [tagList, setTagList] = useState([]);
  const [data, setData] = useState([]);
  const [value, setValue] = useState([]);
  const [fetching, setFetching] = useState(false);
  const [sidepanel, setSidepanel] = useState(false);
  const [currentRecord, setCurrentRecord] = useState({});
  const [fileModalVisible, setFileModalVisible] = useState(false);
  const [lineageModalVisible, setLineageModalVisible] = useState(false);

  const [tableWidth, setTableWidth] = useState('90%');
  const [detailsPanelWidth, setDetailsPanelWidth] = useState(300);
  const [tableState, setTableState] = useState(TABLE_STATE.NORMAL);
  // const [keyCopied, setKeyCopied] = useState([]);
  const [lineageLoading, setLineageLoading] = useState(false);
  const [direction, setDirection] = useState('INPUT');

  const sessionId = localStorage.getItem('sessionId');
  const currentDataset = getCurrentProject(props.projectId);
  const projectActivePanel = useSelector((state) => state.project && state.project.tree && state.project.tree.active);
  let permission = false;
  if (currentDataset) permission = currentDataset.permission;

  function getRawFilesAndUpdateUI(
    containerId,
    pageSize,
    page,
    panelKey,
    column,
    text,
    order,
    tags,
  ) {
    if (panelKey && panelKey.startsWith('vfolder')) {
      return listAllfilesVfolder(folderId, page, pageSize, order, column)
        .then((res) => {
          const { result, total } = res.data;
          const files = result.map((item) => {
            return {
              ...item.attributes,
              tags: item.labels,
              guid: item.guid,
              key: item.attributes.name,
              typeName: item.typeName,
            };
          });
          if (Object.keys(currentRecord)?.length > 0) {
            const lineage = currentRecord?.lineage; //Need to keep lineage information
            const record = files.filter(
              (file) => file.key === currentRecord.key,
            );
            if (record?.length > 0) {
              record[0].lineage = lineage;
              setCurrentRecord(record[0]);
            }
          }
          setRawFiles(files);
          setTotalItem(total);
          setRefreshing(false);
        })
        .catch((err) => {
          console.error(
            'RawTable -> err, API funtion exception',
            err,
            err.status,
          ); //sometimes throw error
          setRefreshing(false);
          if (err.response) {
            const errorMessager = new ErrorMessager(
              namespace.dataset.files.getFilesByTypeAPI,
            );
            errorMessager.triggerMsg(err.response.status, null, {
              datasetId: containerId,
            });
          }
        });
    }
    let pipeline = null;
    if (panelKey && panelKey.startsWith('greenroom')) {
      if (panelKey === 'greenroom-processed-dicomEdit') {
        pipeline = pipelines['GENERATE_PROCESS'];
      } else if (panelKey === 'greenroom-processed-straightCopy') {
        pipeline = pipelines['DATA_COPY'];
      } else {
        pipeline = pipelines['GREEN_RAW'];
      }
    } else if (panelKey && panelKey.startsWith('core')) {
      pipeline = pipelines['DATA_COPY'];
    }

    const filters = {};

    if (text.length > 0) {
      for (const item of text) {
        filters[item.key] = item.value;
      }
    }
    filters['tags'] = tags;

    const currentDataset = getCurrentProject(containerId);

    let role = false;

    if (currentDataset) role = currentDataset.permission;
    return getFilesByTypeAPI(
      containerId,
      pageSize,
      page,
      pipeline,
      column,
      order,
      role === 'admin',
      null,
      projectActivePanel,
      filters,
    )
      .then((res) => {
        const { entities, approximateCount } = res.data.result;

        const files = entities.map((item) => {
          return {
            ...item.attributes,
            tags: item.labels,
            guid: item.guid,
            key: item.attributes.name,
            typeName: item.typeName,
          };
        });
        //Set the new current record for highlighting and side panel
        if (Object.keys(currentRecord)?.length > 0) {
          const lineage = currentRecord?.lineage; //Need to keep lineage information
          const record = files.filter((file) => file.key === currentRecord.key);
          if (record?.length > 0) {
            record[0].lineage = lineage;
            setCurrentRecord(record[0]);
          }
        }
        setRawFiles(files);
        setTotalItem(approximateCount);
        setRefreshing(false);
      })
      .catch((err) => {
        console.error(
          'RawTable -> err, API funtion exception',
          err,
          err.status,
        ); //sometimes throw error
        setRefreshing(false);
        if (err.response) {
          const errorMessager = new ErrorMessager(
            namespace.dataset.files.getFilesByTypeAPI,
          );
          errorMessager.triggerMsg(err.response.status, null, {
            datasetId: containerId,
          });
        }
      });
  }

  let columns = [
    {
      title: 'Name',
      dataIndex: 'fileName',
      key: 'fileName',
      sorter: true,
      width: '25%',
      searchKey: 'name',
      render: (text, record) => {
        let filename = text;
        if (text.length > 45) {
          filename = filename.slice(0, 45);
          filename = `${filename}...`;
          const content = <span>{text}</span>;
          return (
            <div>
              {record.tags.indexOf(SYSTEM_TAGS['COPIED_TAG']) !== -1 &&
              tableState === TABLE_STATE.COPY_TO_CORE ? (
                <Tag color="default">{SYSTEM_TAGS['COPIED_TAG']}</Tag>
              ) : null}
              <Popover content={content}>{filename}</Popover>
            </div>
          );
        }

        return (
          <div>
            {record.tags.indexOf(SYSTEM_TAGS['COPIED_TAG']) !== -1 &&
            tableState === TABLE_STATE.COPY_TO_CORE ? (
              <Tag color="default">{SYSTEM_TAGS['COPIED_TAG']}</Tag>
            ) : null}
            <span>{filename}</span>
          </div>
        );
      },
    },
    props.type === DataSourceType.GREENROOM_RAW
      ? {
          title: 'Added',
          dataIndex: 'owner',
          key: 'owner',
          sorter: true,
          width: '17%',
          searchKey: 'owner',
          ellipsis: true,
        }
      : {},
    props.currentDataset && props.currentDataset.code === 'generate'
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
    {
      title: 'Created',
      dataIndex: 'createTime',
      key: 'createTime',
      sorter: true,
      width: '14%',
      ellipsis: true,
      render: (text, record) => {
        return text && timeConvert(text, 'date');
      },
    },
    {
      title: 'Size',
      dataIndex: 'fileSize',
      key: 'fileSize',
      render: (text, record) => {
        if ([undefined, null].includes(record.fileSize)) {
          return 'N/A';
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
      width: 75,
      render: (text, record) => {
        let file = record.name;
        var folder = file && file.substring(0, file.lastIndexOf('/') + 1);
        var filename =
          file && file.substring(file.lastIndexOf('/') + 1, file.length);
        let files = [{ file: filename, path: folder }];

        const menu = (
          <Menu>
            <Menu.Item onClick={(e) => openFileSider(record)}>
              Properties
            </Menu.Item>
            <Menu.Divider />
            <Menu.Item
              onClick={(e) => {
                downloadFilesAPI(
                  props.projectId,
                  files,
                  null,
                  props.appendDownloadListCreator,
                  sessionId,
                )
                  .then((res) => {
                    dispatch(setSuccessNum(props.successNum + 1));
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
          </Menu>
        );
        return (
          <Dropdown overlay={menu} placement="bottomRight">
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
    columns = columns.filter((v) => v.key == 'fileName' || v.key == 'action');
  }
  useEffect(() => {
    const data = props.rawData;
    setRawFiles(data);
    setTotalItem(props.totalItem);
    setPageLoading(false);
  }, [
    page,
    pageSize,
    searchInput,
    props.projectId,
    props.rawData,
    props.totalItem,
    // props.successNum,
  ]);

  useEffect(() => {
    console.log(panelKey, projectActivePanel);
    if (panelKey == projectActivePanel) {
      fetchData();
    }
  }, [props.successNum]);

  useEffect(() => {
    listProjectTagsAPI(props.projectId, null, null, 10).then((res) => {
      setTagList(res.data.result);
    });
  }, [props.projectId]);

  const onSelectChange = (selectedRowKeys, selectedRowsNew) => {
    setSelectedRowKeys(selectedRowKeys);
    let tmpSelectedRows = selectedRows
      .concat(selectedRowsNew)
      .filter((item) => item !== undefined);
    let totalSelectedRows = selectedRowKeys.map(
      (key) => tmpSelectedRows.filter((item) => item.key == key)[0],
    );
    setSelectedRows(totalSelectedRows);
  };

  async function openFileSider(record) {
    const { key, typeName } = record;
    //pass lineage information to the sidepanel
    let recordWithLineage = {};
    const res = await fileLineageAPI(key, typeName, 'INPUT');

    recordWithLineage = { ...record, lineage: res.data && res.data.result };
    setSidepanel(true);
    setCurrentRecord(recordWithLineage);
  }

  async function updateLineage(record, direction) {
    const { key, typeName } = record;
    let recordWithLineage = {};
    const res = await fileLineageAPI(key, typeName, direction);

    recordWithLineage = { ...record, lineage: res.data && res.data.result };
    setCurrentRecord(recordWithLineage);
    setLineageLoading(false);
  }

  function closeFileSider() {
    setSidepanel(false);
  }

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };

  const downloadFiles = () => {
    setLoading(true);
    let files = [];
    selectedRowKeys.forEach((i) => {
      let file = i;
      var folder = file.substring(0, file.lastIndexOf('/') + 1);
      var filename = file.substring(file.lastIndexOf('/') + 1, file.length);
      files.push({
        file: filename,
        path: folder,
      });
    });
  
    downloadFilesAPI(
      props.projectId,
      files,
      setLoading,
      props.appendDownloadListCreator,
      sessionId,
    )
    .then((res) => {
      if (files && files.length === 1) dispatch(setSuccessNum(props.successNum + 1));
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
    setSelectedRowKeys([]);
  };

  function fetchData() {
    setRefreshing(true);
    getRawFilesAndUpdateUI(
      props.projectId,
      pageSize,
      page,
      panelKey,
      sortColumn,
      searchText,
      order,
      value,
    );

    setTableKey(tableKey + 1);
  }

  const hasSelected = selectedRowKeys.length > 0;
  let lastFetchId = 0;
  const fetchTags = (value) => {
    value = value.toLowerCase();
    lastFetchId += 1;
    const fetchId = lastFetchId;
    setData([]);
    setFetching(true);
    listProjectTagsAPI(props.projectId, true, value, 3).then((res) => {
      if (fetchId !== lastFetchId) {
        // for fetch callback order
        return;
      }
      const data = res.data.result.map((i) => ({
        text: i.name,
        value: i.name,
      }));
      setData(data);
      setFetching(false);
    });
  };

  const handleChange = (value) => {
    if (value.length !== 0) {
      value = value.map((i) => i.toLowerCase());
      let newTag = value.pop();
      let index = value.indexOf(newTag);
      if (index > -1) {
        value.splice(index, 1);
      } else {
        value.push(newTag);
      }
    }
    setValue(value);
    setData([]);
    setFetching(false);
  };

  function tagRender(props) {
    const { label, closable, onClose } = props;

    return (
      <Tag
        color="blue"
        closable={closable}
        onClose={onClose}
        style={{ marginRight: 3 }}
      >
        {label}
      </Tag>
    );
  }

  const addTag = (e) => {
    const newTag = e.target.innerText;
    if (!_.includes(value, newTag)) {
      setValue([...value, newTag]);
    }
  };

  const onFold = (key) => {
    const data = [];

    for (let el of rawFiles) {
      if (el.key === key) el = { ...el, lineage: {} };

      data.push(el);
    }
    setRawFiles(data);
  };

  function handleOk(e) {
    setFileModalVisible(false);
  }

  function handleLineageCancel(e) {
    setLineageModalVisible(false);
  }

  function mouseDown(e) {
    document.addEventListener('mousemove', mouseMove, true);
    document.addEventListener('mouseup', stopMove, true);
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
  
  const ToolTipsAndTable = (
    <>
      <div style={{ marginBottom: 36, marginTop: 20, position: 'relative' }}>
        <Tooltip placement="top" title="Group Download">
          <Button
            type="primary"
            shape="circle"
            onClick={downloadFiles}
            disabled={!hasSelected}
            loading={loading}
            icon={<CloudDownloadOutlined />}
            style={{ marginRight: 8 }}
          />
        </Tooltip>
        {props.type === DataSourceType.GREENROOM_RAW && (
          <Tooltip placement="top" title="Upload">
            <Button
              id="raw_table_upload"
              type="primary"
              shape="circle"
              onClick={() => toggleModal(true)}
              icon={<UploadOutlined />}
              style={{ marginRight: 8 }}
            />
          </Tooltip>
        )}
        <Tooltip placement="top" title="Refresh">
          <Button
            shape="circle"
            onClick={() => {
              !reFreshing && fetchData();
            }}
            type="primary"
            icon={<SyncOutlined spin={reFreshing} />}
            style={{ marginRight: 8 }}
          />
        </Tooltip>
        {props.type === DataSourceType.GREENROOM_PROCESSED &&
        permission === 'admin' ? (
          <Copy2CorePlugin
            tableState={tableState}
            setTableState={setTableState}
            selectedRowKeys={selectedRowKeys}
            setSelectedRowKeys={setSelectedRowKeys}
            selectedRows={selectedRows}
            panelKey={panelKey}
          />
        ) : null}
        {props.type === DataSourceType.GREENROOM_RAW &&
        permission === 'admin' ? (
          <Copy2ProcessedPlugin
            tableState={tableState}
            setTableState={setTableState}
            selectedRowKeys={selectedRowKeys}
            setSelectedRowKeys={setSelectedRowKeys}
            selectedRows={selectedRows}
            panelKey={panelKey}
          />
        ) : null}
        {props.type === DataSourceType.CORE_PROCESSED ||
        props.type === DataSourceType.CORE_RAW ? (
          <VirtualFolderPlugin
            tableState={tableState}
            setTableState={setTableState}
            selectedRowKeys={selectedRowKeys}
            setSelectedRowKeys={setSelectedRowKeys}
            selectedRows={selectedRows}
            panelKey={panelKey}
          />
        ) : null}
        {props.type === DataSourceType.CORE_VIRTUAL_FOLDER ? (
          <VirtualFolderFilesDeletePlugin
            tableState={tableState}
            setTableState={setTableState}
            selectedRowKeys={selectedRowKeys}
            setSelectedRowKeys={setSelectedRowKeys}
            selectedRows={selectedRows}
            panelKey={panelKey}
          />
        ) : null}
        <span style={{ marginLeft: 5 }}>
          {hasSelected ? `Selected ${selectedRowKeys.length} items` : ''}
        </span>
        <div style={{ float: 'right', marginRight: 40 }}>
          {props.type === DataSourceType.CORE_VIRTUAL_FOLDER ? (
            <VirtualFolderDeletePlugin
              tableState={tableState}
              setTableState={setTableState}
              selectedRowKeys={selectedRowKeys}
              setSelectedRowKeys={setSelectedRowKeys}
              selectedRows={selectedRows}
              panelKey={panelKey}
              removePanel={removePanel}
            />
          ) : null}
        </div>
      </div>

      <FilesTable
        columns={columns}
        dataSource={rawFiles}
        totalItem={totalItem}
        updateTable={getRawFilesAndUpdateUI}
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
      />
    </>
  );

  return (
    <Spin spinning={pageLoading}>
      {isQuery && (
        <div
          style={{
            padding: '20px 0px 10px 0px',
            backgroundColor: '#FAFAFA',
          }}
        >
          <div style={{ width: '70%', margin: '0 auto' }}>
            <Select
              mode="tags"
              tagRender={tagRender}
              value={value}
              placeholder={'Search tags...'}
              notFoundContent={fetching ? <Spin size="small" /> : null}
              onSearch={fetchTags}
              onChange={handleChange}
              style={{ width: '100%', padding: '20px 0px' }}
              autoFocus
            >
              {data.map((d) => (
                <Option key={d.value}>{d.text}</Option>
              ))}
            </Select>

            <div>
              <Paragraph
                ellipsis={{ rows: 2, expandable: true, symbol: 'more' }}
              >
                <p style={{ fontWeight: 'bold', display: 'inline' }}>
                  Popular:
                </p>{' '}
                {tagList.length > 0
                  ? tagList.map((i) => (
                      <Tag color="blue" onClick={addTag}>
                        {i.name}
                      </Tag>
                    ))
                  : 'No tag found in the project.'}
              </Paragraph>
            </div>
          </div>
        </div>
      )}
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
        <div style={{ display: 'flex' }} ref={ref}>
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
            <Collapse defaultActiveKey={['1', '2']}>
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
                  record={currentRecord}
                  pid={props.projectId}
                  refresh={fetchData}
                />
              </Panel>
              {currentRecord?.lineage?.guidEntityMap &&
              Object.keys(currentRecord?.lineage?.guidEntityMap).length ? (
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
              ) : (
                ''
              )}
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
        refresh={fetchData}
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
    </Spin>
  );
}

export default connect(
  (state) => ({
    uploadList: state.uploadList,
    role: state.role,
    containersPermission: state.containersPermission,
    successNum: state.successNum,
  }),
  { appendDownloadListCreator },
)(RawTable);
