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

import React from 'react';
import { Modal, Tooltip } from 'antd';
import styles from './uploadErrorModal.module.scss';
import { WarningOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
export default function UploadErrorModal(props) {
  const {
    errorModalVisible,
    setErrorFileList,
    setErrorModalVisible,
    errorFileList,
  } = props;
  const { t } = useTranslation(['errormessages']);
  return (
    <Modal
      className={styles['error-modal']}
      title="Upload openMINDS Schemas"
      visible={errorModalVisible}
      onCancel={() => {
        setErrorFileList([]);
        setErrorModalVisible(false);
      }}
      footer={null}
    >
      <div className={styles['content']}>
        <span className={styles['description']}>
          {t('errormessages:uploadOpenMindsSchema.uploadFailed.0')}
        </span>
        <br></br>
        <ul className={styles['ul']}>
          {errorFileList.map((errorFile) => {
            return (
              <li className={styles['li']}>
                <WarningOutlined />{' '}
                <Tooltip title={errorFile.name}>
                  <span className={styles['file-name']}>{errorFile.name}</span>
                </Tooltip>{' '}
              </li>
            );
          })}
        </ul>
      </div>
    </Modal>
  );
}
