import React from 'react';
import { Descriptions } from 'antd';
import FileTags from './FileTags';
import { getFileSize, timeConvert } from '../../../../../Utility';
import { useSelector } from 'react-redux';
function FileBasics(props) {
  const { record, panelKey } = props;
  const folderRouting = useSelector(
    (state) => state.fileExplorer && state.fileExplorer.folderRouting,
  );
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
        {record.generateId !== 'undefined' && (
          <Descriptions.Item label="Generate ID">
            {record.generateId}
          </Descriptions.Item>
        )}
        {record.nodeLabel.indexOf('Folder') === -1 ? (
          <Descriptions.Item label="File Size">
            {![undefined, null].includes(record.fileSize)
              ? getFileSize(record.fileSize)
              : 'N/A'}
          </Descriptions.Item>
        ) : null}

        {record.nodeLabel.indexOf('Folder') === -1 &&
        !folderRouting[panelKey] ? (
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
        ) : null}
      </Descriptions>
    </div>
  );
}

export default FileBasics;
