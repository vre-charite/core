import React, { useState } from 'react';
import { Card } from 'antd';
import styles from './BlankPreviewerCard.module.scss';
import { FileImageOutlined } from '@ant-design/icons';
export function BlankPreviewerCard(params) {
  return (
    <Card className={styles['card']}>
      <div className={styles['wrapper']}>
        {' '}
        <div>
          <FileImageOutlined />
        </div>
        <span>Select file to preview</span>
      </div>
    </Card>
  );
}
