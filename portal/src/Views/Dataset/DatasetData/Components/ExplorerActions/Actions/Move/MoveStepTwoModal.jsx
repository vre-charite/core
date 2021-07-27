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
