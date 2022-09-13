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
import { useSelector, useDispatch } from 'react-redux';
import { Button } from 'antd';
import CreateNewNotification from './CreateNewNotification';
import NotificationDetail from './NotificationDetail';
import { notificationActions } from '../../../../../Redux/actions';
import { PlusOutlined } from '@ant-design/icons';
import styles from './index.module.scss';

const NotificationPanel = () => {
  const { activeNotification, createNewNotificationStatus } = useSelector(
    (state) => state.notifications,
  );
  const dispatch = useDispatch();

  const handleCreateNewNotificationClick = () => {
    dispatch(notificationActions.setCreateNewNotificationStatus(true));
    dispatch(notificationActions.setActiveNotification(null));
    dispatch(notificationActions.setEditNotification(false));
  };

  const renderNotificationContent = () => {
    if (!createNewNotificationStatus && activeNotification === null) {
      return (
        <div className={styles['notification-content']}>
          <Button
            className={styles['notification-content__btn']}
            icon={<PlusOutlined />}
            onClick={handleCreateNewNotificationClick}
          >
            Create New Notification
          </Button>
        </div>
      );
    } else if (!createNewNotificationStatus && activeNotification !== null) {
      return <NotificationDetail />;
    } else if (createNewNotificationStatus && activeNotification === null) {
      return <CreateNewNotification />;
    }
  };
  return (
    <div className={styles.notification}>{renderNotificationContent()}</div>
  );
};

export default NotificationPanel;
