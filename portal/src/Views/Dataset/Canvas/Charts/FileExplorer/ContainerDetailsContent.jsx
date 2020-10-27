import React, { useState, useEffect } from 'react';
import moment from 'moment';
import { Progress, Collapse, Button, Space, Popover } from 'antd';
import { getFilesByTypeAPI, downloadFilesAPI } from '../../../../../APIs';
import { CloudDownloadOutlined, SyncOutlined } from '@ant-design/icons';
import { namespace, ErrorMessager } from '../../../../../ErrorMessages';
import { appendDownloadListCreator } from '../../../../../Redux/actions';
import { connect } from 'react-redux';
import FilesTable from './FilesTable';
import { getCurrentProject } from '../../../../../Utility';

const { Panel } = Collapse;

const ContainerDetailsContent = (props) => {
  const { id, path, totalProcessedItem, processedData } = props;
  const [pageSize] = useState(10);
  const [page] = useState(0);
  const [totalItem, setTotalItem] = useState(0);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [loading, setLoading] = useState(false);
  const [groupDownloadStatus] = useState({});
  let [rawFiles, setRawFiles] = useState([]);
  const [searchText] = useState([]);
  const [reFreshing, setRefreshing] = useState(false);
  const [sortColumn] = useState('createTime');
  const [order] = useState('desc');
  const [tableKey, setTableKey] = useState(0);

  async function updateProcessedFiles(
    containerId,
    pageSize,
    page,
    path,
    column,
    text,
    order,
  ) {
    let result;
    try {
      const filters = {};

      if (text.length > 0) {
        for (const item of text) {
          filters[item.key] = item.value;
        }
      }

      let role = false;
      const currentDataset = getCurrentProject(containerId);
      if (currentDataset) role = currentDataset.permission;

      if (props.filePath) {
        filters.path = props.filePath;

        result = await getFilesByTypeAPI(
          containerId,
          pageSize,
          page,
          null,
          column,
          order,
          role === 'admin',
          'nfs_file_cp',
          filters,
        );
      } else {
        result = await getFilesByTypeAPI(
          containerId,
          pageSize,
          page,
          path,
          column,
          order,
          role === 'admin',
          null,
          filters,
        );
      }
    } catch (err) {
      console.log(err);
      if (err.response) {
        const errorMessager = new ErrorMessager(
          namespace.dataset.files.getFilesByTypeAPI,
        );
        errorMessager.triggerMsg(err.response.status);
      }
      setRefreshing(false);
      return;
    }
    const { entities, approximateCount } = result.data.result;
    setRawFiles(
      entities.map((item) => ({
        ...item.attributes,
        tags: item.labels,
        guid:item.guid,
        key: item.attributes.name,
      })),
    );
    setTotalItem(approximateCount);
    setRefreshing(false);
  }

  const parsePath =
    typeof path === 'string' && path[0] === '/' ? path.substring(1) : path;

  useEffect(() => {
    setTotalItem(totalProcessedItem);
    setRawFiles(processedData);
  }, [id, pageSize, processedData, totalProcessedItem]);

  function fetchData() {
    setRefreshing(true);
    updateProcessedFiles(
      props.datasetId,
      pageSize,
      page,
      parsePath,
      sortColumn,
      searchText,
      order,
    );
    setTableKey(tableKey + 1);
  }

  const onSelectChange = (selectedRowKeys) => {
    console.log('selectedRowKeys changed: ', selectedRowKeys);
    setSelectedRowKeys(selectedRowKeys);
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
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
          sorter: (a, b) => a.generateId.localeCompare(b.generateId),
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
                console.log('ContainerDetailsContent -> record', record);

                downloadFilesAPI(props.datasetId, files).catch((err) => {
                  console.log('ContainerDetailsContent -> err', err);
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
      props.datasetId,
      files,
      setLoading,
      props.appendDownloadListCreator,
    ).catch((err) => {
      setLoading(false);
      if (err.response) {
        setLoading(false);
        const errorMessager = new ErrorMessager(
          namespace.dataset.files.downloadFilesAPI,
        );
        errorMessager.triggerMsg(err.response.status);
      }
    });
    setSelectedRowKeys([]);
  };

  const hasSelected = selectedRowKeys.length > 0;

  return (
    <>
      <div style={{ marginBottom: 16 }}>
        <Button
          type="primary"
          onClick={downloadFiles}
          disabled={!hasSelected}
          loading={loading}
        >
          Download
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
        updateTable={updateProcessedFiles}
        projectId={props.datasetId}
        type="processed table"
        parsePath={parsePath}
        rowSelection={rowSelection}
        tableKey={tableKey}
      />
    </>
  );
};

export default connect(null, { appendDownloadListCreator })(
  ContainerDetailsContent,
);
