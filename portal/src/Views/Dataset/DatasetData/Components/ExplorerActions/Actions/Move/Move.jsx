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

import React, { useState, useEffect } from 'react';
import { Button } from 'antd';
import { SwapOutlined } from '@ant-design/icons';
import { useSelector, useDispatch } from 'react-redux';
import styles from '../../ExplorerActions.module.scss';
import { EDIT_MODE } from '../../../../../../../Redux/Reducers/datasetData';
import { MoveStepOneModal } from './MoveStepOneModal';

export function Move() {
  const editorMode = useSelector((state) => state.datasetData.mode);
  const selectedData = useSelector((state) => state.datasetData.selectedData);
  const datasetInfo = useSelector((state) => state.datasetInfo.basicInfo);
  const moveCondition =
    selectedData.length !== 0 &&
    editorMode !== EDIT_MODE.EIDT_INDIVIDUAL &&
    !datasetInfo.bidsLoading;
  const [stepOneVisible, setStepOneVisible] = useState(false);

  return (
    <>
      <Button
        disabled={!moveCondition}
        className={ moveCondition && styles['button-enable'] }
        type="link"
        onClick={() => {
          setStepOneVisible(true);
        }}
        icon={<SwapOutlined />}
      >
        Move to
      </Button>
      <MoveStepOneModal
        stepOneVisible={stepOneVisible}
        setStepOneVisible={setStepOneVisible}
      />
    </>
  );
}
