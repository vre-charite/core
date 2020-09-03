import React, { useState } from 'react';
import {
  Table,
  Button,
  Space,
  Collapse,
  Progress,
  Input,
  Spin,
  Popover,
} from 'antd';
import { connect } from 'react-redux';
import { useEffect } from 'react';
import { useCookies } from 'react-cookie';
import { CloudDownloadOutlined, SyncOutlined } from '@ant-design/icons';
import moment from 'moment';

import Highlighter from 'react-highlight-words';
import { SearchOutlined } from '@ant-design/icons';
import { ErrorMessager, namespace } from '../../../../../ErrorMessages';
import { appendDownloadListCreator } from '../../../../../Redux/actions';
import { getRawFilesAPI, downloadFilesAPI } from '../../../../../APIs';
import GreenRoomUploader from '../../../Components/GreenRoomUploader';

const { Panel } = Collapse;

function RawTable(props) {
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(0);
  const [totalItem, setTotalItem] = useState(0);
  const [downloadStatus, setProgress] = useState({});
  const [groupDownloadStatus, setGroupProgress] = useState({});
  let [rawFiles, setRawFiles] = useState([]);
  const [reFreshing, setRefreshing] = useState(false);
  const [cookies, setCookie] = useCookies(['cookies']);
  const [searchText, setSearchText] = useState(null);
  const [searchedColumn, setSearchedColumn] = useState('');
  const [searchInput, setSearchInput] = useState({});
  const [sortColumn, setSortColumn] = useState('createTime');
  const [order, setOrder] = useState('desc');
  const [pageLoading, setPageLoading] = useState(true);
  const [isShown, toggleModal] = useState(false);

  function getRawFilesAndUpdateUI(
    containerId,
    pageSize,
    page,
    column,
    text,
    order,
  ) {
    return getRawFilesAPI(containerId, pageSize, page, column, text, order)
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
            namespace.dataset.files.getRawFilesAPI,
          );
          errorMessager.triggerMsg(err.response.status, null, {
            datasetId: containerId,
          });
        }
      });
  }

  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();

    setSearchedColumn(dataIndex);
    setSearchText(selectedKeys[0]);

    getRawFilesAndUpdateUI(
      props.projectId,
      pageSize,
      page,
      sortColumn,
      selectedKeys[0],
      order,
    );
  };

  const handleReset = (clearFilters) => {
    clearFilters();
    setSearchedColumn('dataIndex');
    setSearchText('');
    console.log(searchText);
    getRawFilesAndUpdateUI(
      props.projectId,
      pageSize,
      page,
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

        setTimeout(() => searchInput.select(), 100);
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
    props.currentDataset && props.currentDataset.container_name === 'GENERATE'
      ? {
          title: 'Generate ID',
          dataIndex: 'generateID',
          key: 'generateID',
          sorter: true,
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
      render: (text, record) => {
        return text && moment(text).format('YYYY-MM-DD')
      }
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
                downloadFilesAPI(props.projectId, files).catch((err) => {
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
    // fetchData()
    setRawFiles(props.rawData);
    setTotalItem(props.totalItem);
    setPageLoading(false);
  }, [
    page,
    pageSize,
    props.projectId,
    props.rawData,
    props.totalItem,
    // props.uploadList,
  ]);

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

    setPage(pagination.current - 1);
    if (param3) {
      setSortColumn(param3.field);
      setOrder(order);
    }

    if (pagination.pageSize) setPageSize(pagination.pageSize);

    let isSearchingFile = false;

    if (param2.fileName && param2.fileName.length > 0) isSearchingFile = true;
    if (param2.generateID && param2.generateID.length > 0)
      isSearchingFile = true;

    if (!isSearchingFile) {
      getRawFilesAndUpdateUI(
        props.projectId,
        pagination.pageSize,
        pagination.current - 1,
        param3 ? param3.field : 'createTime',
        searchText,
        order,
      );
    }
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
      sortColumn,
      searchText,
      order,
    );
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

      <Table
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
  }),
  { appendDownloadListCreator },
)(RawTable);
