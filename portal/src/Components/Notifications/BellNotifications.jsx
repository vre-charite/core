import React from 'react';
import { SettingOutlined } from '@ant-design/icons';
import styles from './index.module.scss';
import { formatDate } from '../../Utility';

const BellNotifications = ({ data, handleClick }) => {
  return (
    <ul className={styles.notification_container}>
      {data.map((notification) => {
        const { id, type, detail } = notification;
        return (
          <li className={styles['bell-item']} onClick={() => handleClick(id, data)}>
            <div className={styles['bell-item__type']}>
              <SettingOutlined style={{ marginRight: '8px', transform: 'translateY(-1px)' }} />
              <p>{`Upcoming ${type}`}</p>
            </div>
            <p>{`${formatDate(detail.maintenanceDate)} - Estimated Duration: ${detail.duration} ${detail.durationUnit}`}</p>
          </li>
        );
      })}
    </ul>
  );
};

export default BellNotifications;
