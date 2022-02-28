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
