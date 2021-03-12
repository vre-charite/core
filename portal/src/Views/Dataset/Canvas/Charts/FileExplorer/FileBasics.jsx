import React from 'react';
import { Descriptions } from 'antd';
import FileTags from './FileTags';
import { getFileSize, timeConvert } from '../../../../../Utility';

function FileBasics(props) {
  const { record,panelKey } = props;
  return (
    <div style={{ paddingBottom: '16px' }}>
      {/* <Title level={5}>Basic information</Title> */}
      <Descriptions size="small" column={1}>
        <Descriptions.Item
          label="File Name"
          style={{ wordBreak: 'break-word' }}
        >
          {record.fileName}
        </Descriptions.Item>
        <Descriptions.Item label="Added by">{record.owner}</Descriptions.Item>
        <Descriptions.Item label="Created">
          {timeConvert(record.createTime, 'datetime')}
        </Descriptions.Item>
        {record.generateId !== 'undefined' && (
          <Descriptions.Item label="Generate ID">
            {record.generateId}
          </Descriptions.Item>
        )}
        <Descriptions.Item label="File Size">
          {![undefined, null].includes(record.fileSize)
            ? getFileSize(record.fileSize)
            : 'N/A'}
        </Descriptions.Item>
        <Descriptions.Item>
          <FileTags
            panelKey={panelKey}
            key={record.guid}
            tags={record.tags || []}
            pid={props.pid}
            guid={record.guid}
            geid={record.geid}
            refresh={props.refresh}
          />
        </Descriptions.Item>
      </Descriptions>
    </div>
  );
}

export default FileBasics;
