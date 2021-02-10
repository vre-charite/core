import React  from 'react';
import { Tree, Modal, Button } from 'antd';

import { nestedLoop, pathsMap } from '../../../../../../../Utility';

const { DirectoryTree } = Tree;

const ZipContentPlugin = (props) => {
  let data = [];
  let defaultKeys = [];

  const fileName = props.record.fileName;

  const filePaths = props.record.path;

  const location = filePaths && pathsMap(filePaths);

  const upperZipContent = props.record.zipContent || {}

  const zipContent = {};
  zipContent[fileName] = upperZipContent

  for (const key in zipContent) {
    const { treeData, expandedKey } = nestedLoop(zipContent[key], key)
    data = data.concat(treeData);
    defaultKeys = defaultKeys.concat(expandedKey);
  }

  const onSelect = (keys, info) => {
    console.log('Trigger Select', keys, info);
  };

  const onExpand = () => {
    console.log('Trigger Expand');
  };

  const titile = (
    <div>
      <span style={{ fontSize: '16px', fontWeight: 500, lineHeight: '22px' }}>Zip File Previewer</span>
      <span style={{ fontSize: '14px', fontWeight: 300, lineHeight: '22px', marginLeft: 10 }}>- {location}</span>
    </div>
  )

  return (
    <Modal
      title={titile}
      visible={props.visible}
      maskClosable={false}
      onOk={props.handlePreviewCancel}
      onCancel={props.handlePreviewCancel}
      footer={[
        <Button key="back" onClick={props.handlePreviewCancel}>
          OK
        </Button>,
      ]}
    >
      <div style={{ overflowX: 'scroll' }}>
        <DirectoryTree
          multiple
          defaultExpandAll
          onSelect={onSelect}
          onExpand={onExpand}
          treeData={data}
          height={500}
          defaultExpandedKeys={defaultKeys}
        />
      </div>
    </Modal>
  );
};

export default ZipContentPlugin;