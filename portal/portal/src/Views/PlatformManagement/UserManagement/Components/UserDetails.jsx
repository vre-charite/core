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
