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

import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { notificationActions } from '../../../../../Redux/actions';
import { List } from 'antd';
import { PlusOutlined, SettingOutlined } from '@ant-design/icons';
import styles from './NotificationList.module.scss';
import { timeConvert } from '../../../../../Utility';
import moment from 'moment';

const NotificationList = () => {
  const {
    activeNotification,
    createNewNotificationStatus,
    notificationList,
    edit,
  } = useSelector((state) => state.notifications);
  const dispatch = useDispatch();
  const onListClick = (item) => {
    if (!edit) {
      dispatch(notificationActions.setCreateNewNotificationStatus(false));
      dispatch(notificationActions.setActiveNotification(item));
    }
  };
  const onNewNotificationClick = () => {
    dispatch(notificationActions.setCreateNewNotificationStatus(false));
    dispatch(notificationActions.setActiveNotification(null));
  };
  return (
    <div className={styles['notification-list']}>
      <div
        className={`${styles['new-notification-listItem']} ${
          createNewNotificationStatus && styles['list-item-backgroundColor']
        }`}
        onClick={onNewNotificationClick}
      >
        <PlusOutlined className={styles['new-notification-listItem__icon']} />{' '}
        Create New Notification
      </div>
      <List
        size="large"
        bordered={false}
        dataSource={notificationList}
        pagination={{
          pageSize: 10,
          simple: true,
        }}
        renderItem={(item, index) => (
          <List.Item
            className={`${
              !createNewNotificationStatus &&
              activeNotification &&
              activeNotification.id === item.id &&
              styles['list-item-backgroundColor']
            }`}
            id={item.id}
            style={{ cursor: 'pointer' }}
            onClick={(e) => {
              onListClick(item);
            }}
          >
            <div className={styles['list-content']}>
              <div className={styles['list-content__icon']}>
                <SettingOutlined />
              </div>
              <div>
                <p>{timeConvert(item.detail.maintenanceDate, 'datetime')}</p>
                <p className={styles['list-content__status']}>Published</p>
              </div>
              {new Date() > new Date(item.detail.maintenanceDate) ? (
                <div className={styles['list-content__expired']}></div>
              ) : null}
            </div>
          </List.Item>
        )}
      />
    </div>
  );
};

export default NotificationList;
