import React from 'react';
import { FileOutlined, FolderOutlined } from '@ant-design/icons';
export default function LabelDefault({ text, record }) {
  if (record?.nodeLabel?.includes('Folder')) {
    return <FolderOutlined style={{ float: 'right' }} />;
  } else {
    return <FileOutlined style={{ float: 'right' }} />;
  }
}
