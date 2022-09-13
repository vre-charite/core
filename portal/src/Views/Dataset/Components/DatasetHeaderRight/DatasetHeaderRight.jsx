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

import React, { useState } from 'react';
import { Tag, Button } from 'antd';
import styles from './DatasetHeaderRight.module.scss';
import { useSelector } from 'react-redux';
import { getFileSize, getTags } from '../../../../Utility';
import DatasetFilePanel from '../DatasetFilePanel/DatasetFilePanel';
import { RocketOutlined } from '@ant-design/icons';
import PublishNewVersion from '../PublishNewVersion/PublishNewVersion';

export default function DatasetHeaderRight(props) {
  const [newVersionModalVisibility, setNewVersionModalVisibility] = useState(false);
  const {
    basicInfo: { size, totalFiles, tags },
  } = useSelector((state) => state.datasetInfo);

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <div style={{ marginRight: '20px' }}>
          <Statistics label="Files">{totalFiles}</Statistics>
          <Statistics label="Size">{getFileSize(size)}</Statistics>
        </div>
        <div style={{ marginTop: '-4px' }}>
          <DatasetFilePanel />
        </div>
      </div>
      <div className={styles['tags-container']}>{getTags(tags)}</div>
      <Button
        icon={<RocketOutlined />}
        type="primary"
        style={{
          position: 'absolute',
          top: '104px',
          right: '0px',
          borderRadius: '6px',
          padding: '0px',
          height: '27px',
          width: '188px',
        }}
        onClick={() => setNewVersionModalVisibility(true)}
      >
        Release new version
      </Button>
      <PublishNewVersion 
        newVersionModalVisibility={newVersionModalVisibility}
        setNewVersionModalVisibility={setNewVersionModalVisibility}
      />
    </>
  );
}

const Statistics = (props) => {
  const { label, children } = props;
  return (
    <span className={styles['statistics']}>
      <span className={styles['statistics-title']}>{label}</span>
      <span className={styles['statistics-value']}>{children}</span>
    </span>
  );
};
