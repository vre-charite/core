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
