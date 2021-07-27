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
