import React from 'react';
import { Modal, Button } from 'antd';
import { SettingOutlined } from '@ant-design/icons';
import styles from './maintenance.module.scss';
import { formatDate } from '../../Utility';

const UpcomingMaintenanceModal = ({
  visible,
  data,
  hideMask,
  onOk,
  onCancel,
  getContainer,
}) => {
  const { type, message, detail } = data;
  const title = (
    <div className={styles['maintenance-modal__title']}>
      <SettingOutlined />
      <p>{`Upcoming ${type}`}</p>
    </div>
  );

  const footerButton = (
    <Button
      type="primary"
      className={styles['maintenance-modal__primary-button']}
      onClick={onOk}
    >
      OK
    </Button>
  );

  return (
    <Modal
      className={styles['maintenance-modal']}
      title={title}
      footer={footerButton}
      visible={visible}
      onCancel={onCancel}
      centered
      getContainer={getContainer}
      maskClosable={false}
      maskStyle={
        hideMask
          ? { display: 'none' }
          : {
              background: '#595959BC',
              'backdrop-filter': 'blur(12px)',
              top: '66px',
            }
      }
    >
      <p className={styles['maintenance-modal__message']}>{message}</p>
      <p
        className={styles['maintenance-modal__date']}
      >{`${formatDate(detail?.maintenanceDate)} - Estimated Duration: ${detail?.duration} ${detail?.durationUnit}`}</p>
    </Modal>
  );
};

export default UpcomingMaintenanceModal;
