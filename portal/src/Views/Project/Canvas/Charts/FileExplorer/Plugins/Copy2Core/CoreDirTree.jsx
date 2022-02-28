import React, { useState } from 'react';
import { Tree, Tooltip } from 'antd';
import styles from './index.module.scss';
import { getFiles } from '../../../../../../../APIs';
import { useCurrentProject } from '../../../../../../../Utility';
import { useSelector } from 'react-redux';
import {
  CloudServerOutlined,
  FolderOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { PanelKey } from '../../RawTableValues';

const { DirectoryTree } = Tree;
const LOAD_MORE_TEXT = '...';
function CoreDirTree(props) {
  const [currentDataset] = useCurrentProject();
  const [treeData, setTreeData] = useState([
    {
      title: 'Core',
      key: currentDataset.globalEntityId,
      icon: <CloudServerOutlined />,
      children: [],
    },
  ]);

  const username = useSelector((state) => state.username);

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

  function getTitle(name) {
    if (name.length > 30) {
      return <Tooltip title={name}>{name.slice(0, 30)}....</Tooltip>;
    } else {
      return name;
    }
  }

  async function onSelect(selectedKeys, info) {
    const isHome = info.node.key.startsWith(currentDataset.globalEntityId);
    const foundTreeNodePath = getNodePath(treeData[0], info.node.key);

    if (foundTreeNodePath.length === 0) {
      props.setStep2SelectDisabled(true);
    } else {
      props.setStep2SelectDisabled(false);
    }

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
      foundTreeNodePath.length === 1 && foundTreeNodePath[0].title === username
        ? null
        : targetGeid,
      page,
      PAGE_SIZE,
      'name',
      'asc',
      { archived: false },
      'Core',
      isHome ? 'Project' : 'Folder',
      null,
      PanelKey.CORE_HOME,
      currentDataset.globalEntityId,
    );
    folders = res.data.result.data.filter(
      (v) => v.labels.indexOf('Folder') !== -1,
    );
    folders = folders.map((v) => {
      return {
        title: getTitle(v.name),
        key: v.globalEntityId,
        // when click on "Core" or "...", all subfolders should show user icon.
        icon:
          foundTreeNodePath.length === 0 ||
          foundTreeNodePath[0].title === LOAD_MORE_TEXT ? (
            <UserOutlined />
          ) : (
            <FolderOutlined />
          ),
        children: [],
      };
    });
    if (folders.length && folders.length === PAGE_SIZE) {
      folders = folders.concat([
        {
          title: LOAD_MORE_TEXT,
          key: `${targetGeid}/${page + 1}`,
          icon: <UserOutlined />,
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
