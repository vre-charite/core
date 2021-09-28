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
