import React, { useState } from 'react';
import { Col, Row, Layout } from 'antd';
import { useCurrentProject } from '../../../Utility';
import FileExplorerTable from '../../../Components/FileExplorer/FileExplorerTable';
import styles from './request.module.scss';
import { useSelector, useDispatch } from 'react-redux';
import { pluginsContainer } from './TablePlugins';

const { Content } = Layout;

function Request() {
  const { activeReq, status } = useSelector((state) => state.request2Core);
  const [currentDataset] = useCurrentProject();
  const projectGeid = currentDataset?.globalEntityId;
  const columns = [
    { title: '', dataIndex: 'label', key: 'label' },
    {
      title: 'Name',
      dataIndex: 'fileName',
      key: 'fileName',
      sidePanelVisible: true,
      sorter: true,
      searchKey: 'name',
    },
    {
      title: 'Added',
      dataIndex: 'owner',
      key: 'owner',
      sorter: true,
      searchKey: 'owner',
      ellipsis: true,
    },
    {
      title: 'Created',
      dataIndex: 'createTime',
      key: 'createTime',
      sorter: true,
    },
    {
      title: 'Size',
      dataIndex: 'fileSize',
      key: 'fileSize',
      sorter: true,
    },
  ];
  if (status === 'complete') {
    columns.splice(
      4,
      1,
      {
        title: 'Reviewed At',
        dataIndex: 'reviewedAt',
        key: 'reviewedAt',
      },
      {
        title: 'Reviewed By',
        dataIndex: 'reviewedBy',
        key: 'reviewedBy',
      },
    );
  } else {
    if (currentDataset.code === 'generate') {
      columns.splice(2, 0, {
        title: 'Generate ID',
        dataIndex: 'generateId',
        key: 'generateId',
      });
    }
  }

  const columnsLayoutNewList = (isSidePanelOpen) => {
    if (isSidePanelOpen) {
      return {
        label: 60,
        fileName: '65%',
      };
    } else {
      return {
        label: 60,
        fileName: '40%',
        generateId: '20%',
        owner: '20%',
        createTime: 120,
        fileSize: 100,
      };
    }
  };

  const columnsLayoutCompletedList = (isSidePanelOpen) => {
    if (isSidePanelOpen) {
      return {
        label: 60,
        fileName: '65%',
      };
    } else {
      return {
        label: 60,
        fileName: '15%',
        generateId: '14%',
        owner: '17%',
        reviewedAt: '15%',
        reviewedBy: '15%',
        createTime: 120,
        fileSize: 100,
      };
    }
  };

  const columnsLayoutComplete = (isSidePanelOpen) => {
    if (isSidePanelOpen) {
      return {
        label: 60,
        fileName: '65%',
      };
    } else {
      return {
        label: 60,
        fileName: '15%',
        generateId: '14%',
        owner: '17%',
        reviewedAt: '15%',
        reviewedBy: '15%',
        createTime: 120,
        fileSize: 100,
      };
    }
  };
  const rowClassName = (record, index) => {
    let classArr = [];
    if (record.archived) {
      classArr.push('record-deleted');
    } else {
      if (record.reviewStatus === 'approved') {
        classArr.push('record-approved');
      }
      if (record.reviewStatus === 'denied') {
        classArr.push('record-denied');
      }
    }

    return classArr.join(' ');
  };
  return (
    <Content className={styles.content}>
      <FileExplorerTable
        columns={columns}
        columnsLayout={status === 'complete' ? columnsLayoutCompletedList : columnsLayoutNewList}
        reduxKey={'request2core-' + activeReq.id}
        initDataSource={{
          type: 'request',
          value: activeReq,
        }}
        columnsDisplayCfg={{
          deleteIndicator: true,
          // hideSelectBox: status === 'complete',
        }}
        rowClassName={rowClassName}
        routing={{
          startGeid: activeReq.sourceFolderGeid,
        }}
        projectGeid={projectGeid}
        pluginsContainer={pluginsContainer}
        sidePanelCfg={{
          showSystemTags: true,
          allowTagEdit: false,
        }}
      />
    </Content>
  );
}

export default Request;
