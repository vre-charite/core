import React, { useState, useEffect } from 'react';
import styles from './ExplorerTree.module.scss';
import { Skeleton, Tree } from 'antd';
import { useSelector, useDispatch } from 'react-redux';
import { EDIT_MODE } from '../../../../../Redux/Reducers/datasetData';
import { datasetDataActions } from '../../../../../Redux/actions';
import ExplorerTreeActionBar from './ExplorerTreeActionBar';
import { listDatasetFiles } from '../../../../../APIs';
import { QuestionCircleOutlined } from '@ant-design/icons';
import _ from 'lodash';
export function ExplorerTree(props) {
  const editorMode = useSelector((state) => state.datasetData.mode);
  const hightLighted = useSelector((state) => state.datasetData.hightLighted);
  const selectedData = useSelector((state) => state.datasetData.selectedData);
  const treeData = useSelector((state) => state.datasetData.treeData);
  const datasetInfo = useSelector((state) => state.datasetInfo.basicInfo);
  const [initLoading, setInitLoading] = useState(true);
  const datasetGeid = datasetInfo.geid;
  const page = 0,
    pageSize = 10000,
    orderBy = 'create_time',
    orderType = 'desc';
  const dispatch = useDispatch();

  function titleRender(title, nodeKey, isLeaf, fileSize, createBy) {
    return (
      <ExplorerTreeActionBar
        title={title}
        nodeKey={nodeKey}
        isLeaf={isLeaf}
        fileSize={fileSize}
        createBy={createBy}
      />
    );
  }

  useEffect(() => {
    async function initTree() {
      const res = await listDatasetFiles(
        datasetGeid,
        null,
        page,
        pageSize,
        orderBy,
        orderType,
        {},
      );
      dispatch(datasetDataActions.setTreeData(res?.data?.result?.data));
      setInitLoading(false);
    }
    if (datasetGeid) {
      initTree();
    }
  }, [datasetGeid]);

  function updateTreeData(list, key, children) {
    return list.map((node) => {
      if (node.globalEntityId === key) {
        return { ...node, children };
      }

      if (node.children) {
        return {
          ...node,
          children: updateTreeData(node.children, key, children),
        };
      }

      return node;
    });
  }
  function deleteTreeNode(treeNodes, newNodeKeys) {
    return treeNodes
      .map((node) => {
        if (newNodeKeys.indexOf(node.globalEntityId) !== -1) {
          return null;
        }

        if (node.children) {
          return {
            ...node,
            children: deleteTreeNode(node.children, newNodeKeys),
          };
        }

        return node;
      })
      .filter((v) => !!v);
  }
  function getTreeDataElm(list) {
    return list.map((node) => {
      node.key = node.globalEntityId;
      node.isLeaf = node.labels.indexOf('File') !== -1;
      node.title = titleRender(
        node.name,
        node.key,
        node.isLeaf,
        node.fileSize,
        node.createBy ? node.createBy : node.operator,
      );
      if (node.children) {
        return {
          ...node,
          children: getTreeDataElm(node.children),
        };
      }

      return node;
    });
  }
  async function onLoadData({ key }) {
    const res = await listDatasetFiles(
      datasetGeid,
      key,
      page,
      pageSize,
      orderBy,
      orderType,
      {},
    );
    const newNodeKeys = res?.data?.result?.data.map((v) => v.globalEntityId);
    let newTreeData = deleteTreeNode(_.cloneDeep(treeData), newNodeKeys);
    newTreeData = updateTreeData(newTreeData, key, res?.data?.result?.data);
    dispatch(datasetDataActions.setTreeData(newTreeData));
  }
  function getUniqSelNodes(selNodesPos) {
    const originalNodes = _.cloneDeep(selNodesPos);
    const uniqeNodes = selNodesPos.filter((nodePos) => {
      const paths = nodePos.pos.split('-');
      while (paths.length) {
        paths.pop();
        const pathStr = paths.join('-');
        for (let i = 0; i < originalNodes.length; i++) {
          if (originalNodes[i].pos === pathStr) {
            return false;
          }
        }
      }
      return true;
    });
    return uniqeNodes;
  }
  const onCheck = (checkedKeysValue, event) => {
    const uniqeNodes = getUniqSelNodes(event.checkedNodesPositions);
    dispatch(datasetDataActions.setSelectedData(checkedKeysValue));
    const uniqeSelectedData = uniqeNodes.map((v) => v.node.globalEntityId);
    dispatch(datasetDataActions.setUniqeSelectedData(uniqeSelectedData));
  };
  const onSelect = (selectedKeysValue, _info) => {
    if (selectedKeysValue && selectedKeysValue[0]) {
      dispatch(datasetDataActions.setHightLighted(selectedKeysValue[0]));
    } else {
      dispatch(datasetDataActions.setHightLighted(null));
    }
  };
  const treeDataElm = getTreeDataElm(_.cloneDeep(treeData));
  return initLoading ? (
    <div className={styles['explorer-tree-loading']}>
      <Skeleton loading={initLoading}></Skeleton>
    </div>
  ) : treeData && treeData.length ? (
    <>
      <div className={styles['explorer-tree-wrapper']}>
        <div className={editorMode}>
          <h2 className={styles['project_name']}>{datasetInfo.title}</h2>
          {treeDataElm && (
            <Tree
              checkable={editorMode !== EDIT_MODE.EIDT_INDIVIDUAL}
              loadData={onLoadData}
              treeData={treeDataElm}
              onCheck={onCheck}
              checkedKeys={selectedData}
              onSelect={onSelect}
              selectedKeys={[hightLighted]}
            />
          )}
        </div>
      </div>
    </>
  ) : (
    <div className={styles['explorer-tree-nodata']}>
      <div className="no-data-area">
        <QuestionCircleOutlined />
        <h2>Data can only be added through projects</h2>
      </div>
    </div>
  );
}
