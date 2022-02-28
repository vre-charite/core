import React from 'react';
import { Card } from 'antd';
import styles from './NotSupportCard.module.scss';
import { FileImageOutlined } from '@ant-design/icons';
export function NotSupportCard(params) {
  return (
    <Card className={styles['card']}>
      <div className={styles['wrapper']}>
        {' '}
        <div>
          <FileImageOutlined />
        </div>
        <span>This file type does not support preview</span>
      </div>
    </Card>
  );
}
