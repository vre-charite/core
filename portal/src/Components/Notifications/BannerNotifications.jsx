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
