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
