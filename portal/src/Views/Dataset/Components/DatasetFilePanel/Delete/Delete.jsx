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

import React, { useEffect, useCallback } from 'react';
import { List } from 'antd';
import { FilePanelItem } from '../../FilePanelItem/FilePanelItem';
import { DeleteOutlined } from '@ant-design/icons';
import { countStatus, parsePath, fetchFileOperations } from '../utility';
import { useSelector, useDispatch } from 'react-redux';

export function Delete(props) {
  const { geid } = props;
  const { delete: deleteOperations } = useSelector(
    (state) => state.datasetFileOperations,
  );

  const dispatch = useCallback(useDispatch(), []);

  useEffect(() => {
    fetchFileOperations('delete', geid, dispatch);
  }, [geid, dispatch]);

  const [runningCount, errorCount, finishCount, initCount, cancelCount] =
    countStatus(deleteOperations);

  return (
    <>
      <div className={'list-header'}>
        {' '}
        {initCount} waiting, {runningCount} running, {errorCount} error,{' '}
        {finishCount} finish, {cancelCount} cancelled
      </div>
      <List
        dataSource={deleteOperations}
        renderItem={(record, index) => {
          const itemProps = {
            originalFullPath: parsePath(record.payload),
            status: record.status,
            icon: <DeleteOutlined />,
          };
          return <FilePanelItem {...itemProps} />;
        }}
      ></List>
    </>
  );
}
