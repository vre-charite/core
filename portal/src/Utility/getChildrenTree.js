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
