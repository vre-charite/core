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

import _ from 'lodash';
import { getFileOperationsApi } from '../../../../../APIs';
import {
  datasetFileOperationsCreators,
  datasetDataActions,
} from '../../../../../Redux/actions';
import { store } from '../../../../../Redux/store';
import { tokenManager } from '../../../../../Service/tokenManager';

/**
 *
 * @param {"move"|"rename"|"delete"|"import"} type
 * @param {string} datasetCode
 * @param {*} dispatch
 */
async function fetchFileOperations(type, datasetCode, dispatch) {
  dispatch(datasetFileOperationsCreators.setLoadingStatus(type, true));
  const operator = store.getState().username;
  const sessionId = tokenManager.getCookie('sessionId');
  try {
    const res = await getFileOperationsApi(
      type,
      datasetCode,
      sessionId,
      operator,
    );
    const result = res.data.result;
    dispatch(datasetFileOperationsCreators[`set${_.capitalize(type)}`](result));
  } catch (err) {
    console.error(err);
  } finally {
    dispatch(datasetFileOperationsCreators.setLoadingStatus(type), false);
  }
}

function onRenameFinish(payload, oldTreeData, dispatch) {
  const newTreeData = _.cloneDeep(oldTreeData);
  const targetNode = findNodeWithGeid(
    { children: newTreeData },
    payload?.source?.globalEntityId,
  );

  if (targetNode) {
    //payload.payload is the new node
    //payload.payload is the old node
    targetNode['name'] = payload.payload.name;
    targetNode['globalEntityId'] = payload.payload.globalEntityId;
    dispatch(datasetDataActions.setTreeData(newTreeData));
  }
}

function onImportFinish(payload, oldTreeData, dispatch) {
  const newTreeData = _.cloneDeep(oldTreeData);
  const newImport = payload?.payload;
  if (!newTreeData.find((x) => x.id === newImport.id)) {
    newTreeData.unshift(newImport);
  }
  dispatch(datasetDataActions.setTreeData(newTreeData));
}

const findNodeWithGeid = (obj, target) => {
  if (!target || !_.isString(target))
    throw new Error('target geid should not be empty');
  if (!obj) return null;

  if (obj.globalEntityId === target) {
    return obj;
  }

  if (!_.isArray(obj.children)) return null;

  for (let i = 0; i < obj.children.length; i++) {
    const child = obj.children[i];
    const childRes = findNodeWithGeid(child, target);
    if (childRes) {
      return childRes;
    }
  }

  return null;
};

const deleteNodeWithGeids = (treeNodes, geids) => {
  return treeNodes
    .map((node) => {
      if (geids.indexOf(node.globalEntityId) !== -1) {
        return null;
      }

      if (node.children) {
        return {
          ...node,
          children: deleteNodeWithGeids(node.children, geids),
        };
      }

      return node;
    })
    .filter((v) => !!v);
};
export {
  fetchFileOperations,
  deleteNodeWithGeids,
  onRenameFinish,
  onImportFinish,
};
