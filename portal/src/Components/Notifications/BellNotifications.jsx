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
