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
