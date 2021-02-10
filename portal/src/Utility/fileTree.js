import React from 'react';
import { Popover } from 'antd';
import getChildrenTree from './getChildrenTree';
import _ from 'lodash';
import { FolderOpenOutlined, FolderOutlined, DeleteOutlined } from '@ant-design/icons';
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
  let coreFolders = allFolders.data.result.vre || [];

  //core folders only care about items "raw" or "processed"
  coreFolders = coreFolders
    .filter(
      (el) =>
        Object.keys(el) &&
        (Object.keys(el)[0] === 'raw' || Object.keys(el)[0] === 'processed' || Object.keys(el)[0] === 'trash') &&
        el[Object.keys(el)[0]]?.length,
    )
    .map((el) => {
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
    const trashFolder = _.find(coreTreeData, (ele) => {
      return ele.title === 'trash';
    });

    coreTreeData.push({
      title: 'Processed',
      key: 'core-processed',
      icon: <FolderOutlined />,
      disabled: true,
      children: processedCoreFolder?.children,
    });

    coreTreeData.push({
      title: 'Trash Bin',
      key: 'core-trash',
      icon: <DeleteOutlined />,
      children: trashFolder && trashFolder.children,
    });
  }
  coreTreeData = coreTreeData?.map((el) => {
    return { ...el, children: undefined };
  });
  return coreTreeData;
};

export const getGreenRoomTreeNodes = function (allFolders) {
  let pureFolders = computePureFolders(
    allFolders.data.result.gr,
    undefined,
  );
  const treeData = getChildrenTree(pureFolders, 'greenroom', '');
  const processedFolder = _.find(treeData, (ele) => {
    return ele.title === 'processed';
  });
  const trashFolder = _.find(treeData, (ele) => {
    return ele.title === 'trash';
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
  if (trashFolder) {
    newTree.push({
      title: 'Trash Bin',
      key: 'greenroom-trash',
      icon: <DeleteOutlined />,
      // disabled: true,
      children: trashFolder.children,
    });
  }
  return newTree;
};

function recursiveFunction(collection, item, index, expandedKey){ 
  _.each(collection, function(parent){ 
      if (parent.key === `${item.prevNode}`) {
        const children = parent.children;
        let titileContent = item.title;
        if (item.title && item.title.length > 30) {
          titileContent = (
            <Popover content={item.title}>
              {item.title.substring(0, 20)}...
            </Popover>
          )
        }
        children.push({
          title: titileContent,
          key: `${item.key}`,
          children: [],
          isLeaf: item.isLeaf
        });
        parent.children = children
        if (!item.isLeaf) expandedKey.push(`${item.key}`);
      } else { 
          recursiveFunction(parent.children, item, `${item.key}`, expandedKey); 
      }
  }); 
}; 


export const  nestedLoop = (obj, zipName) => {
  const nodes = [{
    title: zipName,
    isLeaf: false,
    layer: 0,
    key: 0
  }]

  const expandedKey = [];

  let count = 0
 
  function recurse(obj, prevKey, layer) {
      layer += 1;
      for (const key in obj) {
          let value = obj[key];
          count += 1;
           
          if (key === 'isDir' && value) {
            nodes.forEach(el => {
              if (el.key === prevKey) el.isLeaf = false;
            })
            continue;
          }
          
          const node = {
            title: key,
            prevNode: prevKey, 
            isLeaf: true,
            layer,
            key: count
          };
          
           nodes.push(node)
          
          if (value !== undefined) {
              if (value && typeof value === 'object' && value.isDir) {
                  recurse(value, count, layer);
              }
          }
      }
  }

  recurse(obj, 0, 0);
  
  const treeData = [];
  
  nodes.forEach((item, index) => {
    if (treeData.length === 0) {
      if (item.isLeaf) {
        treeData.push({
          title: item.title,
          key: `${index}`,
          isLeaf: true,
        });
      } else {
        treeData.push({
          title: item.title,
          key: `${index}`,
          children: [],
        });
        expandedKey.push(`${index}`);
      }
    } else {
      recursiveFunction(treeData, item, index, expandedKey);
    }
  })
  
  return { treeData, expandedKey };
}