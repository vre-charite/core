import React, { useState, useEffect } from 'react';
import { Modal, Button, Tree, message } from 'antd';
import styles from '../../ExplorerActions.module.scss';
import { ArrowRightOutlined, FolderOutlined } from '@ant-design/icons';
import { useSelector, useDispatch } from 'react-redux';
import { listDatasetFiles, moveDatasetFiles } from '../../../../../../../APIs';
import { MoveStepTwoModal } from './MoveStepTwoModal';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';

export function MoveStepOneModal(props) {
  const { stepOneVisible, setStepOneVisible } = props;
  const [dirData, setDirTree] = useState([]);
  const username = useSelector((state) => state.username);
  const datasetInfo = useSelector((state) => state.datasetInfo.basicInfo);
  const selectedData = useSelector((state) => state.datasetData.selectedData);
  const datasetGeid = datasetInfo.geid;
  const { t } = useTranslation(['errormessages', 'success']);
  const uniqeSelectedData = useSelector(
    (state) => state.datasetData.uniqeSelectedData,
  );
  const [target, setTarget] = useState(null);
  const [stepTwoVisible, setStepTwoVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [ignoreList, setIgnoreList] = useState([]);
  const [processingList, setProcessingList] = useState([]);

  useEffect(() => {
    if (datasetInfo.title) {
      setDirTree([
        {
          globalEntityId: datasetGeid,
          name: datasetInfo.title,
          labels: ['Folder'],
        },
      ]);
    }
  }, [datasetInfo.title]);
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
    return list.map((node) => {
      node.key = node.globalEntityId;
      node.isLeaf = node.labels.indexOf('File') !== -1;
      node.title = titleRender(node.name);
      if (selectedData.indexOf(node.globalEntityId) !== -1) {
        node.disabled = true;
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

  const moveFiles = async () => {
    setSubmitting(true);
    try {
      const res = await moveDatasetFiles(
        datasetGeid,
        uniqeSelectedData,
        target,
        username,
      );
      if (res.data.code === 200) {
        setStepOneVisible(false);
        if (res.data.result.ignored && res.data.result.ignored.length > 0) {
          setStepTwoVisible(true);
          setIgnoreList(res.data.result.ignored);
          setProcessingList(res.data.result.processing);
        } else {
          message.success(t('success:datasetFileMove.default.0'));
        }
      }
    } catch (error) {
    } finally {
      setSubmitting(false);
    }
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
            className={styles['moveto-tree']}
            treeData={treeDataElm}
            loadData={onLoadData}
            selectedKeys={[target]}
            onSelect={onSelect}
          />
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
