import React, { useState, useRef } from 'react';
import { Button } from 'antd';
import { DeploymentUnitOutlined, LeftOutlined } from '@ant-design/icons';
import { TABLE_STATE } from '../../RawTableValues';
import DatasetsModal from './DatasetsModal';

const DatasetsPlugin = ({
  selectedRowKeys,
  clearSelection,
  selectedRows,
  tableState,
  setTableState,
}) => {
  const [dataSetsModalVisible, setDataSetsModalVisible] = useState(false);
  const addToDatasetsBtnRef = useRef(null);
  let leftOffset = 0;

  const foldersPath =
    addToDatasetsBtnRef?.current?.parentNode.querySelectorAll(
      '.ant-breadcrumb',
    );

  if (foldersPath && foldersPath[0] && foldersPath[0].offsetWidth) {
    leftOffset = foldersPath[0].offsetWidth + 40;
  }

  const addToDatasetsToolTips = (
    <div
      style={{
        height: 52,
        position: 'absolute',
        left: leftOffset,
        right: 0,
        top: -11,
        zIndex: 100,
        paddingTop: 15,
        background: 'white',
      }}
    >
      <div
        style={{ display: 'inline-block', color: '#1890ff', cursor: 'pointer' }}
        onClick={(e) => {
          setTableState(TABLE_STATE.NORMAL);
          clearSelection();
        }}
      >
        <LeftOutlined fill="#1890ff" /> <span>Back</span>
      </div>
      <div style={{ marginLeft: 40, display: 'inline-block' }}>
        <span style={{ marginRight: 70 }}>
          {selectedRowKeys && selectedRowKeys.length
            ? `${selectedRowKeys.length} Selected`
            : ''}
        </span>
        <Button
          type="primary"
          ghost
          style={{
            borderRadius: '6px',
            height: '27px',
            width: '165px',
            padding: '0px',
          }}
          onClick={() => setDataSetsModalVisible(true)}
          disabled={selectedRowKeys.length ? false : true}
          icon={<DeploymentUnitOutlined />}
        >
          Add to Datasets
        </Button>
      </div>
    </div>
  );

  return (
    <>
      <Button
        type="link"
        onClick={() => {
          setTableState(TABLE_STATE.ADD_TO_DATASETS);
        }}
        icon={<DeploymentUnitOutlined />}
        style={{ marginRight: 8 }}
        ref={addToDatasetsBtnRef}
      >
        Add to Datasets
      </Button>
      {tableState === TABLE_STATE.ADD_TO_DATASETS
        ? addToDatasetsToolTips
        : null}
      <DatasetsModal
        visible={dataSetsModalVisible}
        setVisible={setDataSetsModalVisible}
        selectedRows={selectedRows}
      />
    </>
  );
};

export default DatasetsPlugin;
