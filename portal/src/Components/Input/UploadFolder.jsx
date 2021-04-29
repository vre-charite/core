import React, { useEffect, useState } from 'react';
import { Upload } from 'antd';
import styles from './index.module.scss';
import { DeleteOutlined, FolderOutlined } from '@ant-design/icons';
import _ from 'lodash';

export function UploadFolder(props) {
  if (!props.directory) {
    throw new TypeError('directory prop should be true');
  }
  const [value, setValue] = useState(props.value);
  useEffect(() => {
    setValue(props.value);
  }, [props.value]);

  const onRemove = () => {
    props.onChange(undefined);
  };

  const folderName = getFolderName(value?.file);

  return (
    <>
      <Upload
        {...props}
        onChange={(info) => {
          const { fileList, file } = info;
          const newFolderName = getFolderName(file);
          const fileListFiltered = _.filter(fileList, (item) => {
            return item.originFileObj.webkitRelativePath.startsWith(
              newFolderName,
            );
          });
          info.fileList = fileListFiltered;
          props.onChange(info);
          setValue(info);
        }}
        beforeUpload={(file) => {
          return false;
        }}
        showUploadList={false}
        value={value}
      />
      {folderName && (
        <div className={styles.folderItem}>
          <span>
            <FolderOutlined />
          </span>
          <span>{folderName}</span>

          <span
            onClick={() => {
              onRemove();
            }}
            style={{ float: 'right' }}
          >
            <DeleteOutlined />
          </span>
        </div>
      )}
    </>
  );
}

const getFolderName = (file) => {
  if (file) {
    const path = file.webkitRelativePath;
    const folderName = path.split('/')[0];
    return folderName;
  } else {
    return null;
  }
};
