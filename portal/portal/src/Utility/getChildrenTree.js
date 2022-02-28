import React from 'react';
import { FolderOpenOutlined, ContainerOutlined } from '@ant-design/icons';

/**
 * create the tree data structure for the tree component
 *
 * @param {*} data
 * @param {number/string} [layer=0] used as key
 * @param {*} path
 * @returns
 */
const getChildrenTree = (data, layer = 0, path) => {
  if (!data || data.length === 0) {
    /* return [
      {
        title: "New",
        icon: <PlusOutlined />,
        key: `${layer}-${path}-add`,
        id: -1,
        parentPath: path,
        type: "add",
      },
    ]; */
  } else {
    const res = data
      .filter((item) => typeof item !== 'string')
      .map((d) => ({
        title: Object.keys(d)[0],
        key: `${layer}-${Object.keys(d)[0]}`,
        id: Object.keys(d)[0],
        path: path + '/' + Object.keys(d)[0],
        icon: <ContainerOutlined /> && <FolderOpenOutlined />,
        children: getChildrenTree(
          d[Object.keys(d)[0]],
          layer + `-${Object.keys(d)[0]}`,
          path + '/' + Object.keys(d)[0],
        ),
        type: 'folder',
      }));
    /*  const newItem = {
      title: "New",
      icon: <PlusOutlined />,
      key: `${layer}-${path}-add`,
      id: path,
      parentPath: path,
      type: "add",
    };
    return [...res, newItem]; */
    return res;
  }
};

export default getChildrenTree;
