import React, { useEffect } from 'react';
import styles from './ExplorerTree.module.scss';
import { Tree } from 'antd';
import { useSelector, useDispatch } from 'react-redux';
import { EDIT_MODE } from '../../../../../Redux/Reducers/datasetData';
import { datasetDataActions } from '../../../../../Redux/actions';
import ExplorerTreeActionBar from './ExplorerTreeActionBar';
import { listDatasetFiles } from '../../../../../APIs';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { LoadingOutlined } from '@ant-design/icons';
import _ from 'lodash';
import { deleteNodeWithGeids } from '../DatasetDataExplorer/utility';
import { initTree } from './initTree';

const page = 0,
  pageSize = 10000,
  orderBy = 'create_time',
  orderType = 'desc';

export function ExplorerTree(props) {
  const editorMode = useSelector((state) => state.datasetData.mode);
  const hightLighted = useSelector((state) => state.datasetData.hightLighted);
  const selectedData = useSelector((state) => state.datasetData.selectedData);
  const previewNode = useSelector((state) => state.datasetData.previewFile);
  const treeData = useSelector((state) => state.datasetData.treeData);
  const datasetInfo = useSelector((state) => state.datasetInfo.basicInfo);
  const treeKey = useSelector((state) => state.datasetData.treeKey);
  const { delete: deleteOperations, move: moveOperations } = useSelector(
    (state) => state.datasetFileOperations,
  );
  const { treeLoading } = useSelector((state) => state.datasetData);
  const datasetGeid = datasetInfo.geid;

  const dispatch = useDispatch();

  function titleRender(title, nodeKey, isLeaf, fileSize, createBy, labels) {
    return (
      <ExplorerTreeActionBar
        title={title}
        nodeKey={nodeKey}
        isLeaf={isLeaf}
        fileSize={fileSize}
        createBy={createBy}
        labels={labels}
      />
    );
  }

  useEffect(() => {
    const deletingList = deleteOperations.filter(
      (v) => v.status === 'RUNNING' || v.status === 'INIT',
    );
    const moveList = moveOperations.filter(
      (v) => v.status === 'RUNNING' || v.status === 'INIT',
    );
    if (deletingList.length === 0 && moveList.length === 0) {
      dispatch(datasetDataActions.setTreeLoading(false));
    } else {
      dispatch(datasetDataActions.setTreeLoading(true));
    }
  }, [deleteOperations, moveOperations]);
  useEffect(() => {
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
        node.labels,
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
    let newTreeData = deleteNodeWithGeids(_.cloneDeep(treeData), newNodeKeys);
    newTreeData = updateTreeData(newTreeData, key, res?.data?.result?.data);
    dispatch(datasetDataActions.setTreeData(newTreeData));
  }

  const onCheck = (checkedKeysValue, event) => {
    dispatch(datasetDataActions.setSelectedData(checkedKeysValue));
    dispatch(
      datasetDataActions.setSelectedDataPos(event.checkedNodesPositions),
    );
  };
  const onSelect = (selectedKeysValue, _info) => {
    console.log(selectedKeysValue, 'selectedKeyValues');
    if (selectedKeysValue && selectedKeysValue[0]) {
      if (selectedKeysValue[0] !== previewNode.geid) {
        dispatch(datasetDataActions.setPreviewFile({}));
      }
      dispatch(datasetDataActions.setHightLighted(selectedKeysValue[0]));
    } else {
      dispatch(datasetDataActions.setHightLighted(null));
      dispatch(datasetDataActions.setPreviewFile({}));
    }
  };
  const treeDataElm = getTreeDataElm(_.cloneDeep(treeData));

  return treeLoading ? (
    <div className={styles['explorer-tree-loading']}>
      <LoadingOutlined
        style={{
          position: 'absolute',
          top: '30%',
          left: '50%',
          color: '#1890ff',
          transform: 'translate(-50%, -50%)',
        }}
      />
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
              key={treeKey}
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
