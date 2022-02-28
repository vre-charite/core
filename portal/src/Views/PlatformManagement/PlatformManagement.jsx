import React, { useState } from 'react';
import { Redirect, Switch, Route } from 'react-router-dom';
import UserManagement from './UserManagement';
import Notifications from './Notifications';
import AppHeader from '../../Components/Layout/Header';
import Footer from '../../Components/Layout/Footer';
import { Tabs } from 'antd';
import { UserOutlined, BellOutlined } from '@ant-design/icons';
import { StandardLayout } from '../../Components/Layout';
import styles from './PlatformManagement.module.scss';

const PlatformManagement = () => {
  const [adminView, setAdminView] = useState(true);
  return (
    <StandardLayout>
      <div className={styles.platform_management}>
        {adminView ? (
          <div className={styles.tabs}>
            <Tabs
              defaultActiveKey="userManagement"
              style={{ backgroundColor: 'white' }}
            >
              <Tabs.TabPane
                tab={
                  <span>
                    <UserOutlined />
                    User Management
                  </span>
                }
                key="userManagement"
              >
                <UserManagement
                  adminView={adminView}
                  setAdminView={setAdminView}
                />
              </Tabs.TabPane>
              <Tabs.TabPane
                tab={
                  <span>
                    <BellOutlined />
                    Notifications
                  </span>
                }
                key="notifications"
              >
                <Notifications />
              </Tabs.TabPane>
            </Tabs>
          </div>
        ) : (
          <Redirect to="/error/403" />
        )}
      </div>
    </StandardLayout>
  );
};

export default PlatformManagement;
