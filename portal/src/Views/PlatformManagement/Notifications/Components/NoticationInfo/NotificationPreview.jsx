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

import React, { useState, useRef, useEffect } from 'react';
import { Switch, Button } from 'antd';
import styles from './index.module.scss';
import { EyeOutlined, BellOutlined } from '@ant-design/icons';
import UpcomingMaintenanceModal from '../../../../../Components/Modals/UpcomingMaintenanceModal';
import BannerNotifications from '../../../../../Components/Notifications/BannerNotifications';
const NotificationPreview = ({ data }) => {
  const modalMountRef = useRef(null);
  const [previewVisible, setPreviewVisible] = useState(false);
  return (
    <div className={styles['preview-bar']}>
      <div className={styles['preview-bar__header']}>
        <EyeOutlined /> <p>Preview</p>{' '}
        <Switch
          onChange={(checked) => {
            setPreviewVisible(checked);
          }}
        />
      </div>
      {data && previewVisible ? (
        <div className={styles['preview-bar__content']}>
          <div className={styles['preview-bar__content__banner']}>
            <BannerNotifications
              data={[data]}
              openModal={() => {}}
              closeNotificationPerm={() => {}}
              closeNotificationSession={() => {}}
            />
            <p>
              *This is the portal Banner preview which immediately goes to the
              top of the page when you publish.
            </p>
          </div>
          <div
            className={styles['preview-bar__content__modal']}
            id="notification-preview-modal"
            ref={modalMountRef}
          >
            <UpcomingMaintenanceModal
              data={data}
              visible={true}
              onOk={() => {}}
              onCancel={() => {}}
              hideMask={true}
              getContainer={() => {
                return document.getElementById('notification-preview-modal');
              }}
            />

            <p>
              *This is the modal preview, which appears when a user clicks ‘More
              Info’.
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
};
export default NotificationPreview;
