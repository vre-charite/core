import React, { useState, useEffect, useRef } from 'react';
import {
  Button,
  Space,
  Collapse,
  Progress,
  Spin,
  Popover,
} from 'antd';
import {
  CloudDownloadOutlined,
  SyncOutlined,
} from '@ant-design/icons';
import { getFilesByTypeAPI, downloadFilesAPI } from '../../../../APIs';
import GreenRoomUploader from '../../Components/GreenRoomUploader';
import { appendDownloadListCreator } from '../../../../Redux/actions';
import { ErrorMessager, namespace } from '../../../../ErrorMessages';
import FilesTable from '../Charts/FileExplorer/FilesTable';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import _ from 'lodash';
import {getCurrentProject} from '../../../../Utility'
import moment from 'moment';

const { Panel } = Collapse;

function UploaderHistory(props) {
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(0);
  const [totalItem, setTotalItem] = useState(0);
  const [groupDownloadStatus, setGroupProgress] = useState({});
  let [rawFiles, setRawFiles] = useState([]);
  const [reFreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState({});
  const [sortColumn, setSortColumn] = useState('createTime');
  const [order, setOrder] = useState('desc');
  const [pageLoading, setPageLoading] = useState(true);
  const [isShown, toggleModal] = useState(false);
  const [tableKey, setTableKey] = useState(0);

  const mounted = useRef(false);

  const {
    match: {
      params: { datasetId },
    },
  } = props;


  function getRawFilesAndUpdateUI(
    containerId,
    pageSize,
    page,
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

    const currentDataset = getCurrentProject(datasetId);

    let role = false;

    if (currentDataset ) role = currentDataset.permission;

    return getFilesByTypeAPI(
      containerId,
      pageSize,
      page,
      null,
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

  const checkGenerate = (datasetId, datasetList) => {
    if (!datasetList || !datasetList.length > 0) {
      return false;
    }
    let dataset = _.find(datasetList[0].datasetList, (i) => {
      return i['id'] === parseInt(datasetId);
    });
    return dataset['code'] === 'generate';
  };

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
        if (text.length > 58) {
          filename = filename.slice(0, 50);
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
    props.datasetList && checkGenerate(datasetId, props.datasetList)
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
        let fileArr = file.split('/');
        let fileName = fileArr[fileArr.length - 1];
        let path = fileArr.slice(4, fileArr.length - 1).join('/');
        let files = [{ file: fileName, path: path }];
        return (
          <Space size="middle">
            <CloudDownloadOutlined
              onClick={(e) =>
                downloadFilesAPI(datasetId, files).catch((err) => {
                  console.log('ContainerDetailsContent -> err', err);
                  if (err.response) {
                    const errorMessager = new ErrorMessager(
                      namespace.dataset.files.downloadFilesAPI,
                    );
                    errorMessager.triggerMsg(err.response.status);
                  }
                  return;
                })
              }
            >
              Download
            </CloudDownloadOutlined>
          </Space>
        );
      },
    },
  ];

  useEffect(() => {
    getRawFilesAndUpdateUI(datasetId, 10, 0, 'createTime', [], 'desc');
    setTotalItem(props.totalItem);
    setPageLoading(false);
  }, [page, pageSize, datasetId, props.rawData, props.totalItem]);

  useEffect(() => {
    if (mounted.current) {
      console.log('changed');
      fetchData();
    } else mounted.current = true;
  }, [props.successNum]);

  const onSelectChange = (selectedRowKeys) => {
    console.log('selectedRowKeys changed: ', selectedRowKeys);
    setSelectedRowKeys(selectedRowKeys);
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };

  const downloadFiles = () => {
    setLoading(true);
    let files = [];
    selectedRowKeys.map((i) => {
      let fileArr = i.split('/');
      files.push({
        file: fileArr[fileArr.length - 1],
        path: fileArr.slice(4, fileArr.length - 1).join('/'),
      });
    });
    downloadFilesAPI(
      datasetId,
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
      datasetId,
      pageSize,
      page,
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
        projectId={datasetId}
        rowSelection={rowSelection}
        tableKey={tableKey}
        type="raw table"
      />
      <GreenRoomUploader
        isShown={isShown}
        cancel={() => {
          toggleModal(false);
        }}
        datasetId={parseInt(datasetId)}
      />
    </Spin>
  );
}

export default connect(
  (state) => ({
    containersPermission: state.containersPermission,
    datasetList: state.datasetList,
    uploadList: state.uploadList,
    successNum: state.successNum,
  }),
  { appendDownloadListCreator },
)(withRouter(UploaderHistory));
