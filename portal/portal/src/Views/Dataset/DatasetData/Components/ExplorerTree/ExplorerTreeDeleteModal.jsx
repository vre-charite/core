import React, { useState, useEffect } from 'react';
import { Modal, Button, message } from 'antd';
import styles from './ExplorerTree.module.scss';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { deleteDatasetFiles } from '../../../../../APIs';
import { useTranslation } from 'react-i18next';

export function ExplorerTreeDeleteModal(props) {
  const {
    deleteVisible,
    setDeleteVisible,
    datasetGeid,
    nodeKey,
    username,
    title,
  } = props;
  const [step, setStep] = useState(1);
  const { t } = useTranslation(['errormessages', 'success']);

  const [submitting, setSubmitting] = useState(false);
  const onCancel = () => {
    setDeleteVisible(false);
    setStep(1);
  };
  const onOk = async () => {
    if (step === 2) {
      onCancel();
      return;
    }
    setSubmitting(true);
    try {
      const res = await deleteDatasetFiles(datasetGeid, [nodeKey], username);

      if (res.data.code === 200) {
        if (res.data.result.ignored && res.data.result.ignored.length > 0) {
          setStep(2);
        } else {
          message.success(t('success:datasetFileDelete.default.0'));
          onCancel();
        }
      }
    } catch (error) {
      message.error(t('errormessages:datasetDelete.default.0'));
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <Modal
      className={styles['delete-modal']}
      footer={
        <div>
          <Button
            className={styles['cancel-button']}
            type="link"
            onClick={onCancel}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            loading={submitting}
            className={styles['ok-button']}
            type="primary"
            onClick={onOk}
          >
            {step === 1 ? 'Submit' : 'OK'}
          </Button>
        </div>
      }
      onCancel={onCancel}
      onOk={onOk}
      title={
        <span className={styles['title']}>
          {step === 1 ? 'Delete' : 'Delete in progress'}
        </span>
      }
      visible={deleteVisible}
    >
      {step === 1 && getStepOneContent(title)}
      {step === 2 && getStepSecondContent(title)}
    </Modal>
  );
}

function getStepOneContent(title) {
  return (
    <>
      <div>
        <span className={styles['exclamation']}>
          {' '}
          <ExclamationCircleOutlined />{' '}
        </span>
        <span className={styles['sub-title']}>
          Are you sure you would like to delete the selected file/folder?
        </span>
      </div>
      <div>
        <ul className={styles['ul']}>
          <li>• {title}</li>
        </ul>
      </div>
    </>
  );
}

function getStepSecondContent(title) {
  return (
    <>
      {' '}
      <div>
        <span className={styles['exclamation']}>
          {' '}
          <ExclamationCircleOutlined />{' '}
        </span>
        <span className={styles['sub-title']}>
          This file/folder is being deleted, please refresh the page later:
        </span>
      </div>
      <div>
        <ul className={styles['ul']}>
          <li>• {title}</li>
        </ul>
      </div>
    </>
  );
}
