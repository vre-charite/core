import React, { useState, useEffect } from 'react';
import moment from 'moment';
import { Progress, Collapse, Table, Button, Space, Input, Popover } from 'antd';
import { getFilesByTypeAPI, downloadFilesAPI, } from '../../../../../APIs';
import { CloudDownloadOutlined, SyncOutlined } from '@ant-design/icons';
import Highlighter from 'react-highlight-words';
import { SearchOutlined } from '@ant-design/icons';
import { useCookies } from 'react-cookie';
import { namespace, ErrorMessager } from '../../../../../ErrorMessages';
import { appendDownloadListCreator } from '../../../../../Redux/actions';
import { connect, useSelector } from 'react-redux';
import FilesTable from './FilesTable';

const { Panel } = Collapse;

const ContainerDetailsContent = (props) => {
  const { id, title, path, totalProcessedItem, processedData } = props;
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(0);
  const [totalItem, setTotalItem] = useState(0);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [loading, setLoading] = useState(false);
  const [downloadStatus, setProgress] = useState({});
  const [groupDownloadStatus, setGroupProgress] = useState({});
  let [rawFiles, setRawFiles] = useState([]);
  const [searchText, setSearchText] = useState([]);
  const [searchedColumn, setSearchedColumn] = useState('');
  const [searchInput, setSearchInput] = useState({});
  const [reFreshing, setRefreshing] = useState(false);
  const [sortColumn, setSortColumn] = useState('createTime');
  const [order, setOrder] = useState('desc');
  const [tableKey, setTableKey] = useState(0);

  const containersPermission = useSelector((state) => state.containersPermission);

  async function updateProcessedFiles(
    containerId,
    pageSize,
    page,
    path,
    column,
    text,
    order,
    entity_type = null,
    filePath = null,
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
      const currentDataset = containersPermission && containersPermission.filter(el => el.container_id === Number(containerId));
      if (currentDataset && currentDataset.length) role = currentDataset[0].permission;

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
        )
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
      console.log(err)
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
        key: item.attributes.name,
      })),
    );
    setTotalItem(approximateCount);
    setRefreshing(false);
  }

  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();

    setSearchedColumn(dataIndex);
    setSearchText(selectedKeys[0]);
    updateProcessedFiles(
      props.datasetId,
      pageSize,
      page,
      parsePath,
      sortColumn,
      selectedKeys[0],
      order,
    );
  };

  const handleReset = (clearFilters) => {
    clearFilters();
    setSearchedColumn('dataIndex');
    setSearchText('');

    updateProcessedFiles(
      props.datasetId,
      pageSize,
      page,
      parsePath,
      sortColumn,
      '',
      order,
    );
  };

  const getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
    }) => (
      <div style={{ padding: 8 }}>
        <Input
          ref={(node) => {
            //this.searchInput = node;
            setSearchInput(node);
          }}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{ width: 188, marginBottom: 8, display: 'block' }}
          autoFocus
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            Search
          </Button>
          <Button
            onClick={() => handleReset(clearFilters)}
            size="small"
            style={{ width: 90 }}
          >
            Reset
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered) => (
      <SearchOutlined
        style={{ color: filtered ? '#1890ff' : undefined, top: '60%' }}
      />
    ),
    // onFilter: (value, record) =>
    //   record[dataIndex] ? record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()) : '',
    onFilterDropdownVisibleChange: (visible) => {
      if (visible && Object.keys(searchInput).length > 0) {
        // console.log('searchInput', searchInput);
        setTimeout(() => searchInput.select());
      }
    },
    render: (text) =>
      searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ''}
        />
      ) : (
        text
      ),
  });

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
    setTableKey(tableKey+1);
  }

  const onSelectChange = (selectedRowKeys) => {
    console.log('selectedRowKeys changed: ', selectedRowKeys);
    setSelectedRowKeys(selectedRowKeys);
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };

  const changePage = (pagination, param2, param3) => {
    let order = 'asc';
    if (param3 && param3.order !== 'ascend') order = 'desc';

    if (param3) {
      setSortColumn(param3.field);
      setOrder(order);
    }

    setPage(pagination.current - 1);
    if (pagination.pageSize) setPageSize(pagination.pageSize);

    let isSearchingFile = false;

    if (param2.fileName && param2.fileName.length > 0) {
      isSearchingFile = true;
      setTableKey(tableKey + 1);
    }
    if (param2.generateID && param2.generateID.length > 0) {
      isSearchingFile = true;
      setTableKey(tableKey + 1);
    }

    if (param2.owner && param2.owner.length > 0) {
      isSearchingFile = true;
      setTableKey(tableKey + 1);
    }

    if (!isSearchingFile) {
      updateProcessedFiles(
        props.datasetId,
        pagination.pageSize,
        pagination.current - 1,
        parsePath,
        param3 ? param3.field : 'createTime',
        searchText,
        order,
      );
    }
  };

  // const updateGroupProgress = (fileName, progress) => {
  //   setGroupProgress((prev) => ({ ...prev, [fileName]: progress }));
  // };

  // const updateProgress = (fileName, progress) => {
  //   setProgress((prev) => ({ ...prev, [fileName]: progress }));
  // };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'fileName',
      key: 'fileName',
      sorter: true,
      width: '35%',
      searchKey: 'name',
      // ...getColumnSearchProps('name'),
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
      // ...getColumnSearchProps('owner'),
    },
    props.currentDataset && props.currentDataset.code === 'generate'
      ? {
          title: 'Generate ID',
          dataIndex: 'generateID',
          key: 'generateID',
          sorter: (a, b) => a.generateID.localeCompare(b.generateID),
          width: '15%',
          searchKey: 'generateID',
          // ...getColumnSearchProps('generateID'),
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
    selectedRowKeys.map((i) => {
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
      {/* <Table
        pagination={{
          current: page + 1,
          pageSize,
          total: totalItem,
          showQuickJumper: true,
          showSizeChanger: true,
        }}
        rowKey={(record) => record.name}
        rowSelection={rowSelection}
        columns={columns}
        dataSource={rawFiles}
        onChange={changePage}
        scroll={{ x: true }}
        key={tableKey}
      /> */}
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
