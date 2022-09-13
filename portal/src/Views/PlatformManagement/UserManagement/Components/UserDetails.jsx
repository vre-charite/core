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
import { Descriptions } from 'antd';
import { timeConvert, partialString } from '../../../../Utility';

function UserDetails(props) {
  const { record } = props;

  return (
    <div style={{ paddingBottom: '16px' }}>
      <Descriptions size="small" column={1}>
        <Descriptions.Item label="User Name">{record.name}</Descriptions.Item>
        {record.role === 'admin' ? (
          <Descriptions.Item label="Role">
            Platform Administrator
          </Descriptions.Item>
        ) : null}
        <Descriptions.Item label="Email">{record.email}</Descriptions.Item>
        <Descriptions.Item label="First Name">
          {record.firstName && record.firstName.length > 40
            ? partialString(record.firstName, 40, true)
            : record.firstName}
        </Descriptions.Item>
        <Descriptions.Item label="Last Name">
          {record.lastName && record.lastName.length > 40
            ? partialString(record.lastName, 40, true)
            : record.lastName}
        </Descriptions.Item>
        <Descriptions.Item label="Join Date">
          {record.timeCreated && timeConvert(record.timeCreated, 'datetime')}
        </Descriptions.Item>
        <Descriptions.Item label="Last Login Time">
          {record.lastLogin && timeConvert(record.lastLogin, 'datetime')}
        </Descriptions.Item>
        <Descriptions.Item label="Status">{record.status}</Descriptions.Item>
      </Descriptions>
    </div>
  );
}

export default UserDetails;
