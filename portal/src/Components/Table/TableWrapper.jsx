// Copyright 2022 Indoc Research
// 
// Licensed under the EUPL, Version 1.2 or – as soon they
// will be approved by the European Commission - subsequent
// versions of the EUPL (the "Licence");
// You may not use this work except in compliance with the
// Licence.
// You may obtain a copy of the Licence at:
// 
// https://joinup.ec.europa.eu/collection/eupl/eupl-text-eupl-12
// 
// Unless required by applicable law or agreed to in
// writing, software distributed under the Licence is
// distributed on an "AS IS" basis,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
// express or implied.
// See the Licence for the specific language governing
// permissions and limitations under the Licence.
// 

import { Table, Input, Button, Space, Badge, Tooltip } from 'antd';
import { SearchOutlined, CrownFilled } from '@ant-design/icons';
import React from 'react';
import styles from './index.module.scss';
import { partialString } from '../../Utility';

class TableWrapper extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      searchText: '',
      searchedColumn: '',
      page: 0,
      pageSize: 10,
      order: 'desc',
      sortColumn: 'createTime',
    };
  }

  statusMap = {
    active: 'success',
    pending: 'warning',
    hibernate: 'error',
    null: 'success',
    disabled: 'error',
  };

  getColumnSearchProps = (dataIndex, tableKey) => ({
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
          }}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() =>
            this.props.handleSearch(selectedKeys, confirm, dataIndex)
          }
          style={{ width: 188, marginBottom: 8, display: 'block' }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() =>
              this.props.handleSearch(selectedKeys, confirm, dataIndex)
            }
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            Search
          </Button>
          <Button
            onClick={() => this.props.handleReset(clearFilters, dataIndex)}
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
    render: (text, record) => {
      if (text && text.length > 30) {
        text = partialString(text, 30, true);
      }

      if (dataIndex === 'name') {
        //Handle the 3 status from projectUsers table, if in projectUsers table (active, disabled, hibernate)
        //and other status (active, disabled)
        const status = tableKey === 'projectUsers' ? record.projectStatus : record.status;
        
        const statusBadge = (
          <Tooltip placement="top" title={status === 'hibernate' ? '' : status}>
            <Badge status={this.statusMap[status]} />
          </Tooltip>
        );
        const adminCrown = record.role && record.role === 'admin' && (
          <CrownFilled style={{ color: 'gold', marginLeft: 5 }} />
        );
        return (
          <>
            {statusBadge}
            {text}
            {adminCrown}
          </>
        );
      } else if (
        // Displaying role for the platform invitations table
        // Logic:
        // If user do not have any project and has role of admin, he is *platform admin*
        // If user have project and has role of admin, he is project admin
        tableKey &&
        tableKey === 'platformInvitations' &&
        dataIndex === 'email'
      ) {
        return (
          <>
            {/* <Badge status="warning" /> */}
            {text}
            {!record.projectId && record.role && record.role === 'admin' && (
              <CrownFilled style={{ color: 'gold', marginLeft: 5 }} />
            )}
          </>
        );
      } else if (
        // Displaying role for the project invitaion table
        // Logic:
        // If user do not have any project and has role of admin, he is platform admin
        // If user have project and has role of admin, he is *project admin*
        tableKey &&
        tableKey === 'projectInvitations' &&
        dataIndex === 'email'
      ) {
        return (
          <>
            {/* <Badge status="warning" /> */}
            {text}
            {record.projectId && record.role && record.role === 'admin' && (
              <CrownFilled style={{ color: 'gold', marginLeft: 5 }} />
            )}
          </>
        );
      } else {
        return text;
      }
    },
  });

  render() {
    const {
      totalItem,
      page,
      pageSize,
      dataSource,
      width,
      setClassName,
      tableKey,
      style,
      pageSizeOptions,
    } = this.props;

    const columns =
      this.props.columns &&
      this.props.columns.map((el) => {
        if (el.searchKey) {
          return {
            ...el,
            ...this.getColumnSearchProps(el.searchKey, tableKey),
          };
        }
        return el;
      });

    const pagenationParams = {
      current: page + 1,
      pageSize,
      total: totalItem,
      showQuickJumper: true,
      showSizeChanger: true,
    };
    if (this.props.pageSizeOptions) {
      pagenationParams['pageSizeOptions'] = this.props.pageSizeOptions;
    }
    return (
      <Table
        className={styles.table_wrapper}
        columns={columns}
        dataSource={dataSource}
        onChange={this.props.onChange}
        tableLayout={'fixed'}
        pagination={pagenationParams}
        key={this.props.tableKey}
        scroll={{ x: true }}
        rowKey={(record) => record.name || record.email}
        width={width}
        rowClassName={setClassName} //This attribute takes a function to add classes to the row
        style={style}
      />
    );
  }
}

export default TableWrapper;
