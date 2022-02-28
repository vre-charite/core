import React, { useState } from 'react';
import { Card } from 'antd';
import styles from './BlankPreviewerCard.module.scss';
import { FileImageOutlined, EyeOutlined } from '@ant-design/icons';
export function BlankPreviewerCard(params) {
  return (
    <Card className={styles['card']}>
      <div className={styles['wrapper']}>
        {' '}
        <div>
          <FileImageOutlined />
        </div>
        <span>
          click <EyeOutlined /> to preview
        </span>
      </div>
    </Card>
  );
}
