import React, { useState, useRef } from 'react';
import { Button, Space, Collapse, Progress, Spin, Popover } from 'antd';
import { connect, useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import { CloudDownloadOutlined, SyncOutlined } from '@ant-design/icons';
import moment from 'moment';

import { ErrorMessager, namespace } from '../../../../../ErrorMessages';
import { appendDownloadListCreator } from '../../../../../Redux/actions';
import { downloadFilesAPI, getFilesByTypeAPI } from '../../../../../APIs';
import GreenRoomUploader from '../../../Components/GreenRoomUploader';
import FilesTable from './FilesTable';
import { getCurrentProject } from '../../../../../Utility';
import { setSuccessNum } from '../../../../../Redux/actions';

const { Panel } = Collapse;

function RawTable(props) {
  const { path } = props;
  const dispatch = useDispatch();

  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
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
  const [tableKey, setTableKey] = useState(0);

  const mounted = useRef(false);

  const parsePath =
    typeof path === 'string' && path[0] === '/' ? path.substring(1) : path;

  function getRawFilesAndUpdateUI(
    containerId,
    pageSize,
    page,
    path,
    column,
    text,
    order,
  ) {
    const filters = {};

    if (text.length > 0) {
      for (const item of text) {
        filters[item.key] = item.value;
      }
    }

    const currentDataset = getCurrentProject(containerId);

    let role = false;

    if (currentDataset) role = currentDataset.permission;

    return getFilesByTypeAPI(
      containerId,
      pageSize,
      page,
      path,
      column,
      order,
      role === 'admin',
      null,
      filters,
    )
      .then((res) => {
        const { entities, approximateCount } = res.data.result;

        setRawFiles(
          entities.map((item) => ({
            ...item.attributes,
            key: item.attributes.name,
          })),
        );
        setTotalItem(approximateCount);
        setRefreshing(false);
      })
      .catch((err) => {
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

  const columns = [
    {
      title: 'Name',
      dataIndex: 'fileName',
      key: 'fileName',
      sorter: true,
      width: '35%',
      searchKey: 'name',
      render: (text, record) => {
        let filename = text;
        if (text.length > 45) {
          filename = filename.slice(0, 45);
          filename = `${filename}...`;

          const content = <span>{text}</span>;

          return <Popover content={content}>{filename}</Popover>;
        }

        return filename;
      },
    },
    {
      title: 'Created By',
      dataIndex: 'owner',
      key: 'owner',
      sorter: true,
      width: '15%',
      searchKey: 'owner',
    },
    props.currentDataset && props.currentDataset.code === 'generate'
      ? {
          title: 'Generate ID',
          dataIndex: 'generateId',
          key: 'generateID',
          sorter: true,
          width: '15%',
          searchKey: 'generateID',
        }
      : {},
    {
      title: 'Created',
      dataIndex: 'createTime',
      key: 'createTime',
      sorter: true,
      width: '20%',
      render: (text, record) => {
        return text && moment(text).format('YYYY-MM-DD');
      },
    },
    {
      title: 'File Size',
      dataIndex: 'fileSize',
      key: 'fileSize',
      render: (text, record) => {
        if (record.fileSize === undefined) {
          return 'N/A';
        }
        return text < 1024
          ? text.toString().concat(' B')
          : text < 1024 * 1024
          ? (text / 1024).toFixed(2).toString().concat(' KB')
          : text < 1024 * 1024 * 1024
          ? (text / (1024 * 1024)).toFixed(2).toString().concat(' MB')
          : (text / (1024 * 1024 * 1024)).toFixed(2).toString().concat(' GB');
      },
      sorter: true,
      width: '10%',
    },

    {
      title: 'Action',
      key: 'action',
      width: '5%',
      render: (text, record) => {
        let file = record.name;
        var folder = file.substring(0, file.lastIndexOf('/') + 1);
        var filename = file.substring(file.lastIndexOf('/') + 1, file.length);
        let files = [{ file: filename, path: folder }];
        return (
          <Space size="middle">
            <CloudDownloadOutlined
              onClick={(e) => {
                console.log('RawTable -> record', record);

                downloadFilesAPI(props.projectId, files)
                  .then(res => {
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
            </CloudDownloadOutlined>
          </Space>
        );
      },
    },
  ];

  useEffect(() => {
    setRawFiles(props.rawData);
    setTotalItem(props.totalItem);
    setPageLoading(false);
  }, [
    page,
    pageSize,
    searchInput,
    props.projectId,
    props.rawData,
    props.totalItem,
    props.successNum,
  ]);

  useEffect(() => {
    if (mounted.current) {
      console.log('changed');
      fetchData();
    } else mounted.current = true;
  }, [props.successNum]);

  const onSelectChange = (selectedRowKeys) => {
    setSelectedRowKeys(selectedRowKeys);
  };

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
    ).catch((err) => {
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
      parsePath,
      sortColumn,
      searchText,
      order,
    );

    setTableKey(tableKey + 1);
  }

  const hasSelected = selectedRowKeys.length > 0;

  return (
    <Spin spinning={pageLoading}>
      <div style={{ marginBottom: 16 }}>
        <Button
          type="primary"
          onClick={downloadFiles}
          disabled={!hasSelected}
          loading={loading}
        >
          Download
        </Button>

        <Button
          type="primary"
          onClick={() => toggleModal(true)}
          style={{ marginLeft: 20 }}
        >
          Upload
        </Button>

        <span style={{ marginLeft: 8 }}>
          {hasSelected ? `Selected ${selectedRowKeys.length} items` : ''}
        </span>
        <Button
          type="link"
          onClick={() => {
            !reFreshing && fetchData();
          }}
          style={{
            float: 'right',
            fontSize: '20px',
            top: '-5px',
          }}
        >
          <SyncOutlined spin={reFreshing} style={{ position: 'static' }} />
        </Button>
      </div>
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

      <FilesTable
        columns={columns}
        dataSource={rawFiles}
        totalItem={totalItem}
        updateTable={getRawFilesAndUpdateUI}
        projectId={props.projectId}
        type={props.type}
        rowSelection={rowSelection}
        tableKey={tableKey}
        parsePath={parsePath}
        successNum={props.successNum}
      />
      <GreenRoomUploader
        isShown={isShown}
        cancel={() => {
          toggleModal(false);
        }}
        datasetId={parseInt(props.projectId)}
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
