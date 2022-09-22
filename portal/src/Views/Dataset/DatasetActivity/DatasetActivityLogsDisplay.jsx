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
import { Tag, Tooltip } from 'antd';
import {
  SyncOutlined,
  PlusOutlined,
  CloseOutlined,
  DownloadOutlined,
  ImportOutlined,
  EditOutlined,
} from '@ant-design/icons';

const datasetUpdateInfoDisplay = (caseType) => {
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

const datasetDownloadInfoDisplay = (details) => {
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

const datasetVersionInfoDisplay = (details) => {
  return (
    <div>
      <p
        style={{
          fontWeight: 'bold',
          color: '#003262',
          margin: '0px 0px 0px 23px',
        }}
      >
        Version {details.source}
      </p>
    </div>
  );
};

const datasetCreateInfoDisplay = () => {
  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <PlusOutlined style={{ color: '#003262', marginRight: '10px' }} />
      <p style={{ margin: '0px' }}>Created a Dataset</p>
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
      displayInfo = 'Deleted Dataset Authors:' + ' ';
    } else {
      displayInfo = 'Deleted a Dataset Author:' + ' ';
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
      displayInfo = 'Deleted Dataset Tags:' + ' ';
    } else {
      displayInfo = 'Deleted a Dataset Tag:' + ' ';
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
      displayInfo = 'Deleted Dataset Modalities:' + ' ';
    } else {
      displayInfo = 'Deleted a Dataset Modality:' + ' ';
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
      displayInfo = 'Deleted Dataset Collection Methods:' + ' ';
    } else {
      displayInfo = 'Deleted a Dataset Collection Method:' + ' ';
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

const datasetAddAndRemoveInfoDisplay = (caseType, action, details) => {
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

const schemaInfoDisplay = {
  schemaCreateInfoDisplay: (details) => {
    return (
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <PlusOutlined style={{ color: '#003262', marginRight: '10px' }} />
        <p style={{ margin: '0px' }}>
          Created a schema:{' '}
          <span style={{ fontWeight: 600 }}>
            {details.name.length > 40 ? (
              <Tooltip title={details.name}>{`${details.name.slice(
                0,
                40,
              )}...`}</Tooltip>
            ) : (
              details.name
            )}
          </span>
        </p>
      </div>
    );
  },
  schemaRemoveInfoDisplay: (details) => {
    return (
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <CloseOutlined style={{ color: '#FF6D72', marginRight: '10px' }} />
        <p style={{ margin: '0px' }}>
          Deleted a schema:{' '}
          <span style={{ fontWeight: 600 }}>
            {details.name.length > 40 ? (
              <Tooltip title={details.name}>{`${details.name.slice(
                0,
                40,
              )}...`}</Tooltip>
            ) : (
              details.name
            )}
          </span>
        </p>
      </div>
    );
  },
  schemaUpdateInfoDisplay: (details) => {
    return (
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <SyncOutlined style={{ color: '#003262', marginRight: '10px' }} />
        <p style={{ margin: '0px' }}>
          {`Updated a schema (${
            details.name.length > 40 ? (
              <Tooltip title={details.name}>{`${details.name.slice(
                0,
                40,
              )}...`}</Tooltip>
            ) : (
              details.name
            )
          })`}
          {details.targets && details.targets.length ? ': ' : ''}
          <span style={{ fontWeight: 600 }}>
            {details.targets.join(', ').length > 80 ? (
              <Tooltip title={details.targets.join(', ')}>{`${details.targets
                .join(', ')
                .slice(0, 80)}...`}</Tooltip>
            ) : (
              details.targets.join(', ')
            )}
          </span>
        </p>
      </div>
    );
  },
};

const schemaTemplateInfoDisplay = {
  schemaTemplateCreateInfoDisplay: (details) => {
    return (
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <PlusOutlined style={{ color: '#003262', marginRight: '10px' }} />
        <p style={{ margin: '0px' }}>
          Added a Custom Schema Template:{' '}
          <span style={{ fontWeight: 600 }}>
            {details.name.length > 40 ? (
              <Tooltip title={details.name}>{`${details.name.slice(
                0,
                40,
              )}...`}</Tooltip>
            ) : (
              details.name
            )}
          </span>
        </p>
      </div>
    );
  },
};

const fileInfoDisplay = (caseType, action, details) => {
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
            <span style={{ fontWeight: 600 }}>
              {details.from.length > 40 ? (
                <Tooltip title={details.from}>{`${details.from.slice(
                  0,
                  40,
                )}...`}</Tooltip>
              ) : (
                details.from
              )}
            </span>{' '}
            to{' '}
            <span style={{ fontWeight: 600 }}>
              {details.to.length > 40 ? (
                <Tooltip title={details.to}>{`${details.to.slice(
                  0,
                  40,
                )}...`}</Tooltip>
              ) : (
                details.to
              )}
            </span>
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
            Deleted a file/folder:{' '}
            <span style={{ fontWeight: 600 }}>{details.sourceList[0]}</span>
          </p>
        </div>
      );
    } else if (
      action === 'UPDATE' &&
      details.hasOwnProperty('from') &&
      details.hasOwnProperty('to')
    ) {
      return (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <EditOutlined style={{ color: '#003262', marginRight: '10px' }} />
          <p style={{ margin: '0px' }}>
            Renamed a file/folder from:{' '}
            <span style={{ fontWeight: 600 }}>
              {details.from.length > 40 ? (
                <Tooltip title={details.from}>{`${details.from.slice(
                  0,
                  40,
                )}...`}</Tooltip>
              ) : (
                details.from
              )}
            </span>{' '}
            to{' '}
            <span style={{ fontWeight: 600 }}>
              {details.to.length > 40 ? (
                <Tooltip title={details.to}>{`${details.to.slice(
                  0,
                  40,
                )}...`}</Tooltip>
              ) : (
                details.to
              )}
            </span>
          </p>
        </div>
      );
    }
  }
};

//display logs information
const logsInfo = (action, detail, resource) => {
  switch (resource) {
    case 'Dataset.Title':
      return datasetUpdateInfoDisplay('Dataset.Title');
    case 'Dataset.License':
      return datasetUpdateInfoDisplay('Dataset.License');
    case 'Dataset.Type':
      return datasetUpdateInfoDisplay('Dataset.Type');
    case 'Dataset.Description':
      return datasetUpdateInfoDisplay('Dataset.Description');
    case 'Dataset.Authors':
      switch (action) {
        case 'ADD':
          return datasetAddAndRemoveInfoDisplay(
            'Dataset.Authors',
            'ADD',
            detail,
          );
        case 'REMOVE':
          return datasetAddAndRemoveInfoDisplay(
            'Dataset.Authors',
            'REMOVE',
            detail,
          );
      }
    case 'Dataset.Modality':
      switch (action) {
        case 'ADD':
          return datasetAddAndRemoveInfoDisplay(
            'Dataset.Modality',
            'ADD',
            detail,
          );
        case 'REMOVE':
          return datasetAddAndRemoveInfoDisplay(
            'Dataset.Modality',
            'REMOVE',
            detail,
          );
      }
    case 'Dataset.CollectionMethod':
      switch (action) {
        case 'ADD':
          return datasetAddAndRemoveInfoDisplay(
            'Dataset.CollectionMethod',
            'ADD',
            detail,
          );
        case 'REMOVE':
          return datasetAddAndRemoveInfoDisplay(
            'Dataset.CollectionMethod',
            'REMOVE',
            detail,
          );
      }
    case 'Dataset.Tags':
      switch (action) {
        case 'ADD':
          return datasetAddAndRemoveInfoDisplay('Dataset.Tags', 'ADD', detail);
        case 'REMOVE':
          return datasetAddAndRemoveInfoDisplay(
            'Dataset.Tags',
            'REMOVE',
            detail,
          );
      }
    case 'Dataset':
      switch (action) {
        case 'CREATE':
          return datasetCreateInfoDisplay();
        case 'DOWNLOAD':
          return datasetDownloadInfoDisplay(detail);
        case 'PUBLISH':
          return datasetVersionInfoDisplay(detail);
      }
    case 'File':
      switch (action) {
        case 'MOVE':
          return fileInfoDisplay('File', 'MOVE', detail);
        case 'ADD':
          return fileInfoDisplay('File', 'ADD', detail);
        case 'REMOVE':
          return fileInfoDisplay('File', 'REMOVE', detail);
        case 'UPDATE':
          return fileInfoDisplay('File', 'UPDATE', detail);
      }
    case 'Schema':
      switch (action) {
        case 'CREATE':
          return schemaInfoDisplay.schemaCreateInfoDisplay(detail);
        case 'REMOVE':
          return schemaInfoDisplay.schemaRemoveInfoDisplay(detail);
        case 'UPDATE':
          return schemaInfoDisplay.schemaUpdateInfoDisplay(detail);
      }
    case 'Dataset.Schema.Template':
      switch (action) {
        case 'CREATE':
          return schemaTemplateInfoDisplay.schemaTemplateCreateInfoDisplay(
            detail,
          );
      }
    default:
      return null;
  }
};

export default logsInfo;
