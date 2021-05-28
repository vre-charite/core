import React, { useState } from 'react';
import { Tree } from 'antd';
import styles from './index.module.scss';
import { getFiles } from '../../../../../../../APIs';
import { useCurrentProject } from '../../../../../../../Utility';
import { CloudServerOutlined, FolderOutlined } from '@ant-design/icons';

const { DirectoryTree } = Tree;
const LOAD_MORE_TEXT = '...';
function CoreDirTree(props) {
  const [currentDataset] = useCurrentProject();
  const [treeData, setTreeData] = useState([
    {
      title: 'Core > Home',
      key: currentDataset.globalEntityId,
      icon: <CloudServerOutlined />,
      children: [],
    },
  ]);
  function addTreeChildren(list, key, children) {
    return list.map((node) => {
      if (node.key === key) {
        if (node.children[node.children.length - 1]?.title === LOAD_MORE_TEXT) {
          node.children = node.children.slice(0, node.children.length - 1);
        }
        return { ...node, children: node.children.concat(children) };
      }

      if (node.children) {
        return {
          ...node,
          children: addTreeChildren(node.children, key, children),
        };
      }

      return node;
    });
  }
  function getNodePath(element, key) {
    if (element.key == key) {
      return [];
    } else if (element.children != null) {
      var i;
      var result = null;
      for (i = 0; result == null && i < element.children.length; i++) {
        let path = getNodePath(element.children[i], key);
        if (path !== null) {
          path.unshift({
            title: element.children[i].title,
            key: element.children[i].key,
          });
          return path;
        }
      }
    }
    return null;
  }
  async function onSelect(selectedKeys, info) {
    const isHome = info.node.key.startsWith(currentDataset.globalEntityId);
    const foundTreeNodePath = getNodePath(treeData[0], info.node.key);
    if (info.node.title === LOAD_MORE_TEXT) {
      props.setDestination(null);
    } else {
      props.setDestination({
        routes: foundTreeNodePath,
        geid: isHome ? null : info.node.key,
      });
      props.setValidateDestination(false);
    }

    if (info.node.expanded) {
      return;
    }
    // must be first time open || click "..." to load more
    if (info.node.children.length !== 0) {
      return;
    }
    let folders;
    let targetGeid;
    const PAGE_SIZE = 10;
    const page =
      info.node.key.indexOf('/') == -1
        ? 0
        : Number(info.node.key.split('/')[1]);
    if (isHome) {
      targetGeid = currentDataset.globalEntityId;
    } else {
      targetGeid =
        info.node.key.indexOf('/') == -1
          ? info.node.key
          : info.node.key.split('/')[0];
    }
    const res = await getFiles(
      targetGeid,
      page,
      PAGE_SIZE,
      'time_created',
      'desc',
      { archived: false },
      'VRECore',
      isHome ? 'Project' : 'Folder',
      null,
      false,
    );
    folders = res.data.result.data.filter(
      (v) => v.labels.indexOf('Folder') !== -1,
    );
    folders = folders.map((v) => {
      return {
        title: v.name,
        key: v.globalEntityId,
        icon: <FolderOutlined />,
        children: [],
      };
    });
    if (folders.length && folders.length === PAGE_SIZE) {
      folders = folders.concat([
        {
          title: LOAD_MORE_TEXT,
          key: `${targetGeid}/${page + 1}`,
          children: [],
        },
      ]);
    }
    setTreeData((origin) => addTreeChildren(origin, targetGeid, folders));
  }
  return (
    <DirectoryTree
      className={styles.copy_to_core_tree}
      multiple
      onSelect={onSelect}
      treeData={treeData}
    />
  );
}
export default CoreDirTree;
