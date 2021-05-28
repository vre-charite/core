import React from 'react';
import { Descriptions } from 'antd';
import FileTags from './FileTags';
import { getFileSize, timeConvert } from '../../../../../Utility';
import { useSelector } from 'react-redux';
function FileBasics(props) {
  const { record, panelKey, checkIsVirtualFolder } = props;
  const filePath = record?.path; // the file's parent directory absolute path, format "/vre-data/may25/hello1234", hello1234 is the parent directory, only for file
  const folderRelativePath = record?.folderRelativePath; // the folder's relative path, only for folder. format "hello1234/inner"
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
        {checkIsVirtualFolder(panelKey) && (
          <Descriptions.Item label="Path">
            {'Home/' + getPath(filePath, folderRelativePath)}
          </Descriptions.Item>
        )}
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

        {record.nodeLabel.indexOf('Folder') === -1 ? (
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
        ) : null}
      </Descriptions>
    </div>
  );
}

const getPath = (filePath, folderPath) => {
  if (filePath === undefined && folderPath === undefined) {
    throw new Error(
      'file path and folder path can not be undefined at the same time',
    );
  }
  if (filePath !== undefined) {
    const arr = filePath.split('/');
    arr.splice(0, 3);
    return arr.join('/');
  }

  if (folderPath !== undefined) {
    return folderPath;
  }
};

export default FileBasics;
