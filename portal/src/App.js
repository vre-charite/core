import React, { useEffect, useState, Suspense } from 'react';
import { Switch, Route, Redirect, withRouter } from 'react-router-dom';
import { authedRoutes, unAuthedRoutes } from './Routes';
import './App.css';
import { useSelector, useDispatch } from 'react-redux';
import {
  AddDatasetCreator,
  setContainersPermissionCreator,
  setUserRoleCreator,
  updateUploadItemCreator,
  updateClearIdCreator,
  setSuccessNum,
  setDonwloadClearIdCreator,
  setUploadListCreator,
  updateDownloadItemCreator,
  setDownloadListCreator,
  setIsLoginCreator,
  setUsernameCreator,
  setEmailCreator,
} from './Redux/actions';
import {
  getDatasetsAPI,
  listAllContainersPermission,
  checkDownloadStatusAPI,
  checkUploadStatus,
  checkDownloadStatus,
  lastLoginAPI,
} from './APIs';
import {
  protectedRoutes,
  reduxActionWrapper,
  preLogout,
  logout,
  actionType, broadcastAction, uploadAction, debouncedBroadcastAction
} from './Utility';
import { message, Modal, Spin, Button } from 'antd';
import Promise from 'bluebird';
import _ from 'lodash';
import ExpirationNotification from './Components/Modals/ExpirationNotification';
import { namespace, ErrorMessager } from './ErrorMessages';
import { v4 as uuidv4 } from 'uuid';
import { history } from './Routes';
import { tokenManager } from './Service/tokenManager';
import { broadcastManager } from './Service/broadcastManager';
import { namespace as serviceNamespace } from './Service/namespace';
import { useKeycloak } from '@react-keycloak/web';
import { useIdleTimer } from 'react-idle-timer';
import { keycloakManager } from './Service/keycloak';
import { Loading } from './Components/Layout';

// router change
history.listen(() => {
  Modal.destroyAll();
});

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
  setDonwloadClearIdDispatcher,
  setUploadListDispatcher,
  setSuccessNumDispatcher,
  setDownloadListDispatcher,
  updateDownloadItemDispatch,
  setIsLoginDispatcher,
  setUsernameDispatcher,
  setEmailDispatcher,
] = reduxActionWrapper([
  AddDatasetCreator,
  setContainersPermissionCreator,
  setUserRoleCreator,
  updateUploadItemCreator,
  updateClearIdCreator,
  setDonwloadClearIdCreator,
  setUploadListCreator,
  setSuccessNum,
  setDownloadListCreator,
  updateDownloadItemCreator,
  setIsLoginCreator,
  setUsernameCreator,
  setEmailCreator,
]);

let isSessionMax = false;
const getIsSessionMax = () => isSessionMax;

const showExpiringModalTime = 2.5 * 60; //how many seconds before the refresh token expires to show the modal (s)
const checkRefreshInterval = 60; // (s) every ${checkRefreshInterval} will be a checkpoint, in which the program will check if it's active(!idle). If true, update token.
let refreshTokenLiftTime; // (s) refresh token life time, which equals to SSO session idle.
const idleTimeout = 60 * 5; // (s) after how many seconds no action, the status will become idle.
const defaultTimeToClose = 10; //(s) how many seconds to auto close session modal, after onActive event
let intervalId; //button count down interval id
switch (process.env.REACT_APP_ENV) {
  case 'dev':
    refreshTokenLiftTime = 6 * 60;
    break;
  case 'staging':
    refreshTokenLiftTime = 30 * 60;
    break;
  case 'charite':
    refreshTokenLiftTime = 30 * 60;
    break;
  default:
    refreshTokenLiftTime = 6 * 60;
    break;
}
console.log(process.env.REACT_APP_ENV, 'process.env.REACT_APP_ENV')

function App() {
  const {
    uploadList,
    downloadList,
    clearId,
    datasetList,
    isLogin,
    downloadClearId,
    successNum,isKeycloakReady
  } = useSelector((state) => state);

  const { keycloak } = useKeycloak();
  const [isRefrshing, setIsRefreshing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRefreshed, setIsRefreshed] = useState(false);
  const [timeToClose, setTimeToClose] = useState(defaultTimeToClose);
  const dispatch = useDispatch();

  const sessionId = localStorage.getItem('sessionId');


  
  const openNotification = () => {
    console.log(
      keycloakManager.getRefreshRemainTime(),
      'refreshRemain time, opening modal', isModalOpen, 'isModalOpen', isIdle(), 'isIdle'
    );
    if (!isModalOpen) {
      setIsModalOpen(true);
    }
  };

  const closeNotification = () => {
    setIsModalOpen(false);
    setIsRefreshed(false);
    setTimeToClose(defaultTimeToClose);
    clearInterval(intervalId);
  };

  const handleOnActive = () => {
    console.log('on active', isLogin, 'isLogin', new Date());
    if (isLogin) {
      setIsRefreshing(true);
      keycloak.updateToken(-1).then((isSuccess) => {
        if (isSuccess && isModalOpen && !isSessionMax) {
          setIsRefreshed(true);
          intervalId = window.setInterval(() => {
            setTimeToClose((preTimeToClose) => {
              if (preTimeToClose <= 0) {
                closeNotification();
                clearInterval(intervalId);
              }
              return (preTimeToClose - 1)
            });
          }, 1000)
        } else {

        }
      }).finally(() => {
        setIsRefreshing(false);
      });
    }
  };

  const openNotifConfig = {
    condition: (timeRemain) => {
      return (timeRemain >= 0) && (timeRemain === showExpiringModalTime) && (isIdle() || isSessionMax);
    },
    func: openNotification,
  };



  const { isIdle, reset } = useIdleTimer({
    timeout: 1000 * idleTimeout,
    onActive: handleOnActive,
    onIdle: () => {
      console.log('onIdle', new Date());
    },
    onAction: (e) => {
      console.log('onAction', new Date());
      if (e.type !== actionType) {
        debouncedBroadcastAction();
      }
    },
    debounce: 500,
  });

  const refreshConfig = {
    condition: (timeRemain) => {
      if (
        timeRemain < refreshTokenLiftTime &&
        timeRemain > 0 &&
        timeRemain % checkRefreshInterval === 0
      ) {
        console.log(timeRemain, checkRefreshInterval);
      }
      return (
        timeRemain < refreshTokenLiftTime &&
        timeRemain > 0 &&
        timeRemain % checkRefreshInterval === 0
      );
    },
    func: () => {
      console.log('update token checkpoint, isIdle', isIdle());
      !isIdle() &&
        keycloak
          .updateToken(-1)
          .then((isRefresh) => {
            if (!isRefresh) {
              message.error('Failed to refresh token');
            }
          })
          .catch(() => {
            message.error('Error:Failed to refresh token');
          });
    },
  };

  const logoutConfig = {
    condition: (timeRemain) => {
      return timeRemain <= 0 && !!keycloak.refreshTokenParsed;
    },
    func() {
      logout();
    },
  };

  //keycloak event binding
  useEffect(() => {
    keycloak.onAuthLogout = () => {
      preLogout();
    };
    keycloak.onAuthRefreshSuccess = () => {
      if (
        keycloak.refreshTokenParsed.exp - keycloak.refreshTokenParsed.iat <
        refreshTokenLiftTime
      ) {
        isSessionMax = true;
      } else {
        isSessionMax = false;
      }
      if (isModalOpen) {
        setIsRefreshed(true);
      }
    };
    keycloak.onAuthSuccess = () => {
      console.log(keycloak.tokenParsed, 'onAuthSuccess')
      if (!isLogin) {
        const sourceId = uuidv4();
        localStorage.setItem(
          'sessionId',
          `${keycloak?.tokenParsed.preferred_username}-${sourceId}`,
        );
        tokenManager.setCookies({
          sessionId: `${keycloak?.tokenParsed.preferred_username}-${sourceId}`,
        });
        lastLoginAPI(keycloak?.tokenParsed.preferred_username);
      }
      setUsernameDispatcher(keycloak?.tokenParsed.preferred_username);
      setEmailDispatcher(keycloak?.tokenParsed.email);
      initApis(keycloak?.tokenParsed.preferred_username);
      const timeRemain = keycloakManager.getRefreshRemainTime();
      if (
        keycloak.refreshTokenParsed.exp - keycloak.refreshTokenParsed.iat <
        refreshTokenLiftTime
      ) {
        isSessionMax = true;
      } else {
        isSessionMax = false;
      }
      if (timeRemain > 0 && timeRemain < showExpiringModalTime) {
        openNotification();
      }
    };
    keycloak.onAuthRefreshError = () => {
      console.log('on refresh error');
    };
    keycloakManager.addListener(openNotifConfig);
    keycloakManager.addListener(refreshConfig);
    keycloakManager.addListener(logoutConfig);
    broadcastManager.addListener('logout', (msg, channelNamespace) => {
      console.log('logout broadcast')
      if (keycloak.authenticated) {
        logout();
      }
    });
    broadcastManager.addListener('refresh', () => {
      broadcastAction();
    })
  }, []);

  //upload list update
  useEffect(() => {
    debouncedUpdatePendingStatus(uploadList);
    setRefreshConfirmation(
      uploadList.filter((item) => item.status === 'uploading'),
    );
  }, [uploadList]);

  //download list update
  useEffect(() => {
    const pendingDownloadList = downloadList.filter(
      (el) => el.status === 'pending',
    );
    updateDownloadStatus(pendingDownloadList);
    setRefreshConfirmation(pendingDownloadList);
  }, [downloadList]);

  const initApis = async (username) => {
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

  const updateDownloadStatus = (arr) => {
    tokenManager.removeListener(downloadClearId);
    const time = 4;
    const condition = (timeRemain) => {
      return timeRemain % time === 0;
    };

    if (arr.length > 0) {
      uploadAction();
    }
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
    const newDownloadClearId = keycloakManager.addListener({
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
      window.onbeforeunload = () => { };
    }
  };

  const updatePendingStatus = (arr) => {
    keycloakManager.removeListener(clearId);
    const pendingArr = arr.filter((item) => item.status === 'pending');
    if (pendingArr.length === 0) {
      //make sure clear all interval ids
      return;
    }
    if (arr.filter((item) => item.status === 'uploading').length > 0) {
      uploadAction();
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
    const condition = (timeRemain) => {
      return timeRemain % time === 0;
    };
    const newClearId = keycloakManager.addListener({ func, condition });

    updateClearIdDispatcher(newClearId);
  };

  const debouncedUpdatePendingStatus = _.debounce(updatePendingStatus, 5000, {
    leading: true,
    trailing: true,
    maxWait: 15 * 1000,
  });
  if(!isKeycloakReady){
    return <Loading />
  };
  
  return (
    <>
      <Spin spinning={isRefrshing} tip="reconnecting">
        <Suspense fallback={null}>
          <Switch>
            {authedRoutes.map((item) => (
              <Route
                path={item.path}
                key={item.path}
                exact={item.exact || false}
                render={(props) => {
                 /*  if (!keycloak.refreshToken && isLogin) {
                    return <Loading />;
                  } else if (!keycloak.refreshToken && !isLogin) {
                    return <Redirect to="/" />;
                  } */

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
                  return !isLogin ? (
                    <item.component />
                  ) : (
                      <Redirect to="/landing" />
                    );
                }}
              ></Route>
            ))}
          </Switch>
        </Suspense>
      </Spin>
      <Modal
        title={'Session Expiring'}
        closable={false}
        footer={[
          <Button key="submit" type="primary" onClick={closeNotification}>
            Continue {isRefreshed && !isSessionMax && `(${timeToClose})`}
          </Button>,
        ]}
        visible={isModalOpen}
      >
        <ExpirationNotification
          isRefreshed={isRefreshed}
          getIsSessionMax={getIsSessionMax}
        />
      </Modal>
    </>
  );
}

export default withRouter(App);
