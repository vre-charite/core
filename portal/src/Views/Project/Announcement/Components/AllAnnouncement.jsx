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
import { Card, Tabs, DatePicker } from 'antd';
import { Today, All, LastSevenDays } from './Tabs';
import styles from '../index.module.scss';
const { TabPane } = Tabs;
export default function AllAnnouncement({ currentProject,indicator }) {
  const [dateString, setDateString] = useState('');
  const [currentTab, setCurrentTab] = useState('today');
  return (
    <Card title="All announcements">
      <Tabs
        className={styles.announcement_tabs}
        onChange={(key) => {
          setCurrentTab(key);
        }}
        style={{ margin: -18 }}
        activeKey={currentTab}
        tabBarExtraContent={
          currentTab === 'all' && (
            <DatePicker
              style={{
                margin: '10px 18px 0',
              }}
              onChange={(date, dateString) => {
                setDateString(dateString);
              }}
            />
          )
        }
      >
        <TabPane tab="Today" key="today">
          <Today indicator={indicator} currentProject={currentProject} />
        </TabPane>
        <TabPane tab="Last 7 days" key="lastSevenDays">
          <LastSevenDays indicator={indicator} currentProject={currentProject} />
        </TabPane>
        <TabPane tab="All" key="all">
          <All indicator={indicator} currentProject={currentProject} dateString={dateString} />
        </TabPane>
      </Tabs>
    </Card>
  );
}
