import { Table, Input, Button, Space, Spin } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import React from 'react';
import styles from './index.module.scss';
import { TABLE_STATE } from './RawTableValues';
import {
  checkIsVirtualFolder,
  checkGreenAndCore,
} from '../../../../../Utility';
import { connect } from 'react-redux';
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
    if (prevProps.tableResetMap && this.props.tableResetMap) {
      const previousResetNum = prevProps.tableResetMap[prevProps.panelKey]
        ? prevProps.tableResetMap[prevProps.panelKey]
        : null;
      const currentResetNum = this.props.tableResetMap[this.props.panelKey]
        ? this.props.tableResetMap[this.props.panelKey]
        : null;
      if (previousResetNum !== currentResetNum) {
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
        return;
      }
    }
  }

  getCurrentSourceType = () => {
    if (checkIsVirtualFolder(this.props.panelKey)) {
      if (this.props.currentRouting?.length === 0) {
        return 'Collection';
      } else {
        return 'Folder';
      }
    } else if (this.props.panelKey.toLowerCase().includes('trash')) {
      if (this.props.currentRouting?.length === 0) {
        return 'TrashFile';
      } else {
        return 'Folder';
      }
    }

    // this check is for table columns sorting and get source type when clicing on refresh button.
    if (checkGreenAndCore(this.props.panelKey) && this.props.currentRouting?.length > 0) {
      return 'Folder';
    } else {
      return 'Project';
    }
  }

  componentWillReceiveProps(nextProps, nextState) {
    if (this.props.activePane !== nextProps.activePane) {
      const curSourceType = this.getCurrentSourceType();
      const params = {
        geid: this.props.getCurrentGeid(),
        page: this.state.page,
        pageSize: this.state.pageSize,
        orderBy: this.state.sortColumn,
        orderType: this.state.order,
        sourceType: curSourceType,
      };
       if (curSourceType === 'Folder' && this.props.currentRouting.length) {
         params.node = {
           nodeLabel:
             this.props.currentRouting[this.props.currentRouting.length - 1]
               .labels,
         };
       }
       // update table
       this.props.updateTable(params);
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
    if (filters["dcmID"] && filters["dcmID"].length > 0) {
      isSearchingFile = true;

      searchText.push({
        value: filters["dcmID"][0],
        key: "dcmID",
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

    const curSourceType = this.getCurrentSourceType();
    const params = {
      geid: this.props.getCurrentGeid(),
      page: pagination.current - 1,
      pageSize: pagination.pageSize,
      orderBy: sorter.columnKey,
      orderType: order,
      query: convertFilter(searchText),
      sourceType: curSourceType,
    };
    if (curSourceType === 'Folder' && this.props.currentRouting.length ) {
      params.node = {
        nodeLabel:
          this.props.currentRouting[this.props.currentRouting.length - 1].labels,
      };
    }
    // update table
    this.props.updateTable(params);
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
      <div>
        {
          /* this.props.tableLoading ? (
          <Spin
            tip="Loading..."
            style={{ width: '100%', height: '100%', margin: '20% auto' }}
            size="large"
          />
        ) : */ <Table
            id={`files_table`}
            columns={columns}
            dataSource={this.props.dataSource}
            onChange={this.onChange}
            pagination={{
              current: page + 1,
              pageSize,
              total: totalItem,
              pageSizeOptions: [10, 20, 50],
              showQuickJumper: true,
              showSizeChanger: true,
            }}
            loading={this.props.tableLoading}
            className={styles.files_raw_table}
            tableLayout={'fixed'}
            rowKey={(record) => record.geid}
            rowSelection={{ ...this.props.rowSelection, columnWidth: 40 }}
            key={this.props.tableKey}
            rowClassName={(record) => {
              let classArr = [];
              if (
                record.name &&
                this.props.selectedRecord?.name === record.name
              ) {
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
        }
      </div>
    );
  }
}

/**
 *
 * @param {array} searchText
 * @returns
 */
const convertFilter = (searchText) => {
  const filters = {};

  if (searchText.length > 0) {
    for (const item of searchText) {
      filters[item.key] = item.value;
    }
  }
  return filters;
};

export default connect((state) => ({
  tableResetMap: state.fileExplorer.tableResetMap,
}))(FilesTable);
