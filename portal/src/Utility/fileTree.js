import React from 'react';
import { Popover, Tooltip } from 'antd';
import _ from 'lodash';

export const displayTitle = (title) => {
  if (title.length > 40) {
    return <Tooltip title={title}>{`${title.slice(0, 40)}...`}</Tooltip>;
  } else {
    return title;
  }
};

export const nestedLoop = (obj, zipName) => {
  const nodes = [
    {
      title: displayTitle(zipName),
      isLeaf: false,
      layer: 0,
      key: 0,
    },
  ];

  const expandedKey = [];

  let count = 0;

  function recurse(obj, prevKey, layer) {
    layer += 1;
    for (const key in obj) {
      let value = obj[key];
      count += 1;

      if (key === 'is_dir' && value) {
        nodes.forEach((el) => {
          if (el.key === prevKey) el.isLeaf = false;
        });
        continue;
      }

      const node = {
        title: displayTitle(key),
        prevNode: prevKey,
        isLeaf: true,
        layer,
        key: count,
      };

      nodes.push(node);

      if (value !== undefined) {
        if (value && typeof value === 'object' && value.is_dir) {
          recurse(value, count, layer);
        }
      }
    }
  }

  recurse(obj, 0, 0);
  let map = {},
    node,
    roots = [],
    i;
  for (i = 0; i < nodes.length; i += 1) {
    nodes[i].key = `${nodes[i].key}`;
    if (typeof nodes[i].prevNode !== 'undefined') {
      nodes[i].prevNode = `${nodes[i].prevNode}`;
    }
    map[nodes[i].key] = i; // initialize the map
    nodes[i].children = []; // initialize the children
  }
  for (i = 0; i < nodes.length; i += 1) {
    node = nodes[i];
    if (typeof node.prevNode === 'undefined') {
      continue;
    }
    if (typeof node.prevNode !== 'undefined' && node.prevNode !== '0') {
      nodes[map[node.prevNode]].children.push(node);
      let titileContent = node.title;
      if (node.title && node.title.length > 30) {
        titileContent = (
          <Popover content={node.title}>
            {node.title.substring(0, 20)}...
          </Popover>
        );
        titileContent = node.title;
      }
      if (!node.isLeaf) expandedKey.push(node.key);
    } else {
      roots.push(node);
    }
  }
  return { treeData: roots, expandedKey };
};
