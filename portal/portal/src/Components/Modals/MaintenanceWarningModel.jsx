import React, { useEffect, useRef, useState } from 'react';
import { Modal, Button } from 'antd';
import { SettingOutlined, LogoutOutlined } from '@ant-design/icons';
import { logout } from '../../Utility';
import moment from 'moment';
import styles from './MaintenanceWarningModel.module.scss';
import { useSelector } from 'react-redux';
const MaintenanceWarningModel = () => {
  const [visible, setVisible] = useState(false);
  const [remainingTime, setRemainingTime] = useState(10);
  const { notificationList } = useSelector((state) => state.notifications);
  useEffect(() => {
    function checkMaintenanceComing() {
      for (let notificationItem of notificationList) {
        const mTime = moment(notificationItem.detail.maintenanceDate + '.00Z');
        const oneMinAgo = moment(mTime).subtract(1, 'minutes');
        const nineMinAgo = moment(mTime).subtract(9, 'minutes');
        const tenMinAgo = moment(mTime).subtract(10, 'minutes');
        const curTime = moment();
        if (
          curTime.unix() > tenMinAgo.unix() &&
          curTime.unix() < nineMinAgo.unix()
        ) {
          console.log('Found maintenance in 10mn...', notificationItem);
          setRemainingTime(10);
          setVisible(true);
          break;
        }
        if (
          curTime.unix() > oneMinAgo.unix() &&
          curTime.unix() < mTime.unix()
        ) {
          console.log('Found maintenance in 1mn...', notificationItem);
          setRemainingTime(1);
          setVisible(true);
          break;
        }
      }
    }
    checkMaintenanceComing();
  }, [notificationList]);
  const title = (
    <div className={styles['maintenance-modal__title']}>
      <SettingOutlined />
      <p>{`Upcoming Maintenance`}</p>
    </div>
  );

  const footerButton = [
    <Button
      type="link"
      className={styles['maintenance-modal__ok-button']}
      onClick={() => {
        setVisible(false);
      }}
    >
      OK
    </Button>,
    <Button
      type="primary"
      className={styles['maintenance-modal__logout-button']}
      icon={<LogoutOutlined />}
      onClick={() => {
        logout();
        setVisible(false);
      }}
    >
      Logout
    </Button>,
  ];

  return (
    <Modal
      className={styles['maintenance-modal']}
      title={title}
      footer={footerButton}
      visible={visible}
      width={466}
      onCancel={() => {
        setVisible(false);
      }}
      centered
      maskClosable={false}
      wrapClassName={styles['maintenance-modal-wrap']}
      maskStyle={{
        background: '#595959BC',
        backdropFilter: 'blur(12px)',
        zIndex: 2000,
      }}
    >
      <p className={styles['maintenance-modal__message']}>
        Planned maintenance will start in <b>{remainingTime}min</b>
      </p>
    </Modal>
  );
};

export default MaintenanceWarningModel;
