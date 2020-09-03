import React, { useState, useEffect } from 'react';
import { Progress, Collapse, Table, Button, Space, Input, Popover } from 'antd';
import { getProcessedFilesAPI, downloadFilesAPI } from '../../../../../APIs';
import { CloudDownloadOutlined, SyncOutlined } from '@ant-design/icons';
import Highlighter from 'react-highlight-words';
import { SearchOutlined } from '@ant-design/icons';
import { useCookies } from 'react-cookie';
import { namespace, ErrorMessager } from '../../../../../ErrorMessages';
import { appendDownloadListCreator } from '../../../../../Redux/actions';
import { connect } from 'react-redux';

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
  const [searchText, setSearchText] = useState(null);
  const [searchedColumn, setSearchedColumn] = useState('');
  const [searchInput, setSearchInput] = useState({});
  const [reFreshing, setRefreshing] = useState(false);
  const [sortColumn, setSortColumn] = useState('createTime');
  const [order, setOrder] = useState('desc');
  const [cookies, setCookie] = useCookies(['cookies']);

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
      result = await getProcessedFilesAPI(
        containerId,
        pageSize,
        page,
        path,
        column,
        text,
        order,
      );
    } catch (err) {
      if (err.response) {
        const errorMessager = new ErrorMessager(
          namespace.dataset.files.getProcessedFilesAPI,
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
    // fetchData();
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

    if (param2.fileName && param2.fileName.length > 0) isSearchingFile = true;
    if (param2.generateID && param2.generateID.length > 0)
      isSearchingFile = true;
    if (param2.owner && param2.owner.length > 0) isSearchingFile = true;

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
      ...getColumnSearchProps('name'),
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
      ...getColumnSearchProps('owner'),
    },
    props.currentDataset && props.currentDataset.code === 'generate'
      ? {
          title: 'Generate ID',
          dataIndex: 'generateID',
          key: 'generateID',
          sorter: (a, b) => a.generateID.localeCompare(b.generateID),
          width: '15%',
          ...getColumnSearchProps('generateID'),
        }
      : {},
    {
      title: 'Created',
      dataIndex: 'createTime',
      key: 'createTime',
      sorter: true,
      width: '20%',
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
                downloadFilesAPI(props.datasetId, files).catch((err) => {
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

      <Table
        // pagination={{ pageSize: 5 }}
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
      />
    </>
  );
};

export default connect(null, { appendDownloadListCreator })(
  ContainerDetailsContent,
);
