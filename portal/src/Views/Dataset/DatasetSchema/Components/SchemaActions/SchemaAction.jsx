import React from 'react';
import { Space, Button } from 'antd';
import {
  DownloadOutlined,
  ImportOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import styles from './SchemaAction.module.scss';

export function SchemaActions(props) {
  return (
    <div className={styles['actions']}>
      <Space>
        {' '}
        <Button type="link" icon={<DownloadOutlined />}>
          Download
        </Button>{' '}
        <Button type="link" icon={<ImportOutlined />}>
          Import Data
        </Button>{' '}
        <Button type="link" icon={<DeleteOutlined />}>
          delete
        </Button>{' '}
      </Space>
    </div>
  );
}
