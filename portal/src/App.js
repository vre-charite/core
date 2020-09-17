import React, { Component } from 'react';
import { withRouter, Switch, Route, Redirect } from 'react-router-dom';
import { authedRoutes, unAuthedRoutes } from './Routes';
import './App.css';
import { connect } from 'react-redux';
import {
  AddDatasetCreator,
  setUserListCreator,
  setTagsCreator,
  setMetadatasCreator,
  setPersonalDatasetIdCreator,
  setContainersPermissionCreator,
  setUserRoleCreator,
  updateUploadItemCreator,
  setRefreshModal,
  removeDownloadListCreator,
  setIsLoginCreator,
  updateClearIdCreator,
} from './Redux/actions';
import { withCookies } from 'react-cookie';
import {
  getDatasetsAPI,
  getAllUsersAPI,
  getTagsAPI,
  getMetadatasAPI,
  getPersonalDatasetAPI,
  listAllContainersPermission,
  checkPendingStatusAPI,
  checkDownloadStatusAPI,
} from './APIs';
import {
  objectKeysToCamelCase,
  protectedRoutes,
  apiErrorHandling,
  checkToken,
  logout,
  logoutChannel,
  loginChannel,
  headerUpdate,
  isTokenExpired,
  getCookie,
} from './Utility';
import { message } from 'antd';
import Promise from 'bluebird';
import _ from 'lodash';
import { useStore } from 'react-redux';
import jwt_decode from 'jwt-decode';
import moment from 'moment';
import RefreshModel from './Components/Modals/RefreshModal';
import { namespace, ErrorMessager } from './ErrorMessages';
let clearIds = [];
message.config({
  maxCount: 2,
});

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      clearId: null,
      refresh: false,
      authError: false,
      downloadClearId: null,
      checkTokenIntervalId: null,
    };
  }

  async componentDidMount() {
    if (window.location.pathname !== '/') {
      if (!this.props.allCookies.isLogin) {
        localStorage.clear();
        return;
      }
      if (isTokenExpired(getCookie('access_token'))) {
        logout(true);
        return;
      }

      this.setCheckTokenInterval();

      const token = getCookie('access_token');
      checkToken(token, this.props.setRefreshModal);
      getDatasetsAPI({ type: 'usecase' })
        .then((res) => {
          this.props.AddDatasetCreator(res.data.result, 'All Use Cases');
        })
        .catch((err) => {
          const errorMessager = new ErrorMessager(namespace.common.getDataset);
          errorMessager.triggerMsg(err.response && err.response.status);
        });

      const username = this.props.allCookies.username;
      try {
        const {
          data: { result: containersPermission },
        } = await listAllContainersPermission(username);

        this.props.setContainersPermissionCreator(
          containersPermission.permission,
        );
        this.props.setUserRoleCreator(containersPermission.role);
      } catch (err) {
        if (err.response) {
          const errorMessager = new ErrorMessager(
            namespace.common.listAllContainersPermission,
          );
          errorMessager.triggerMsg(err.response.status);
        }
      }

      this.debouncedUpdatePendingStatus(this.props.uploadList);
      this.updateDownloadStatus(this.props.downloadList);
    }

    this.listenBroadcast();
    this.props.setIsLoginCreator(getCookie('isLogin') ? true : false);
  }

  setCheckTokenInterval = () => {
    clearInterval(this.state.checkTokenIntervalId);
    const checkTokenIntervalId = window.setInterval(() => {
      const token = getCookie('access_token');
      try {
        if (token) {
          const exp = jwt_decode(token).exp;
          const diff = exp - moment().unix() < 60; // expired after 1 min
          if (diff && !this.props.refresh && this.props.isLogin) {
            // if is not login, will not show refresh modal
            this.props.setRefreshModal(true); // Pop up warning modal
          }
        } else {
          return;
        }
      } catch (e) {
        console.log(token, 'token');
        console.log(e);
      }
    }, 6000);
    this.setState({ checkTokenIntervalId });
  };

  listenBroadcast = () => {
    logoutChannel.onmessage = (msg) => {
      console.log('logout in app.js, listen logout');
      logout();
    };
    loginChannel.onmessage = (username) => {
      const { username: cookieUsername } = this.props.allCookies;
      const { isLogin } = this.props;

      console.log(username, cookieUsername, 'loginChannel');
      if (!isLogin) {
        return;
      }
      if (cookieUsername !== undefined && username !== cookieUsername) {
        console.log('logout in app.js, listen login');
        logout(false); //should not use this logout, since it will clean the cookies
      }
      if (username === cookieUsername) {
        headerUpdate(getCookie('access_token'), getCookie('refresh_token'));
      }
    };
  };

  componentDidUpdate(prevProps) {
    if (prevProps.uploadList !== this.props.uploadList) {
      this.debouncedUpdatePendingStatus(this.props.uploadList);
      this.setRefreshConfirmation(this.props.uploadList);
      this.debouncedTokenRefreshWhileUploading();
    }
    if (prevProps.downloadList !== this.props.downloadList) {
      this.updateDownloadStatus(this.props.downloadList);
    }
    if (prevProps.isLogin !== this.props.isLogin) {
      console.log('isLogin change');
      this.setCheckTokenInterval();
    }
    logoutChannel.onmessage = (msg) => {
      console.log(msg, 'logoutChannel in app.js componentdidmount');
      //logout();
    };
    this.listenBroadcast();
  }

  updatePendingStatus = (arr) => {
    clearInterval(this.props.clearId); //don't know why this doesn't work

    const pendingArr = arr.filter((item) => item.status === 'pending');
    if (pendingArr.length === 0) {
      //make sure clear all interval ids
      clearIds.forEach((element) => {
        clearInterval(element);
      });
      clearIds = [];
      return;
    }

    const clearId = window.setInterval(() => {
      Promise.map(pendingArr, (item, index) => {
        checkPendingStatusAPI(item.projectId, item.taskId)
          .then((res) => {
            const { status } = res.data.result;
            if (status === 'success' || status === 'error') {
              item.status = status;
              //always remember to put redux creator in the connect function !!!!!
              this.props.updateUploadItemCreator(item);
              if (status === 'error') {
                const errorMessager = new ErrorMessager(
                  namespace.dataset.files.processingFile,
                );
                errorMessager.triggerMsg(null, null, item);
              }
            }
          })
          .catch((err) => {
            if (err.response && parseInt(err.response.status) !== 404) {
              console.log(err.response, 'error response in checking pending');
            }
          });
      });
    }, 4000);
    clearIds.push(clearId);
    this.props.updateClearIdCreator(clearId);
  };

  updateDownloadStatus = (arr) => {
    clearInterval(this.state.downloadClearId);
    const downloadClearId = window.setInterval(() => {
      Promise.map(arr, (item, index) => {
        checkDownloadStatusAPI(
          item.projectId,
          item.downloadKey,
          this.props.removeDownloadListCreator,
        );
      });
    }, 4000);
    this.setState({
      downloadClearId,
    });
  };

  setRefreshConfirmation = (arr) => {
    const uploadingArr = arr.filter((item) => item.status === 'uploading');
    const confirmation = function (event) {
      return window.confirm(
        'You will loss your uploading progress. Are you sure to exit?',
      );
    };
    if (uploadingArr.length > 0) {
      // window.addEventListener('beforeunload',confirmation);
      window.onbeforeunload = confirmation;
      //window.onbeforeunload = confirmation;
    } else {
      window.onbeforeunload = () => {};
    }
  };

  tokenRefreshWhileUploading() {
    const { uploadList } = this.props;
    const uploadingList = uploadList.filter(
      (item) => item.status === 'uploading',
    );
    if (uploadingList.length > 0) {
      const accessToken = getCookie('access_token');
      const refreshToken = getCookie('refresh_token');
      headerUpdate(accessToken, refreshToken);
    }
  }

  debouncedTokenRefreshWhileUploading = _.debounce(
    this.tokenRefreshWhileUploading,
    5 * 1000,
    {
      leading: true,
      trailing: true,
      maxWait: 15 * 1000,
    },
  );

  debouncedUpdatePendingStatus = _.debounce(this.updatePendingStatus, 5000, {
    leading: true,
    trailing: true,
    maxWait: 15 * 1000,
  });

  render() {
    let refresh = this.props.refresh;
    let datasetList = this.props.datasetList;

    return (
      <>
        <Switch>
          {authedRoutes.map((item) => (
            <Route
              path={item.path}
              key={item.path}
              exact={item.exact || false}
              //component={item.component}
              render={(props) => {
                let res = protectedRoutes(
                  item.protectedType,
                  this.props.isLogin,
                  props,
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
                  this.props.isLogin,
                  props,
                  datasetList,
                ) ? (
                  <item.component />
                ) : (
                  <Redirect to="/uploader" />
                );
              }}
            ></Route>
          ))}
        </Switch>
        {refresh && <RefreshModel />}
      </>
    );
  }
}

export default connect(
  (state) => ({
    clearId: state.clearId,
    uploadList: state.uploadList,
    isLogin: state.isLogin,
    refresh: state.refreshTokenModal,
    downloadList: state.downloadList,
    containersPermission: state.containersPermission,
    datasetList: state.datasetList,
  }),
  {
    AddDatasetCreator,
    setUserListCreator,
    setTagsCreator,
    setMetadatasCreator,
    setPersonalDatasetIdCreator,
    setContainersPermissionCreator,
    setUserRoleCreator,
    updateUploadItemCreator,
    setRefreshModal,
    removeDownloadListCreator,
    setIsLoginCreator,
    updateClearIdCreator,
  },
)(withCookies(withRouter(App)));

// trigger cicd