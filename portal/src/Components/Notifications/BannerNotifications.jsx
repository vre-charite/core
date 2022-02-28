import React from 'react';
import {
  SettingOutlined,
  InfoCircleOutlined,
  CloseOutlined,
} from '@ant-design/icons';
import { Button } from 'antd';
import styles from './index.module.scss';
import { formatDate } from '../../Utility';

const BannerNotifications = ({
  data,
  openModal,
  closeNotificationPerm,
  closeNotificationSession,
}) => {
  return (
    <ul className={styles['banner-notifications']}>
      {data.slice(0, 5).map((notification) => {
        const { id, type, detail } = notification;
        return (
          <li
            key={id}
            data-id={id}
            className={styles['banner-notifications__item']}
          >
            <div
              className={
                styles['banner-notifications__content'] +
                ' banner-notifications__content'
              }
            >
              <div className={styles['banner-notifications__type']}>
                <SettingOutlined
                  style={{
                    marginRight: '8px',
                    transform: 'translateY(-1px)',
                  }}
                />
                <p>{`Upcoming ${type}`}</p>
              </div>
              <p
                className={styles['banner-notifications__time']}
              >{`${formatDate(detail.maintenanceDate)} - Estimated Duration: ${
                detail.duration
              } ${detail.durationUnit}`}</p>
              <div
                className={styles['banner-notifications__info']}
                onClick={() => openModal(id, data)}
              >
                <InfoCircleOutlined style={{ marginRight: '8px' }} />
                <span>More Info</span>
              </div>
            </div>
            <div
              className={
                styles['banner-notifications__close'] +
                ' banner-notifications__close'
              }
            >
              <span onClick={() => closeNotificationPerm(id)}>
                Don't show again
              </span>
              <Button
                icon={<CloseOutlined style={{ marginRight: 0 }} />}
                size="small"
                onClick={() => closeNotificationSession(id)}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
};

export default BannerNotifications;
