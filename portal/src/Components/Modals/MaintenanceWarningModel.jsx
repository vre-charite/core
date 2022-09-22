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
