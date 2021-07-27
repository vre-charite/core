import React from 'react';
import { Tag, Tooltip } from 'antd';
import {
  SyncOutlined,
  PlusOutlined,
  CloseOutlined,
  DownloadOutlined,
  ImportOutlined,
} from '@ant-design/icons';

export const datasetUpdateInfoDisplay = (caseType) => {
  let type;
  if (caseType === 'Dataset.Title') {
    type = 'Title';
  } else if (caseType === 'Dataset.License') {
    type = 'License';
  } else if (caseType === 'Dataset.Type') {
    type = 'Type';
  } else if (caseType === 'Dataset.Description') {
    type = 'Description';
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <SyncOutlined style={{ color: '#003262', marginRight: '10px' }} />
      <p style={{ margin: '0px' }}>Updated Dataset {type}</p>
    </div>
  );
};

export const datasetDownloadInfoDisplay = (details) => {
  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <DownloadOutlined style={{ color: '#003262', marginRight: '10px' }} />
      {typeof details.source === 'string' ? (
        <p style={{ margin: '0px' }}>Downloaded a Dataset</p>
      ) : (
        <p style={{ margin: '0px' }}>
          {details.source.length > 1
            ? `Downloaded ${details.source.length} files: `
            : `Downloaded ${details.source.length} file: `}
          <span style={{ fontWeight: 600 }}>{details.source.join(', ')}</span>
        </p>
      )}
    </div>
  );
};

export const datasetCreateInfoDisplay = () => {
  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <PlusOutlined style={{ color: '#003262', marginRight: '10px' }} />
      <p style={{ margin: '0px' }}>Create a Dataset</p>
    </div>
  );
};

const datasetAddAndRemoveInfoDisplayHelper = (caseType, action, details) => {
  let displayInfo;
  let diffArr;
  if (caseType === 'Dataset.Authors' && action === 'ADD') {
    diffArr = details.to.filter((el) => !details.from.includes(el));
    if (diffArr.length > 1) {
      displayInfo = 'Added Dataset Authors:' + ' ';
    } else {
      displayInfo = 'Added a Dataset Author:' + ' ';
    }
  } else if (caseType === 'Dataset.Authors' && action === 'REMOVE') {
    diffArr = details.from.filter((el) => !details.to.includes(el));
    if (diffArr.length > 1) {
      displayInfo = 'Removed Dataset Authors:' + ' ';
    } else {
      displayInfo = 'Removed a Dataset Author:' + ' ';
    }
  } else if (caseType === 'Dataset.Tags' && action === 'ADD') {
    diffArr = details.to.filter((el) => !details.from.includes(el));
    if (diffArr.length > 1) {
      displayInfo = 'Added Dataset Tags:' + ' ';
    } else {
      displayInfo = 'Added a Dataset Tag:' + ' ';
    }
  } else if (caseType === 'Dataset.Tags' && action === 'REMOVE') {
    diffArr = details.from.filter((el) => !details.to.includes(el));
    if (diffArr.length > 1) {
      displayInfo = 'Removed Dataset Tags:' + ' ';
    } else {
      displayInfo = 'Removed a Dataset Tag:' + ' ';
    }
  } else if (caseType === 'Dataset.Modality' && action === 'ADD') {
    diffArr = details.to.filter((el) => !details.from.includes(el));
    if (diffArr.length > 1) {
      displayInfo = 'Added Dataset Modalities:' + ' ';
    } else {
      displayInfo = 'Added a Dataset Modality:' + ' ';
    }
  } else if (caseType === 'Dataset.Modality' && action === 'REMOVE') {
    diffArr = details.from.filter((el) => !details.to.includes(el));
    if (diffArr.length > 1) {
      displayInfo = 'Removed Dataset Modalities:' + ' ';
    } else {
      displayInfo = 'Removed a Dataset Modality:' + ' ';
    }
  } else if (caseType === 'Dataset.CollectionMethod' && action === 'ADD') {
    diffArr = details.to.filter((el) => !details.from.includes(el));
    if (diffArr.length > 1) {
      displayInfo = 'Added Dataset Collection Methods:' + ' ';
    } else {
      displayInfo = 'Added a Dataset Collection Method:' + ' ';
    }
  } else if (caseType === 'Dataset.CollectionMethod' && action === 'REMOVE') {
    diffArr = details.from.filter((el) => !details.to.includes(el));
    if (diffArr.length > 1) {
      displayInfo = 'Removed Dataset Collection Methods:' + ' ';
    } else {
      displayInfo = 'Removed a Dataset Collection Method:' + ' ';
    }
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      {action === 'ADD' ? (
        <PlusOutlined style={{ color: '#003262', marginRight: '10px' }} />
      ) : (
        <CloseOutlined style={{ color: '#FF6D72', marginRight: '10px' }} />
      )}
      <p style={{ margin: '0px' }}>
        {displayInfo}
        {caseType === 'Dataset.Tags' ? (
          diffArr.map((el) => <Tag style={{ marginRight: '5px' }}>{el}</Tag>)
        ) : (
          <span style={{ fontWeight: 600 }}>
            {diffArr.join(', ').length > 80 ? (
              <Tooltip title={diffArr.join(', ')}>{`${diffArr
                .join(', ')
                .slice(0, 80)}....`}</Tooltip>
            ) : (
              diffArr.join(', ')
            )}
          </span>
        )}
      </p>
    </div>
  );
};

export const datasetAddAndRemoveInfoDisplay = (caseType, action, details) => {
  if (caseType === 'Dataset.Authors') {
    if (
      action === 'ADD' &&
      details.hasOwnProperty('from') &&
      details.hasOwnProperty('to')
    ) {
      return datasetAddAndRemoveInfoDisplayHelper(
        'Dataset.Authors',
        'ADD',
        details,
      );
    } else if (
      action === 'REMOVE' &&
      details.hasOwnProperty('from') &&
      details.hasOwnProperty('to')
    ) {
      return datasetAddAndRemoveInfoDisplayHelper(
        'Dataset.Authors',
        'REMOVE',
        details,
      );
    }
  } else if (caseType === 'Dataset.Tags') {
    if (
      action === 'ADD' &&
      details.hasOwnProperty('from') &&
      details.hasOwnProperty('to')
    ) {
      return datasetAddAndRemoveInfoDisplayHelper(
        'Dataset.Tags',
        'ADD',
        details,
      );
    } else if (
      action === 'REMOVE' &&
      details.hasOwnProperty('from') &&
      details.hasOwnProperty('to')
    ) {
      return datasetAddAndRemoveInfoDisplayHelper(
        'Dataset.Tags',
        'REMOVE',
        details,
      );
    }
  } else if (caseType === 'Dataset.Modality') {
    if (
      action === 'ADD' &&
      details.hasOwnProperty('from') &&
      details.hasOwnProperty('to')
    ) {
      return datasetAddAndRemoveInfoDisplayHelper(
        'Dataset.Modality',
        'ADD',
        details,
      );
    } else if (
      action === 'REMOVE' &&
      details.hasOwnProperty('from') &&
      details.hasOwnProperty('to')
    ) {
      return datasetAddAndRemoveInfoDisplayHelper(
        'Dataset.Modality',
        'REMOVE',
        details,
      );
    }
  } else if (caseType === 'Dataset.CollectionMethod') {
    if (
      action === 'ADD' &&
      details.hasOwnProperty('from') &&
      details.hasOwnProperty('to')
    ) {
      return datasetAddAndRemoveInfoDisplayHelper(
        'Dataset.CollectionMethod',
        'ADD',
        details,
      );
    } else if (
      action === 'REMOVE' &&
      details.hasOwnProperty('from') &&
      details.hasOwnProperty('to')
    ) {
      return datasetAddAndRemoveInfoDisplayHelper(
        'Dataset.CollectionMethod',
        'REMOVE',
        details,
      );
    }
  }
};

const fileInfoDisplayHelper = (details) => {
  let addFiles;
  addFiles = details.sourceList.map(
    (el) => el.split('/')[el.split('/').length - 1],
  );
  return addFiles.join(', ').length > 80 ? (
    <Tooltip title={addFiles.join(', ')}>{`${addFiles
      .join(', ')
      .slice(0, 80)}...`}</Tooltip>
  ) : (
    addFiles.join(', ')
  );
};

export const fileInfoDisplay = (caseType, action, details) => {
  if (caseType === 'File') {
    if (
      action === 'MOVE' &&
      details.hasOwnProperty('from') &&
      details.hasOwnProperty('to')
    ) {
      return (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <ImportOutlined style={{ color: '#003262', marginRight: '10px' }} />
          <p style={{ margin: '0px' }}>
            Moved a file/folder from:{' '}
            <span style={{ fontWeight: 600 }}>{details.from}</span> to{' '}
            <span style={{ fontWeight: 600 }}>{details.to}</span>
          </p>
        </div>
      );
    } else if (action === 'ADD' && details.hasOwnProperty('sourceList')) {
      return (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <PlusOutlined style={{ color: '#003262', marginRight: '10px' }} />
          <p style={{ margin: '0px' }}>
            {details.sourceList.length > 1
              ? `Added file(s)/folder(s): `
              : `Added a file/folder: `}
            {fileInfoDisplayHelper(details)}
          </p>
        </div>
      );
    } else if (action === 'REMOVE' && details.hasOwnProperty('sourceList')) {
      return (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <CloseOutlined style={{ color: '#FF6D72', marginRight: '10px' }} />
          <p style={{ margin: '0px' }}>
            Removed a file/folder:{' '}
            <span style={{ fontWeight: 600 }}>{details.sourceList[0]}</span>
          </p>
        </div>
      );
    }
  }
};
