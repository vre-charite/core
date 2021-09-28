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
      socketIoUrl = 'ws://10.3.7.220';
      break;
    case 'staging':
      socketIoUrl = 'wss://vre-staging.indocresearch.org';
      break;
    case 'charite':
      socketIoUrl = 'wss://vre.charite.de';
      break;
    default:
      socketIoUrl = 'ws://10.3.7.220';
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
