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
import { Descriptions, Tooltip } from 'antd';
import FileTags from './FileTags';
import {
  getFileSize,
  timeConvert,
  checkIsVirtualFolder,
} from '../../../../../Utility';
import { DcmSpaceID } from '../../../../../config';
function FileBasics(props) {
  const { record, panelKey } = props;
  let pathsArr;
  let pathStr;
  if (record.displayPath) {
    pathsArr = record.displayPath.split('/');
    pathStr = pathsArr.slice(0, pathsArr.length - 1).join('/');
  }

  return (
    <div style={{ paddingBottom: '16px' }}>
      {/* <Title level={5}>Basic information</Title> */}
      <Descriptions size="small" column={1}>
        <Descriptions.Item label="Name" style={{ wordBreak: 'break-word' }}>
          {record.fileName}
        </Descriptions.Item>

        <Descriptions.Item label="Added by">{record.owner}</Descriptions.Item>
        <Descriptions.Item label="Created">
          {timeConvert(record.createTime, 'datetime')}
        </Descriptions.Item>
        {record['dcmId'] !== 'undefined' && (
          <Descriptions.Item label={DcmSpaceID}>
            {record['dcmId']}
          </Descriptions.Item>
        )}
        {record.nodeLabel.indexOf('Folder') === -1 ? (
          <Descriptions.Item label="File Size">
            {![undefined, null].includes(record.fileSize)
              ? getFileSize(record.fileSize)
              : 'N/A'}
          </Descriptions.Item>
        ) : null}
        {pathsArr && (
          <Descriptions.Item label="Path">
            {pathStr.length > 22 ? (
              <Tooltip title={pathStr}>{pathStr.slice(0, 22) + '...'}</Tooltip>
            ) : (
              pathStr
            )}
          </Descriptions.Item>
        )}
        <Descriptions.Item label="geid">{record.geid}</Descriptions.Item>
        <Descriptions.Item>
          <FileTags
            panelKey={panelKey}
            key={record.guid}
            pid={props.pid}
            record={record}
            guid={record.guid}
            geid={record.geid}
          />
        </Descriptions.Item>
      </Descriptions>
    </div>
  );
}

export default FileBasics;
