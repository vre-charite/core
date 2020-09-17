import { Table, Input, Button, Space } from 'antd';
import Highlighter from 'react-highlight-words';
import { SearchOutlined } from '@ant-design/icons';
import React from 'react';

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
    };
  }

  getColumnSearchProps = dataIndex => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
      <div style={{ padding: 8 }}>
        <Input
          ref={node => {
            this.searchInput = node;
            // if(!this.clearFilters) this.clearFilters = clearFilters;
          }}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => this.handleSearch(selectedKeys, confirm, dataIndex)}
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
          <Button onClick={() => this.handleReset(clearFilters)} size="small" style={{ width: 90 }}>
            Reset
          </Button>
        </Space>
      </div>
    ),
    filterIcon: filtered => <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined, top: '60%' }} />,
    onFilterDropdownVisibleChange: visible => {
      if (visible) {
        setTimeout(() => {
          this.searchInput.select()
        }, 100);
      }
    },
    render: text => text
      // this.state.searchedColumn === dataIndex ? (
      //   <Highlighter
      //     highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
      //     searchWords={[this.state.searchText]}
      //     autoEscape
      //     textToHighlight={text ? text.toString() : ''}
      //   />
      // ) : (
      //   text
      // ),
  });

  handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    this.setState({
      searchText: selectedKeys[0],
      searchedColumn: dataIndex,
    });

    // this.props.getRawFilesAndUpdateUI(
    //   this.props.projectId,
    //   this.state.pageSize,
    //   this.state.page,
    //   this.state.sortColumn,
    //   selectedKeys[0],
    //   this.state.order,
    // );
  };

  handleReset = clearFilters => {
    clearFilters();
    this.setState({ searchText: '' });
  };

  onChange = (pagination, param2, param3) => {
    let order = 'asc';

    if (param3 && param3.order !== 'ascend') order = 'desc';

    this.setState({ page: pagination.current - 1 });

    if (param3) {
      this.setState({ sortColumn: param3.field });
      this.setState({ order: order });
    }

    if (pagination.pageSize) this.setState({ pageSize: pagination.pageSize });

    let searchText = [];
    let isSearchingFile = false;

    if (param2.fileName && param2.fileName.length > 0) {
      // searchText = param2.fileName[0];
      isSearchingFile = true;
      
      searchText.push({
        key: 'fileName',
        value: param2.fileName[0],
      });
    }
    if (param2.generateID && param2.generateID.length > 0) {
      // searchText = param2.generateID[0];
      isSearchingFile = true;

      searchText.push({
        value: param2.generateID[0],
        key: 'generateID'
      });
    }

    if (param2.owner && param2.owner.length > 0) {
      // searchText = param2.owner[0];
      isSearchingFile = true;

      searchText.push({
        value: param2.owner[0],
        key: 'owner'
      });
    }

    this.setState({ searchText: searchText });


    if (this.props.type === 'raw table') {
      this.props.updateTable(
        this.props.projectId,
        pagination.pageSize,
        pagination.current - 1,
        param3 ? param3.field : 'createTime',
        searchText,
        order,
      );
    } else if (this.props.type === 'processed table') {
      this.props.updateTable(
        this.props.projectId,
        pagination.pageSize,
        pagination.current - 1,
        this.props.parsePath,
        param3 ? param3.field : 'createTime',
        searchText,
        order,
      );
    }
  }

  render() {
    const { page, pageSize, } = this.state;
    const { totalItem } = this.props;

    const columns = this.props.columns && this.props.columns.map((el) => {
      if (el.searchKey) {
        return {
          ...el,
          ...this.getColumnSearchProps(el.searchKey)
        }
      }
      return el;
    })
    return (
      <Table 
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
        rowKey={(record) => record.name}
        rowSelection={this.props.rowSelection}
        key={this.props.tableKey}
      />
    );
  }
}

export default FilesTable;