import React from 'react';
import getChildrenTree from './getChildrenTree';
import _ from 'lodash';
import { FolderOpenOutlined, FolderOutlined } from '@ant-design/icons';
const computePureFolders = (allFolders, subContainers) => {
  return _.differenceWith(allFolders, subContainers, (af, sc) => {
    if (typeof af !== 'object') {
      return false;
    }
    return sc['dataset_name'] === Object.keys(af)[0];
  });
};

export const getCoreTreeNodes = function (allFolders) {
  //Calculate the core folders
  let coreFolders = allFolders.data.result.vre;

  //core folders only care about items "raw" or "processed"
  coreFolders = coreFolders
    .filter(
      (el) =>
        Object.keys(el) &&
        (Object.keys(el)[0] === 'raw' || Object.keys(el)[0] === 'processed') &&
        el[Object.keys(el)[0]]?.length,
    )
    .map((el) => {
      //Uppercasing the first letter of folder name
      const title =
        Object.keys(el)[0].charAt(0).toUpperCase() +
        Object.keys(el)[0].slice(1);
      const content = el[Object.keys(el)[0]];
      delete el[Object.keys(el)[0]];
      el[title] = content;

      return el;
    });

  let coreTreeData = getChildrenTree(coreFolders, 'core', '');

  //If there are processed data folder, add it to the tree
  if (coreTreeData) {
    const processedCoreFolder = _.find(coreTreeData, (ele) => {
      return ele.title === 'processed';
    });

    coreTreeData.push({
      title: 'Processed',
      key: 'core-processed',
      icon: <FolderOutlined />,
      disabled: true,
      children: processedCoreFolder?.children,
    });
  }
  coreTreeData = coreTreeData?.map((el) => {
    return { ...el, children: undefined };
  });
  return coreTreeData;
};
export const getGreenRoomTreeNodes = function (allFolders) {
  // Compute tree data
  let pureFolders = computePureFolders(
    allFolders.data.result.gr,
    // subContainers.data.result.children,
    undefined,
  );
  const treeData = getChildrenTree(pureFolders, 'greenroom', '');
  const processedFolder = _.find(treeData, (ele) => {
    return ele.title === 'processed';
  });

  const newTree = [
    {
      title: 'Raw',
      key: 'greenroom-raw',
      icon: <FolderOpenOutlined />,
    },
  ];
  if (processedFolder) {
    newTree.push({
      title: 'Processed',
      key: 'greenroom-processed',
      icon: <FolderOutlined />,
      disabled: true,
      children: processedFolder.children,
    });
  }
  return newTree;
};
