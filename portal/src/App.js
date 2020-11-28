import React, { useEffect, useState, Suspense } from 'react';
import {
  Switch,
  Route,
  Redirect,
  useParams,
  withRouter,
} from 'react-router-dom';
import { authedRoutes, unAuthedRoutes } from './Routes';
import './App.css';
import { useSelector, useDispatch } from 'react-redux';
import {
  AddDatasetCreator,
  setContainersPermissionCreator,
  setUserRoleCreator,
  updateUploadItemCreator,
  removeDownloadListCreator,
  updateClearIdCreator,
  setSuccessNum,
  setDonwloadClearIdCreator,
  setUploadListCreator,
  updateDownloadItemCreator,
  setDownloadListCreator,
} from './Redux/actions';
import {
  getDatasetsAPI,
  listAllContainersPermission,
  checkPendingStatusAPI,
  checkDownloadStatusAPI,
  checkUploadStatus,
  checkDownloadStatus,
} from './APIs';
import { protectedRoutes, reduxActionWrapper } from './Utility';
import { message, Modal } from 'antd';
import Promise from 'bluebird';
import _ from 'lodash';
import RefreshModal from './Components/Modals/RefreshModal';
import { namespace, ErrorMessager } from './ErrorMessages';
import { v4 as uuidv4 } from 'uuid';
import { history } from './Routes';
import { tokenManager } from './Service/tokenManager';
import { userAuthManager } from './Service/userAuthManager';

// router change
history.listen(() => {
  Modal.destroyAll();
});
let clearIds = [];
message.config({
  maxCount: 2,
  duration: 5,
});
const [
  AddDatasetDispatcher,
  setContainersPermissionDispatcher,
  setUserRoleDispatcher,
  updateUploadItemDispatcher,
  updateClearIdDispatcher,
  removeDownloadListDispatcher,
  setDonwloadClearIdDispatcher,
  setUploadListDispatcher,
  setSuccessNumDispatcher,
  setDownloadListDispatcher,
  updateDownloadItemDispatch,
] = reduxActionWrapper([
  AddDatasetCreator,
  setContainersPermissionCreator,
  setUserRoleCreator,
  updateUploadItemCreator,
  updateClearIdCreator,
  removeDownloadListCreator,
  setDonwloadClearIdCreator,
  setUploadListCreator,
  setSuccessNum,
  setDownloadListCreator,
  updateDownloadItemCreator,
]);

function App() {
  const {
    uploadList,
    downloadList,
    clearId,
    username,
    datasetList,
    isLogin,
    downloadClearId,
    successNum,
  } = useSelector((state) => state);

  const dispatch = useDispatch();
  const sessionId = localStorage.getItem('sessionId');

  useEffect(() => {
    userAuthManager.init();
    if (!tokenManager.checkTokenUnExpiration()) {
      return;
    }
    initApis();
  }, []);

  useEffect(() => {
    debouncedUpdatePendingStatus(uploadList);
    //updatePendingStatus(uploadList);
    setRefreshConfirmation(
      uploadList.filter((item) => item.status === 'uploading'),
    );
  }, [uploadList]);

  useEffect(() => {
    const pendingDownloadList = downloadList.filter(
      (el) => el.status === 'pending',
    );
    updateDownloadStatus(pendingDownloadList);
    setRefreshConfirmation(pendingDownloadList);
  }, [downloadList]);

  const initApis = async () => {
    try {
      const res = await getDatasetsAPI({ type: 'usecase' });
      AddDatasetDispatcher(res.data.result, 'All Use Cases');
    } catch (err) {
      const errorMessager = new ErrorMessager(namespace.common.getDataset);
      errorMessager.triggerMsg(err.response && err.response.status);
    }
    try {
      const {
        data: { result: containersPermission },
      } = await listAllContainersPermission(username);

      setContainersPermissionDispatcher(containersPermission.permission);
      setUserRoleDispatcher(containersPermission.role);

      const res = await checkUploadStatus(0, sessionId);
      const { code, result } = res.data;

      if (code === 200) {
        const uploadList = [];
        for (const item of result) {
          if (['TERMINATED', 'SUCCEED'].includes(item.state)) {
            uploadList.push({
              fileName: item.fileName,
              status: item.state === 'SUCCEED' ? 'success' : 'error',
              progress: 1,
              uploadedTime: item.startTimestamp,
              projectCode: item.projectCode,
            });
          }
        }
        setUploadListDispatcher(uploadList);
      }

      const downloadRes = await checkDownloadStatus(sessionId);
      if (downloadRes.status === 200) {
        const downloadList = downloadRes.data && downloadRes.data.result;
        setDownloadListDispatcher(downloadList);
      }
    } catch (err) {
      if (err.response) {
        const errorMessager = new ErrorMessager(
          namespace.common.listAllContainersPermission,
        );
        errorMessager.triggerMsg(err.response.status);
      }
    }
  };

  const updatePendingStatus = (arr) => {
    tokenManager.removeListener(clearId);
    //const {clearId} = store.getState();
    tokenManager.removeListener(clearId);
    const pendingArr = arr.filter((item) => item.status === 'pending');
    if (pendingArr.length === 0) {
      //make sure clear all interval ids
      return;
    }

    const time = 4;
    const func = () => {
      Promise.map(pendingArr, (item, index) => {
        checkUploadStatus(item.projectId, sessionId)
          .then((res) => {
            const { code, result } = res.data;
            if (code === 200) {
              let fileName = item.fileName;

              if (item.generateID) fileName = `${item.generateID}_${fileName}`;

              const isSuccess =
                result &&
                result.some(
                  (el) => el.taskId === item.taskId && el.state === 'SUCCEED',
                );

              if (isSuccess) {
                item.status = 'success';
                dispatch(setSuccessNum(successNum + 1));
              }
              updateUploadItemDispatcher(item);
            }
          })
          .catch((err) => {
            if (err.response && parseInt(err.response.status) !== 404) {
              console.log(err.response, 'error response in checking pending');
            }
          });
      });
    };
    const condition = (timeRemain, time) => {
      return timeRemain % time === 0;
    };
    const newClearId = tokenManager.addListener({ time, func, condition });
    console.log(`add id ${newClearId}`);
    updateClearIdDispatcher(newClearId);
  };

  const updateDownloadStatus = (arr) => {
    tokenManager.removeListener(downloadClearId);
    const time = 4;
    const condition = (timeRemain, time) => {
      return timeRemain % time === 0;
    };
    const func = () => {
      Promise.map(arr, (item, index) => {
        if (item.status === 'pending') {
          checkDownloadStatusAPI(
            item.projectId,
            item.downloadKey,
            updateDownloadItemDispatch,
            setSuccessNumDispatcher,
            successNum,
          );
        }
      });
    };
    const newDownloadClearId = tokenManager.addListener({
      time,
      condition,
      func,
    });

    setDonwloadClearIdDispatcher(newDownloadClearId);
  };

  const setRefreshConfirmation = (arr) => {
    const confirmation = function (event) {
      return window.confirm(
        'You will loss your uploading progress. Are you sure to exit?',
      );
    };
    if (arr.length > 0) {
      window.onbeforeunload = confirmation;
    } else {
      window.onbeforeunload = () => {};
    }
  };

  const debouncedUpdatePendingStatus = _.debounce(updatePendingStatus, 5000, {
    leading: true,
    trailing: true,
    maxWait: 15 * 1000,
  });

  return (
    <>
      <Suspense fallback={null}>
        <Switch>
          {authedRoutes.map((item) => (
            <Route
              path={item.path}
              key={item.path}
              exact={item.exact || false}
              render={(props) => {
                let res = protectedRoutes(
                  item.protectedType,
                  isLogin,
                  props.match.params.datasetId,
                  null,
                  datasetList,
                );
                if (res === '403') {
                  return <Redirect to="/error/403" />;
                } else if (res === '404') {
                  return <Redirect to="/error/404" />;
                } else if (res) {
                  return <item.component />;
                } else {
                  return <Redirect to="/" />;
                }
              }}
            ></Route>
          ))}
          {unAuthedRoutes.map((item) => (
            <Route
              path={item.path}
              key={item.path}
              exact={item.exact || false}
              //component={item.component}
              render={(props) => {
                return protectedRoutes(
                  item.protectedType,
                  isLogin,
                  props.match.params.datasetId,
                  null,
                  datasetList,
                ) ? (
                  <item.component />
                ) : (
                  <Redirect to="/landing" />
                );
              }}
            ></Route>
          ))}
        </Switch>
        {<RefreshModal />}
      </Suspense>
    </>
  );
}

export default withRouter(App);
//CICD