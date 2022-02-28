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
