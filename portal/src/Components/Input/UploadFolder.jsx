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
