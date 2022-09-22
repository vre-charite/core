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

import React, { useState, useEffect } from 'react';
import { Drawer, Table } from 'antd';
import {
  getDatasetVersionsAPI,
  datasetDownloadReturnURLAPI,
  datasetDownloadAPI,
} from '../../../../APIs';
import { useDispatch, useSelector } from 'react-redux';
import { DownloadOutlined } from '@ant-design/icons';
import moment from 'moment';
import styles from './DatasetDrawer.module.scss';
import { namespace, ErrorMessager } from '../../../../ErrorMessages';
const DatasetDrawer = (props) => {
  const { datasetDrawerVisibility, setDatasetDrawerVisibility } = props;
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItem, setTotalItem] = useState(0);
  const [datasetVersions, setDatasetVersions] = useState(0);
  const { basicInfo, currentVersion } = useSelector(
    (state) => state.datasetInfo,
  );

  const downloadDataset = async (version) => {
    try {
      const res = await datasetDownloadReturnURLAPI(basicInfo.geid, version);
      await datasetDownloadAPI(res.data.result.downloadHash);
    } catch (err) {
      if (err.response) {
        const errorMessager = new ErrorMessager(
          namespace.dataset.files.downloadFilesAPI,
        );
        errorMessager.triggerMsg(err.response.status);
      }
      return;
    }
  };

  const columns = [
    {
      title: '',
      key: 'content',
      width: '80%',
      render: (item) => {
        return (
          <div
            style={
              Number(item.version) % 1 === 0
                ? {
                    display: 'flex',
                    padding: '24px',
                    backgroundColor: '#F0F0F0',
                  }
                : {
                    display: 'flex',
                    padding: '24px',
                  }
            }
          >
            <div
              style={{ marginTop: '-2px', marginRight: '3px', width: '35px' }}
            >
              <p
                style={{
                  margin: '0px',
                  fontSize: '16px',
                  color: '#003262',
                  fontWeight: 'bold',
                }}
              >
                {item.version}
              </p>
            </div>
            <div style={{ width: '250px', marginRight: '30px' }}>
              <p style={{ margin: '0px' }}>
                <span style={{ marginRight: '3px' }}>-</span>
                {`${moment(item.createdAt).format('YYYY.MM.DD HH:MM:SS')} by ${
                  item.createdBy
                }`}
              </p>
              <p style={{ margin: '0px' }}>{item.notes}</p>
            </div>
            <div style={{ flex: '1', alignSelf: 'center' }}>
              <DownloadOutlined
                style={{ cursor: 'pointer' }}
                onClick={(e) => {
                  downloadDataset(item.version);
                }}
              />
            </div>
          </div>
        );
      },
    },
  ];

  const getDatasetVersions = async () => {
    const params = {
      page: currentPage - 1,
      page_size: pageSize,
      order: 'desc',
      sorting: 'create_at',
    };
    const res = await getDatasetVersionsAPI(basicInfo.geid, params);
    setDatasetVersions(res.data.result);
    setTotalItem(res.data.total);
  };

  useEffect(() => {
    if (basicInfo.geid) {
      getDatasetVersions();
    }
  }, [basicInfo.geid, currentPage, currentVersion, pageSize]);

  const onTableChange = (pagination) => {
    setCurrentPage(pagination.current);
    setPageSize(pagination.pageSize);
  };

  return (
    <Drawer
      className={styles.dataset_drawer}
      title={
        <p style={{ margin: '0px', fontSize: '16px', color: '#003262' }}>
          Versions
        </p>
      }
      placement={'right'}
      closable={true}
      onClose={() => setDatasetDrawerVisibility(false)}
      visible={datasetDrawerVisibility}
      mask={false}
      key={'right'}
    >
      <Table
        className={styles.drawer_content_table}
        columns={columns}
        dataSource={datasetVersions}
        onChange={onTableChange}
        pagination={{
          current: currentPage,
          pageSize,
          total: totalItem,
          pageSizeOptions: [10, 20, 50],
          showSizeChanger: true,
        }}
        size="middle"
      />
    </Drawer>
  );
};

export default DatasetDrawer;
