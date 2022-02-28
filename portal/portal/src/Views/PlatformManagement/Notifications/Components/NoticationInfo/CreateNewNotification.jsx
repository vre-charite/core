import React, { useState } from 'react';
import { Switch } from 'antd';
import styles from './index.module.scss';
import FormWrapper from './FormWrapper';
import { EyeOutlined } from '@ant-design/icons';

const CreateNewNotification = () => {
  return (
    <div>
      <div className={styles['new-notification-header']}></div>
      <div className={styles['editor']}>
        <FormWrapper edit={false} />
      </div>
    </div>
  );
};

export default CreateNewNotification;
