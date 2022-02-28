import React, { useState, useEffect } from 'react';
import { Modal, Button, Tree, message, Checkbox } from 'antd';
import styles from '../../ExplorerActions.module.scss';
import { ArrowRightOutlined, FolderOutlined } from '@ant-design/icons';
import { useSelector, useDispatch } from 'react-redux';
import {
  datasetDataActions,
  //datasetInfoCreators,
} from '../../../../../../../Redux/actions';
import { listDatasetFiles, moveDatasetFiles } from '../../../../../../../APIs';
import { MoveStepTwoModal } from './MoveStepTwoModal';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';

export function MoveStepOneModal(props) {
  const { stepOneVisible, setStepOneVisible } = props;
  const [dirData, setDirTree] = useState([]);
  // const [moveFileTimes, setMoveFileTimes] = useState(0);
  const username = useSelector((state) => state.username);
  const datasetInfo = useSelector((state) => state.datasetInfo.basicInfo);
  const selectedData = useSelector((state) => state.datasetData.selectedData);
  const datasetGeid = datasetInfo.geid;
  const { t } = useTranslation(['errormessages', 'success']);
  const selectedDataPos = useSelector(
    (state) => state.datasetData.selectedDataPos,
  );
  const [target, setTarget] = useState(null);
  const [stepTwoVisible, setStepTwoVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [ignoreList, setIgnoreList] = useState([]);
  const [processingList, setProcessingList] = useState([]);
  const [treeKey, setTreeKey] = useState(1);
  const dispatch = useDispatch();
  const [ambiDest, setAmbiDest] = useState([]);
  useEffect(() => {
    if (stepOneVisible) {
      if (datasetInfo.title) {
        setDirTree([
          {
            globalEntityId: datasetGeid,
            name: datasetInfo.title,
            labels: ['Folder'],
          },
        ]);
        setTreeKey(treeKey + 1);
      }
    } else {
      setDirTree([]);
      setTarget(null);
      setIgnoreList([]);
      setProcessingList([]);
      setTreeKey(treeKey + 1);
    }
  }, [stepOneVisible, datasetInfo.title]);
  const page = 0,
    pageSize = 10000,
    orderBy = 'create_time',
    orderType = 'desc';

  const titleRender = (title) => {
    return (
      <div className="moveto-custom-title">
        <FolderOutlined className="node-icon" />
        <span className="node-name">{title}</span>
      </div>
    );
  };

  const getTreeDataElm = (list) => {
    const ambiNodeGeids = ambiDest.map(
      (ambiNode) => ambiNode.node.globalEntityId,
    );
    return list.map((node) => {
      node.key = node.globalEntityId;
      node.isLeaf = node.labels.indexOf('File') !== -1;
      node.title = titleRender(node.name);
      if (
        selectedData.indexOf(node.globalEntityId) !== -1 ||
        ambiNodeGeids.indexOf(node.globalEntityId) !== -1
      ) {
        node.disabled = true;
        node.isLeaf = true;
      }
      if (node.children) {
        return {
          ...node,
          children: getTreeDataElm(node.children),
        };
      }

      return node;
    });
  };

  const updateTreeData = (list, key, children) => {
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
  };

  const onLoadData = async ({ key }) => {
    const res = await listDatasetFiles(
      datasetGeid,
      key === datasetGeid ? null : key,
      page,
      pageSize,
      orderBy,
      orderType,
      {},
    );
    const newDirData = updateTreeData(
      _.cloneDeep(dirData),
      key,
      res?.data?.result?.data.filter((f) => f.labels.indexOf('Folder') !== -1),
    );
    setDirTree(newDirData);
  };

  const onSelect = (selectedKeysValue, _info) => {
    if (selectedKeysValue && selectedKeysValue[0]) {
      setTarget(selectedKeysValue[0]);
    } else {
      setTarget(null);
    }
  };
  function getAmbiNodes(selNodesPos) {
    const originalNodes = _.cloneDeep(selNodesPos);
    const parentNodes = selNodesPos.filter((nodePos) => {
      for (let i = 0; i < originalNodes.length; i++) {
        if (nodePos.pos.startsWith(originalNodes[i].pos + '-')) {
          return false;
        }
      }
      for (let i = 0; i < originalNodes.length; i++) {
        if (originalNodes[i].pos.startsWith(nodePos.pos + '-')) {
          return true;
        }
      }
      return false;
    });
    return parentNodes;
  }
  const trimSelectedNode = () => {
    const clonedNodePos = _.cloneDeep(selectedDataPos);
    const nodePaths = clonedNodePos.map((v) => v.pos);
    const parentNodes = clonedNodePos.filter((nodePos) => {
      for (let i = 0; i < ambiDest.length; i++) {
        if (ambiDest[i].pos === nodePos.pos) {
          return ambiDest[i].node.checked;
        }
      }
      const paths = nodePos.pos.split('-');
      while (paths.length) {
        paths.pop();
        const pathStr = paths.join('-');
        for (let i = 0; i < ambiDest.length; i++) {
          if (ambiDest[i].pos === pathStr) {
            // found parent Node
            if (ambiDest[i].node.checked) {
              return false;
            } else {
              const childrenSel = nodePaths.find((pathItem) =>
                pathItem.startsWith(nodePos.pos + '-'),
              );
              if (childrenSel) {
                return false;
              } else {
                return true;
              }
            }
          }
        }
      }
      return true;
    });
    return parentNodes;
  };
  const moveFiles = async () => {
    setSubmitting(true);
    const trimedSel = trimSelectedNode();
    try {
      const res = await moveDatasetFiles(
        datasetGeid,
        trimedSel.map((v) => v.node.globalEntityId),
        target,
        username,
      );
      if (res.data.code === 200) {
        setStepOneVisible(false);
        /* dispatch(datasetInfoCreators.setDatasetFilesMoveTimes(moveFileTimes + 1));
        setMoveFileTimes((prevs) => prevs + 1); */
        if (res.data.result.ignored && res.data.result.ignored.length > 0) {
          setStepTwoVisible(true);
          setIgnoreList(res.data.result.ignored);
          setProcessingList(res.data.result.processing);
        } else {
          message.success(t('success:datasetFileMove.default.0'));
        }
        setAmbiDest([]);
      }
    } catch (error) {
    } finally {
      setSubmitting(false);
    }
  };
  useEffect(() => {
    if (stepOneVisible) {
      const parNodes = getAmbiNodes(selectedDataPos);
      setAmbiDest(
        parNodes.map((v) => {
          v.node.checked = false;
          return v;
        }),
      );
    } else {
    }
    dispatch(datasetDataActions.setSelectedData([]));
  }, [stepOneVisible]);
  const selectDestNode = function (destItem, checked) {
    const newAmbiDest = _.cloneDeep(ambiDest).map((itemInList) => {
      if (itemInList.node.globalEntityId === destItem.node.globalEntityId) {
        itemInList.node.checked = checked;
      }
      return itemInList;
    });
    setAmbiDest(newAmbiDest);
  };
  const treeDataElm = getTreeDataElm(_.cloneDeep(dirData));
  return (
    <>
      <Modal
        width={385}
        className={styles['moveto-tree-modal']}
        title="Move To"
        visible={stepOneVisible}
        cancelButtonProps={{ style: { display: 'none' } }}
        okButtonProps={{ style: { display: 'none' } }}
        footer={
          <div className={styles['moveto-tree-footer']}>
            <Button
              className="footer-cancel"
              type="link"
              onClick={() => {
                setStepOneVisible(false);
              }}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              className="footer-ok"
              type="primary"
              disabled={!target}
              icon={<ArrowRightOutlined />}
              onClick={() => {
                moveFiles();
              }}
              loading={submitting}
            >
              Move to
            </Button>
          </div>
        }
        onCancel={() => {
          setStepOneVisible(false);
        }}
      >
        <div className={styles['moveto-tree-wrapper']}>
          <Tree
            key={treeKey}
            className={styles['moveto-tree']}
            treeData={treeDataElm}
            loadData={onLoadData}
            selectedKeys={[target]}
            onSelect={onSelect}
          />
          {ambiDest && ambiDest.length ? (
            <div className="ambiguous-dest-part">
              <h4>Would you like to transfer these folders as well?</h4>
              {ambiDest.map((destItem) => (
                <div class="folder-option">
                  <Checkbox
                    onChange={(e) => {
                      selectDestNode(destItem, e.target.checked);
                    }}
                  >
                    {destItem.node.name}
                  </Checkbox>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </Modal>
      <MoveStepTwoModal
        stepTwoVisible={stepTwoVisible}
        setStepTwoVisible={setStepTwoVisible}
        ignoreList={ignoreList}
        processingList={processingList}
      />
    </>
  );
}
