import React, { useState, useEffect } from 'react';
import { Tabs } from 'antd';
import NotificationList from './Components/NotificationList/NotificationList';
import NotificationPanel from './Components/NoticationInfo/NotificationInfoPanel';
import styles from './index.module.scss';
const Notifications = () => {
  return (
    <div className={styles.tab}>
      <Tabs defaultActiveKey="maintenance">
        <Tabs.TabPane tab="Maintenance" key="maintenance">
          <div className={styles.tab_content}>
            <div className={styles.tab_content_left_part}>
              <NotificationList />
            </div>
            <div className={styles.tab_content_right_part}>
              <NotificationPanel />
            </div>
          </div>
        </Tabs.TabPane>
      </Tabs>
    </div>
  );
};

export default Notifications;
