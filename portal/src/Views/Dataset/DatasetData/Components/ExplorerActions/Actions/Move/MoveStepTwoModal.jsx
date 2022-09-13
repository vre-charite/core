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
import { Modal, Button, message } from 'antd';
import {
  ExclamationCircleOutlined,
  FileOutlined,
  FolderOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import styles from '../../ExplorerActions.module.scss';

export function MoveStepTwoModal(props) {
  const { stepTwoVisible, setStepTwoVisible, ignoreList, processingList } =
    props;
  const { t } = useTranslation(['errormessages', 'success']);
  const onCancel = () => {
    setStepTwoVisible(false);
  };
  const onOk = () => {
    setStepTwoVisible(false);
    if (processingList.length) {
      message.success(t('success:datasetFileMove.default.0'));
    }
  };
  return (
    <Modal
      className={styles['move-step-two-modal']}
      footer={
        <div>
          <Button
            className={styles['cancel-button']}
            type="link"
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button className={styles['ok-button']} type="primary" onClick={onOk}>
            OK
          </Button>
        </div>
      }
      onCancel={onCancel}
      onOk={onOk}
      title={<span className={styles['title']}>Duplicate Name</span>}
      visible={stepTwoVisible}
    >
      <div>
        <span className={styles['exclamation']}>
          {' '}
          <ExclamationCircleOutlined />{' '}
        </span>
        <span className={styles['sub-title']}>
          The following file/folder already exist, will be skipped:
        </span>
      </div>
      <div>
        <ul className={styles['ul']}>
          {ignoreList.map((item) => (
            <li>
              {item.labels.includes('File') ? (
                <FileOutlined />
              ) : (
                <FolderOutlined />
              )}
              <span className={styles['file-name']}>{item.name}</span>
            </li>
          ))}
        </ul>
      </div>
    </Modal>
  );
}
