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
import { ExplorerActions } from '../ExplorerActions/ExplorerActions';
import { ExplorerTree } from '../ExplorerTree/ExplorerTree';
import { DatasetCard as Card } from '../../../Components/DatasetCard/DatasetCard';
import styles from './DatasetDataExplorer.module.scss';
import { io } from 'socket.io-client';
import {
  fetchFileOperations,
  onImportFinish,
  onRenameFinish,
  deleteNodeWithGeids,
} from './utility';
import _ from 'lodash';
import { useSelector, useDispatch } from 'react-redux';
import { useParams } from 'react-router';
import { objectKeysToCamelCase } from '../../../../../Utility';
import { store } from '../../../../../Redux/store';
import { datasetDataActions } from '../../../../../Redux/actions';
import { initTree } from '../ExplorerTree/initTree';
import { DOMAIN_DEV, DOMAIN_PROD, DOMAIN_STAGING } from '../../../../../config';

export default function DatasetDataExplorer(props) {
  const dispatch = useDispatch();

  const fetchFileOperationsThrottled = useCallback(
    _.throttle(fetchFileOperations, 5 * 1000, {
      leading: true,
      trailing: true,
    }),
    [],
  );

  const basicInfo = useSelector((state) => state.datasetInfo?.basicInfo);
  const geid = basicInfo.geid;

  const onDeleteFinish = (payload, treeData) => {
    let newTreeData = _.cloneDeep(treeData);
    if (newTreeData && payload?.source?.globalEntityId) {
      newTreeData = deleteNodeWithGeids(newTreeData, [
        payload?.source?.globalEntityId,
      ]);
      dispatch(datasetDataActions.setTreeData(newTreeData));
    }
  };

  let socketIoUrl = '';
  switch (process.env['REACT_APP_ENV']) {
    case 'dev':
      socketIoUrl = 'ws://' + DOMAIN_DEV;
      break;
    case 'staging':
      socketIoUrl = 'wss://' + DOMAIN_STAGING;
      break;
    case 'production':
      socketIoUrl = 'wss://' + DOMAIN_PROD;
      break;
    default:
      socketIoUrl = 'ws://' + DOMAIN_DEV;
      break;
  }

  useEffect(() => {
    if (geid) {
      const socket = io(`${socketIoUrl}/${geid}`);
      socket.on('DATASET_FILE_NOTIFICATION', (data) => {
        console.log(data);
        const { payload } = objectKeysToCamelCase(data);
        const actionType = _.replace(payload.action, 'dataset_file_', '');
        const { treeData } = store.getState().datasetData;
        if (payload.status === 'FINISH') {
          switch (actionType) {
            case 'import': {
              onImportFinish(payload, treeData, dispatch);
              break;
            }
            case 'rename': {
              onRenameFinish(payload, treeData, dispatch);
              break;
            }
            case 'delete': {
              onDeleteFinish(payload, treeData);
              break;
            }
            case 'move': {
              initTree();
              break;
            }
            default: {
            }
          }
        }

        fetchFileOperationsThrottled(actionType, geid, dispatch);
      });
      return () => {
        socket.close();
      };
    }
  }, [geid, dispatch, geid, fetchFileOperationsThrottled]);

  return (
    <Card className={styles['card']} title="Explorer">
      <ExplorerActions />
      <ExplorerTree />
    </Card>
  );
}
