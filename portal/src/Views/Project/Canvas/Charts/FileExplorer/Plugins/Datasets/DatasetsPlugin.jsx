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
