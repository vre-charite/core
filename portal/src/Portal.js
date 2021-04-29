import React, { useEffect, useState, Suspense } from 'react';
import { Switch, Route, Redirect, withRouter } from 'react-router-dom';
import { authedRoutes, unAuthedRoutes } from './Routes';
import './Portal.css';
import { useSelector, useDispatch } from 'react-redux';
import {
  setContainersPermissionCreator,
  setUserRoleCreator,
  updateUploadItemCreator,
  updateClearIdCreator,
  setSuccessNum,
  setDonwloadClearIdCreator,
  setUploadListCreator,
  updateDownloadItemCreator,
  setDownloadListCreator,
  setUsernameCreator,
  setEmailCreator,
  setIsReleaseNoteShownCreator,
  setUserStatus,
} from './Redux/actions';
import {
  checkDownloadStatusAPI,
  checkUploadStatus,
  checkDownloadStatus,
  lastLoginAPI,
  listUsersContainersPermission,
  getUserstatusAPI,
  attachManifest,
} from './APIs';
import { protectedRoutes, reduxActionWrapper, keepAlive } from './Utility';
import { message, Modal, Spin, Button, notification } from 'antd';
import Promise from 'bluebird';
import _ from 'lodash';

import { namespace, ErrorMessager } from './ErrorMessages';
import { v4 as uuidv4 } from 'uuid';
import { history } from './Routes';
import { tokenManager } from './Service/tokenManager';
import { useKeycloak } from '@react-keycloak/web';
import { version } from '../package.json';
import { tokenTimer } from './Service/keycloak';
import { Loading } from './Components/Layout/Loading';
import TermsOfUse from './Views/TermsOfUse/TermsOfUse';
import semver from 'semver';

// router change
history.listen(() => {
  Modal.destroyAll();
});

message.config({
  maxCount: 2,
  duration: 5,
});
const [
  setContainersPermissionDispatcher,
  setUserRoleDispatcher,
  updateUploadItemDispatcher,
  updateClearIdDispatcher,
  setDonwloadClearIdDispatcher,
  setUploadListDispatcher,
  setSuccessNumDispatcher,
  setDownloadListDispatcher,
  updateDownloadItemDispatch,
  setUsernameDispatcher,
  setEmailDispatcher,
  setIsReleaseNoteShownDispatcher,
  setUserStatusDispather,
] = reduxActionWrapper([
  setContainersPermissionCreator,
  setUserRoleCreator,
  updateUploadItemCreator,
  updateClearIdCreator,
  setDonwloadClearIdCreator,
  setUploadListCreator,
  setSuccessNum,
  setDownloadListCreator,
  updateDownloadItemCreator,
  setUsernameCreator,
  setEmailCreator,
  setIsReleaseNoteShownCreator,
  setUserStatus,
]);

function Portal(props) {
  const {
    uploadList,
    downloadList,
    clearId,
    downloadClearId,
    successNum,
    isReleaseNoteShown,
    containersPermission,
    role,
    uploadFileManifest,
    username,
    project,
    user,
  } = useSelector((state) => state);
  const userStatus = user.status;
  const dispatch = useDispatch();
  const { keycloak } = useKeycloak();

  //keycloak event binding
  useEffect(() => {
    // initial logic
    async function initUser() {
      if (!tokenManager.getCookie('sessionId')&&userStatus==='active') {
        const sourceId = uuidv4();
        tokenManager.setCookies({
          sessionId: `${keycloak?.tokenParsed.preferred_username}-${sourceId}`,
        });
        lastLoginAPI(keycloak?.tokenParsed.preferred_username);
      }
      setUsernameDispatcher(keycloak?.tokenParsed.preferred_username);
      setEmailDispatcher(keycloak?.tokenParsed.email);
      getUserstatus();
    }
    async function getUserstatus() {
      try{
        const res = await getUserstatusAPI();
        if (res && res.data) {
          setUserStatusDispather(res.data.status);
        }
        
      }catch(err){
        message.error('User not found');
      }
      
    }
    if (keycloak?.tokenParsed) {
      initUser();
    }
    if (userStatus === 'active') {
      initApis(keycloak?.tokenParsed.preferred_username);
    }
    // eslint-disable-next-line
  }, [userStatus]);

  //check version number
  useEffect(() => {
    const versionNumLocal = localStorage.getItem('version');
    const isLatest =
      semver.valid(versionNumLocal) && semver.eq(version, versionNumLocal);

    if (!isLatest && keycloak.authenticated) {
      const args = {
        message: (
          <>
            <img alt="release note" width={30} src="/vre/Rocket.svg"></img>{' '}
            <b>{' Release ' + version}</b>
          </>
        ), //,
        description: (
          <span
            onClick={() => {
              setIsReleaseNoteShownDispatcher(true);
              notification.close('releaseNote');
              localStorage.setItem('version', version);
            }}
            style={{ cursor: 'pointer' }}
          >
            <u style={{ marginLeft: 34 }}>
              Click here to view the release notes
            </u>
          </span>
        ),
        duration: 0,
        onClose: () => {
          localStorage.setItem('version', version);
        },
        key: 'releaseNote',
        //onClick: () => { localStorage.setItem('version', version) }
      };
      notification.open(args);
    }
  }, [keycloak.authenticated]);

  //upload list update
  useEffect(() => {
    debouncedUpdatePendingStatus(uploadList);
    setRefreshConfirmation(
      uploadList.filter((item) => item.status === 'uploading'),
    );
    // eslint-disable-next-line
  }, [uploadList]);

  //download list update
  useEffect(() => {
    const pendingDownloadList = downloadList.filter(
      (el) => el.status === 'pending',
    );
    const clearId = updateDownloadStatus(pendingDownloadList);
    setRefreshConfirmation(pendingDownloadList);
    return () => {
      clearInterval(clearId);
    };
    // eslint-disable-next-line
  }, [downloadList]);
  const initApis = async (username) => {
    try {
      const params = {
        order_by: 'time_created',
        order_type: 'desc',
        is_all: true,
      };

      const {
        data: { result: containersPermission, role },
      } = await listUsersContainersPermission(username, params);
      setUserRoleDispatcher(role);
      setContainersPermissionDispatcher(containersPermission);

      const sessionId = tokenManager.getCookie('sessionId');
      const res = await checkUploadStatus('*', '*', sessionId);
      const { code, result } = res.data;

      if (code === 200) {
        const newUploadList = [];
        for (const item of result) {
          if (['TERMINATED', 'SUCCEED'].includes(item.status)) {
            newUploadList.push({
              fileName: item.source,
              status: item.status === 'SUCCEED' ? 'success' : 'error',
              progress: 1,
              uploadedTime: parseInt(item.updateTimestamp),
              projectCode: item.projectCode,
            });
          }
        }
        setUploadListDispatcher(newUploadList);
      }

      const pathname = props.location.pathname;
      const isInProject = pathname.includes('project');

      if (isInProject) {
        const pathArray = pathname.split('/');
        const currentProjectId = pathArray[pathArray.length - 2];

        const currentProject =
          containersPermission &&
          containersPermission.find((el) => el.id === Number(currentProjectId));

        try {
          const downloadRes = await checkDownloadStatus(
            sessionId,
            currentProject.code,
            username,
          );
          if (downloadRes.status === 200) {
            let downloadList = downloadRes.data && downloadRes.data.result;
            downloadList = downloadList.map((item) => {
              if (
                item.status === 'READY_FOR_DOWNLOADING' ||
                item.status === 'SUCCESS'
              ) {
                item.status = 'success';
              } else if (item.status === 'ZIPPING') {
                item.status = 'pending';
              } else {
                item.status = 'error';
              }

              const sourceArray = item.source && item.source.split('/');

              item.filename =
                sourceArray &&
                sourceArray.length &&
                sourceArray[sourceArray.length - 1];

              return item;
            });
            setDownloadListDispatcher(downloadList);
          }
        } catch (err) {
          if (err.response && err.response.status === 404) {
            console.log('no download history in current session');
          }
        }
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
    if (arr.length > 0) {
      keepAlive();
    }
    const func = () => {
      Promise.map(arr, (item, index) => {
        if (item.status === 'pending') {
          checkDownloadStatusAPI(
            item.downloadKey,
            item.hashCode,
            item.namespace,
            updateDownloadItemDispatch,
            setSuccessNumDispatcher,
            successNum,
          );
        }
      });
    };
    const newDownloadClearId = setInterval(() => {
      func();
    }, 5 * 1000);
    return newDownloadClearId;
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

  const updatePendingStatus = (arr) => {
    tokenTimer.removeListener(clearId);
    const pendingArr = arr.filter((item) => item.status === 'pending');
    if (pendingArr.length === 0) {
      //make sure clear all interval ids
      return;
    }
    if (arr.filter((item) => item.status === 'uploading').length > 0) {
      keepAlive();
    }

    const sessionId = tokenManager.getCookie('sessionId');
    const time = 4;
    const func = () => {
      Promise.map(pendingArr, (item, index) => {
        checkUploadStatus('*', '*', sessionId)
          .then(async (res) => {
            const { code, result } = res.data;
            if (code === 200) {
              let fileName = item.fileName;
              if (item.generateID) fileName = `${item.generateID}_${fileName}`;
              const fileStatus = result?.find((el) => el.jobId === item.jobId);
              const isSuccess = fileStatus && fileStatus.status === 'SUCCEED';

              if (isSuccess) {
                const manifestItem = uploadFileManifest.find((x) => {
                  const fileArr = x.files[0].split('/');
                  const fileNameFromPath = fileArr[fileArr.length - 1];
                  if (fileNameFromPath === fileName) {
                    x.geid = fileStatus.payload.sourceGeid;
                  }
                  return fileNameFromPath === fileName;
                });
                if (manifestItem && manifestItem.manifestId) {
                  await attachManifest(
                    manifestItem.manifestId,
                    [manifestItem.geid],
                    manifestItem.attributes,
                  );
                }
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
    const newClearId = tokenTimer.addListener({ func, condition });

    updateClearIdDispatcher(newClearId);
  };

  const debouncedUpdatePendingStatus = _.debounce(updatePendingStatus, 5000, {
    leading: true,
    trailing: true,
    maxWait: 15 * 1000,
  });

/*   if (userStatus === null) {
    return null;
  } */
  return userStatus === 'pending' ? (
    <TermsOfUse />
  ) : (
    <>
      <Suspense fallback={null}>
        <Switch>
          {authedRoutes.map((item) => (
            <Route
              path={item.path}
              key={item.path}
              exact={item.exact || false}
              render={(props) => {
                if (!keycloak.authenticated) {
                  return <Redirect to="/" />;
                }
                if (!containersPermission) {
                  return <Loading />;
                }
                let res = protectedRoutes(
                  item.protectedType,
                  keycloak.authenticated,
                  props.match.params.datasetId,
                  containersPermission,
                  role,
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
        </Switch>
      </Suspense>
    </>
  );
}

export default withRouter(Portal);

// trigger cicd
