import React, { useState, useEffect } from 'react';
import { Card, Space, Button } from 'antd';
import {
  DownloadOutlined,
  EditOutlined,
  ImportOutlined,
  SwapOutlined,
} from '@ant-design/icons';
import { useSelector, useDispatch } from 'react-redux';
import styles from './ExplorerActions.module.scss';
import { EDIT_MODE } from '../../../../../Redux/Reducers/datasetData';
import { Move } from './Actions/Move/Move';
import BidsValidator from './Actions/BidsValidator/BidsValidator';

export function ExplorerActions(props) {
  const editorMode = useSelector((state) => state.datasetData.mode);
  const selectedData = useSelector((state) => state.datasetData.selectedData);
  const basicInfo = useSelector((state) => state.datasetInfo.basicInfo);
  const moveCondition =
    selectedData.length !== 0 && editorMode !== EDIT_MODE.EIDT_INDIVIDUAL;
  return (
    <div className={styles['actions']}>
      <Space>
        {' '}
        {/* 
        <Button
          disabled={!hasData}
          className={hasData && styles['button-enable']}
          type="link"
          icon={<DownloadOutlined />}
        >
          Download
        </Button>{' '} */}
        {/* <Button
          disabled={!hasData}
          className={hasData && styles['button-enable']}
          type="link"
          icon={<EditOutlined />}
        >
          Edit
        </Button>{' '}
        <Button
          type="link"
          className={styles['button-enable']}
          icon={<ImportOutlined />}
        >
          Import Data
        </Button>{' '} */}
        <Move />
      </Space>
      { basicInfo.type && basicInfo.type === 'BIDS' && <BidsValidator />}
    </div>
  );
}
