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
import { Col, Row, Layout } from 'antd';
import Publishing from './Components/Publishing';
import Recent from './Components/Recent';
import AllAnnouncement from './Components/AllAnnouncement';
import { useCurrentProject } from '../../../Utility';
import CanvasPageHeader from '../Canvas/PageHeader/CanvasPageHeader';
import styles from './index.module.scss';
const { Content } = Layout;

function Announcement() {
  const [currentProject] = useCurrentProject();
  const [indicator, setIndicator] = useState(
    new Date().toISOString().replace(/T/, ' ').replace(/\..+/, ''),
  );
  return (
    <Content key={indicator} className="content">
      <CanvasPageHeader />
      <Row gutter={[20, 8]} style={{ marginTop: 30 }}>
        <Col span={8}>
          {currentProject?.permission === 'admin' && (
            <div className={styles.announcement_card_wrap}>
              <Publishing
                setIndicator={setIndicator}
                currentProject={currentProject}
              />
            </div>
          )}
          <div
            style={currentProject?.permission === 'admin'?{ marginTop: 24 }:{}}
            className={styles.announcement_card_wrap}
          >
            <Recent indicator={indicator} currentProject={currentProject} />
          </div>
        </Col>
        <Col span={16}>
          <div
            className={styles.announcement_card_wrap}
            style={{ height: '100%' }}
          >
            <AllAnnouncement
              indicator={indicator}
              currentProject={currentProject}
            />
          </div>
        </Col>
      </Row>
    </Content>
  );
}

export default Announcement;
