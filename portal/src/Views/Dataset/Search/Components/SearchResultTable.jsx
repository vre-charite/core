import React, { useState, useEffect } from 'react';
import { Table, Button, Collapse, Radio, Divider, Spin } from 'antd';
import SearchResultCard from './SearchResultCard';
import styles from '../index.module.scss';
import { useCurrentProject } from '../../../../Utility';
import { SyncOutlined, FilterOutlined, CloseOutlined } from '@ant-design/icons';
import { searchFilesAPI } from '../../../../APIs';

const { Panel } = Collapse;

function SearchResultTable({
  files,
  conditions,
  page,
  setPage,
  pageSize,
  total,
  filters,
  setFilters,
  onTableChange,
  loading,
  searchFiles,
  attributeList,
  searchConditions,
}) {
  const [showClose, setShowClose] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [collapseKeys, setCollapseKeys] = useState([]);
  const [locationValue, setLocationValue] = useState('');
  const currentProject = useCurrentProject();
  const zone = filters.find(el => el.category === 'zone');

  const currentProjectRole = currentProject[0].permission;
  const columns = [
    {
      title: '',
      dataIndex: 'index',
      render: (text, record) => (
        <SearchResultCard record={record} attributeList={attributeList} searchConditions={searchConditions}/>
      ),
    },
  ];

  const newFiles = files.map((el, index) => {
    return {
      ...el,
      key: index,
    };
  });

  const rowSelection = {
    onChange: (selectedRowKeys, selectedRows) => {
      setSelectedRows(selectedRowKeys);
    },

    getCheckboxProps: (record) => ({
      name: record.name,
    }),
  };

  const collapseOnChange = (values) => {
    setCollapseKeys([...values]);
  };

  const locationOnChange = (e) => {
    setLocationValue(e.target.value);

    const filter = filters.find((el) => el.category === 'zone');
    const newFilters = [...filters];
    if (!filter) {
      newFilters.push({ category: 'zone', value: e.target.value });
    } else {
      newFilters.forEach((el) => {
        if ((el) => el.category === 'zone') el.value = e.target.value;
      });
    }
    setFilters(newFilters);
    setPage(0);
  };

  const refineSearch = (showClose) => {
    if (!showClose) {
      return (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            marginRight: '100px',
            marginTop: '6px',
            width: '100%',
            justifyContent: 'flex-end',
          }}
        >
          <FilterOutlined />
          <p
            onClick={() => setShowClose(true)}
            style={{ margin: '0px 0px 0px 10px', cursor: 'pointer' }}
          >
            Refine your search
          </p>
        </div>
      );
    } else {
      return null; 
      // the below code will be used in the future.
      /* (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            marginRight: '358px',
            marginTop: '6px',
            width: '100%',
            justifyContent: 'flex-end',
          }}
        >
          <p style={{ margin: '0px' }}>{selectedRows.length} Selected</p>
          <CloseOutlined
            onClick={() => setShowClose(false)}
            style={{ marginLeft: '15px' }}
          />
        </div>
      ) */;
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      <div className={styles.search_result_actions}>
        {
        // the below code will be used in the future.
        /* <Button 
          type="link" 
          icon={<SyncOutlined />}
          onClick={() => {
            searchFiles({ page, pageSize }, filters);
          }}
        >
          Refresh
        </Button> */}
        {/* {['admin', 'collaborator'].includes(currentProjectRole)
          ? refineSearch(showClose)
          : null} */}

        {
          ['admin', 'collaborator'].includes(currentProjectRole) ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                marginRight: '100px',
                marginTop: '6px',
                width: '100%',
                justifyContent: 'flex-end',
              }}
            >
              <span
                style={{ margin: '0px 0px 0px 10px', cursor: 'pointer' }}
              >
                Location: 
              </span>
              
              <Radio.Group 
                style={{ marginLeft: 10 }} 
                value={zone.value}
                onChange={locationOnChange}
              >
                <Radio value="greenroom">Green Room</Radio>
                <Radio value="vrecore">Core</Radio>
              </Radio.Group>
            </div>
          ) : null
        }
      </div>
      <div className={styles.search_result_table}>
        <div style={{ flex: 1 }}>
          <Spin spinning={loading}>
            <Table
              rowSelection={{
                ...rowSelection,
              }}
              className={styles.search_result_table}
              columns={columns}
              dataSource={newFiles}
              pagination={{
                total: total,
                pageSize: pageSize,
                current: page + 1,
                showSizeChanger: true,
              }}
              onChange={onTableChange}
            />
          </Spin>
        </div>
        {showClose ? (
          <div className={styles.search_collapse}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                paddingRight: '20px',
                backgroundColor: '#fafafa',
                height: '35px',
                marginBottom: '20px',
                borderBottom: '1px solid #f0f0f0',
              }}
            >
              <FilterOutlined />
              <p style={{ margin: '0px 0px 0px 10px', cursor: 'pointer' }}>
                Refine your search
              </p>
              <CloseOutlined
                onClick={() => setShowClose(false)}
                style={{ marginLeft: '15px' }}
              />
            </div>
            <div className={styles.right_search_part}>
              <Divider type="vertical"></Divider>
              <div style={{ width: '100%', paddingLeft: '16px' }}>
                <div className={styles.set_collapse}>
                  <p
                    onClick={() => {
                      setLocationValue('');
                      setFilters([]);
                    }}
                  >
                    Reset All
                  </p>
                  <p onClick={() => setCollapseKeys([])}>Collapse All</p>
                </div>
                <Collapse
                  className={styles.collapse}
                  activeKey={collapseKeys}
                  bordered={false}
                  ghost={false}
                  expandIconPosition={'right'}
                  onChange={collapseOnChange}
                >
                  <Panel header="Location" key="1">
                    <Radio.Group
                      value={locationValue}
                      onChange={locationOnChange}
                    >
                      <Radio value="vrecore">Core</Radio>
                      <Radio value="greenroom">Green Room</Radio>
                    </Radio.Group>
                  </Panel>
                </Collapse>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
export default SearchResultTable;
