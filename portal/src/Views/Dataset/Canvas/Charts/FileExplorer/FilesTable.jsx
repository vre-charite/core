import { Table, Input, Button, Space } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import React from 'react';
import styles from './index.module.scss';
import { TABLE_STATE } from './RawTableValues';
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
    if (
      this.props.currentRouting === null &&
      prevProps.currentRouting &&
      prevProps.currentRouting.length >= 1
    ) {
      // empty params when user leave folder
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
    this.setState({ searchText: '' });
  };

  onChange = (pagination, filters, sorter) => {
    let order = 'asc';

    if (sorter && sorter.order !== 'ascend') order = 'desc';

    this.setState({ page: pagination.current - 1 });

    if (sorter) {
      this.setState({
        sortColumn: sorter.columnKey,
        order,
      });
    }

    if (pagination.pageSize) this.setState({ pageSize: pagination.pageSize });

    let searchText = [];
    // eslint-disable-next-line
    let isSearchingFile = false;

    if (filters.fileName && filters.fileName.length > 0) {
      isSearchingFile = true;

      searchText.push({
        key: 'fileName',
        value: filters.fileName[0],
      });
    }
    if (filters.generateID && filters.generateID.length > 0) {
      isSearchingFile = true;

      searchText.push({
        value: filters.generateID[0],
        key: 'generateID',
      });
    }

    if (filters.owner && filters.owner.length > 0) {
      isSearchingFile = true;

      searchText.push({
        value: filters.owner[0],
        key: 'owner',
      });
    }

    this.setState({ searchText: searchText });

    if (!sorter.column && !sorter.order) {
      this.props.updateTable(
        this.props.projectId,
        pagination.pageSize,
        pagination.current - 1,
        this.props.panelKey,
        'createTime',
        searchText,
        'desc',
        this.props.tags,
      );
    } else {
      this.props.updateTable(
        this.props.projectId,
        pagination.pageSize,
        pagination.current - 1,
        this.props.panelKey,
        sorter.columnKey || 'createTime',
        searchText,
        order,
        this.props.tags,
      );
    }
  };

  render() {
    const { page, pageSize } = this.state;
    const { totalItem } = this.props;

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
        className={styles.files_raw_table}
        tableLayout={'fixed'}
        rowKey={(record) => record.name}
        rowSelection={{ ...this.props.rowSelection, columnWidth: 40 }}
        key={this.props.tableKey}
        rowClassName={(record) => {
          let classArr = [];
          if (record.name && this.props.selectedRecord?.name === record.name) {
            classArr.push('selected');
          }
          if (
            record.manifest &&
            record.manifest.length !== 0 &&
            this.props.tableState === TABLE_STATE.MANIFEST_APPLY
          ) {
            classArr.push('manifest-attached');
          }
          return classArr.join(' ');
        }}
      />
    );
  }
}

export default FilesTable;
