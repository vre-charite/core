import { Table, Input, Button, Space, Popover, Typography } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import React from 'react';

const { Paragraph } = Typography;

class FilesTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      searchText: '',
      searchedColumn: '',
      page: 0,
      pageSize: 10,
      order: 'desc',
      sortColumn: 'createTime',
      selectedRowKeys: [],
      tags: [],
    };
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.successNum !== this.props.successNum) {
      this.setState({
        page: 0,
        pageSize: 10,
        order: 'desc',
        sortColumn: 'createTime',
        searchedColumn: '',
        searchText: '',
        inputVisible: false,
        inputValue: '',
        tags: this.props.tags,
      });
    }
  }

  getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
    }) => (
      <div style={{ padding: 8 }}>
        <Input
          ref={(node) => {
            this.searchInput = node;
            // if(!this.clearFilters) this.clearFilters = clearFilters;
          }}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() =>
            this.handleSearch(selectedKeys, confirm, dataIndex)
          }
          style={{ width: 188, marginBottom: 8, display: 'block' }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => this.handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            Search
          </Button>
          <Button
            onClick={() => this.handleReset(clearFilters)}
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
    onFilterDropdownVisibleChange: (visible) => {
      if (visible) {
        setTimeout(() => {
          this.searchInput.select();
        }, 100);
      }
    },
  });

  handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    this.setState({
      searchText: selectedKeys[0],
      searchedColumn: dataIndex,
    });
  };

  handleReset = (clearFilters) => {
    clearFilters();
    this.setState({ searchText: '' });
  };

  onChange = (pagination, param2, param3) => {
    let order = 'asc';

    if (param3 && param3.order !== 'ascend') order = 'desc';

    this.setState({ page: pagination.current - 1 });

    if (param3) {
      this.setState({ sortColumn: param3.columnKey });
      this.setState({ order: order });
    }

    if (pagination.pageSize) this.setState({ pageSize: pagination.pageSize });

    let searchText = [];
    let isSearchingFile = false;

    if (param2.fileName && param2.fileName.length > 0) {
      isSearchingFile = true;

      searchText.push({
        key: 'fileName',
        value: param2.fileName[0],
      });
    }
    if (param2.generateID && param2.generateID.length > 0) {
      isSearchingFile = true;

      searchText.push({
        value: param2.generateID[0],
        key: 'generateID',
      });
    }

    if (param2.owner && param2.owner.length > 0) {
      isSearchingFile = true;

      searchText.push({
        value: param2.owner[0],
        key: 'owner',
      });
    }

    this.setState({ searchText: searchText });

    this.props.updateTable(
      this.props.projectId,
      pagination.pageSize,
      pagination.current - 1,
      this.props.panelKey,
      param3 ? param3.columnKey : 'createTime',
      searchText,
      order,
      this.props.tags,
    );
  };

  render() {
    const { page, pageSize } = this.state;
    const { totalItem } = this.props;
    const { selectedRecord } = this.props;

    const columns =
      this.props.columns &&
      this.props.columns.map((el) => {
        if (el.searchKey) {
          return {
            ...el,
            ...this.getColumnSearchProps(el.searchKey),
          };
        }
        return el;
      });
    return (
      <Table
        id={`files_table`}
        columns={columns}
        dataSource={this.props.dataSource}
        onChange={this.onChange}
        pagination={{
          current: page + 1,
          pageSize,
          total: totalItem,
          showQuickJumper: true,
          showSizeChanger: true,
        }}
        tableLayout={'fixed'}
        rowKey={(record) => record.name}
        rowSelection={{ ...this.props.rowSelection, columnWidth: 40 }}
        key={this.props.tableKey}
        rowClassName={(record) =>
          this.props.selectedRecord?.name === record.name ? 'selected' : ''
        }
      />
    );
  }
}

export default FilesTable;
