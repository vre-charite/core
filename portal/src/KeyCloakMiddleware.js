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

//the component App and below can only use keycloak.access_token to bind it to axios and authenticated in react router
import Portal from './Portal';
import { Router, Switch, Route, Redirect } from 'react-router-dom';
import { authedRoutes, unAuthedRoutes, basename } from './Routes';
import { history } from './Routes';
import { Modal, message, Button, Spin } from 'antd';
import React, { useEffect, useState } from 'react';
import { Loading } from './Components/Layout/Loading';
import { useSelector } from 'react-redux';
import { setIsLoginCreator, setIsKeycloakReady } from './Redux/actions';
import { ReactKeycloakProvider as KeycloakProvider } from '@react-keycloak/web';
import { keycloak } from './Service/keycloak';
import { store } from './Redux/store';
import { broadcastAction } from './Utility';
import { logout, refresh } from './Utility';
import { broadcastManager } from './Service/broadcastManager';
import { tokenManager } from './Service/tokenManager';
import ExpirationNotification from './Components/Modals/ExpirationNotification';
import { useIdleTimer } from 'react-idle-timer';
import { tokenTimer } from './Service/keycloak';
import { actionType, debouncedBroadcastAction } from './Utility';
import { Suspense } from 'react';
import { lastLoginAPI, getUserstatusAPI } from './APIs';
import ReleaseNoteModal from './Components/Modals/RelaseNoteModal';
import { version } from '../package.json';
import { v4 as uuidv4 } from 'uuid';
const { pathToRegexp } = require('path-to-regexp');
let isSessionMax = false;
const getIsSessionMax = () => isSessionMax;
const { detect } = require('detect-browser');
const browser = detect();
function toKeycloakPromise(promise) {
  promise.__proto__ = KeycloakPromise.prototype;
  return promise;
}

function KeycloakPromise(executor) {
  return toKeycloakPromise(new Promise(executor));
}

KeycloakPromise.prototype = Object.create(Promise.prototype);
KeycloakPromise.prototype.constructor = KeycloakPromise;

KeycloakPromise.prototype.success = function (callback) {
  var promise = this.then(function handleSuccess(value) {
    callback(value);
  });

  return toKeycloakPromise(promise);
};

KeycloakPromise.prototype.error = function (callback) {
  var promise = this.catch(function handleError(error) {
    callback(error);
  });

  return toKeycloakPromise(promise);
};
function createPromise() {
  // Need to create a native Promise which also preserves the
  // interface of the custom promise type previously used by the API
  var p = {
    setSuccess: function (result) {
      p.resolve(result);
    },

    setError: function (result) {
      p.reject(result);
    },
  };
  p.promise = new KeycloakPromise(function (resolve, reject) {
    p.resolve = resolve;
    p.reject = reject;
  });
  return p;
}
const MyCustomAdapter = {
  login: function (options) {
    const url = keycloak.createLoginUrl(options);
    let pathname = window.location.pathname;
    pathname = pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
    if (
      isUnauthedRoute(window.location.pathname) &&
      options &&
      options.prompt
    ) {
      return createPromise().promise;
    }
    window.location.replace(url);
    return createPromise().promise;
  },

  logout: function (options) {
    window.location.replace(keycloak.createLogoutUrl(options));
    return createPromise().promise;
  },

  register: function (options) {
    window.location.replace(keycloak.createRegisterUrl(options));
    return createPromise().promise;
  },

  accountManagement: function () {
    var accountUrl = keycloak.createAccountUrl();
    if (typeof accountUrl !== 'undefined') {
      window.location.href = accountUrl;
    } else {
      throw 'Not supported by the OIDC server';
    }
    return createPromise().promise;
  },

  redirectUri: function (options, encodeHash) {
    if (arguments.length === 1) {
      encodeHash = true;
    }
    if (options && options.redirectUri) {
      return options.redirectUri;
    } else if (keycloak.redirectUri) {
      return keycloak.redirectUri;
    } else {
      return window.location.href;
    }
  },
};
// detect token when tab is resume
// The reason is local & dev will not logout together
// the token updating will cause keycloak refresh and then logout
document.addEventListener('visibilitychange', (event) => {
  if (document.visibilityState == 'visible') {
    keycloak
      .updateToken(-1)
      .then(function (refreshed) {
        if (refreshed) {
          console.log('Token was successfully refreshed');
        } else {
          console.log('Token is still valid');
        }
      })
      .catch(function () {
        console.log('Failed to refresh the token, or the session has expired');
      });
  }
});
const initOptions =
  browser?.name === 'safari'
    ? {}
    : { checkLoginIframe: false, adapter: MyCustomAdapter };

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
  case 'production':
    refreshTokenLiftTime = 30 * 60;
    break;
  default:
    refreshTokenLiftTime = 6 * 60;
    break;
}
function KeyCloakMiddleware() {
  const { isKeycloakReady, isReleaseNoteShown } = useSelector((state) => state);
  const [isRefrshing, setIsRefreshing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRefreshed, setIsRefreshed] = useState(false);
  const [timeToClose, setTimeToClose] = useState(defaultTimeToClose);
  const onEvent = (event, error) => {
    switch (event) {
      case 'onReady': {
        console.log('onReady');
        if (!keycloak.authenticated) {
          tokenManager.clearCookies();
        } else {
          if (!tokenManager.getCookie('sessionId')) {
            const sourceId = uuidv4();
            tokenManager.setCookies({
              sessionId: `${keycloak?.tokenParsed.preferred_username}-${sourceId}`,
            });
            getUserstatusAPI()
              .then((res) => {
                console.log('keycloak onReady', res.data);
                if (res.data.result.status !== 'pending') {
                  lastLoginAPI(keycloak?.tokenParsed.preferred_username);
                }
              })
              .catch((error) => console.log(error.response));
          }
        }
        store.dispatch(setIsLoginCreator(keycloak.authenticated));
        store.dispatch(setIsKeycloakReady(true));
        if (keycloak.authenticated) {
          // console.log(keycloak.token, 'access_token'); // successfully get it. So once authenticated === true, access_token has value.
        }
        break;
      }
      case 'onAuthError': {
        break;
      }
      case 'onAuthLogout': {
        window.location.reload();
        break;
      }
      case 'onAuthRefreshError': {
        console.error('onRefresh error');
        break;
      }
      case 'onAuthSuccess': {
        break;
      }
      case 'onAuthRefreshSuccess': {
        // console.log(keycloak.token, 'access_token');
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
        if (!isSessionMax) {
          intervalId = window.setInterval(() => {
            setTimeToClose((preTimeToClose) => {
              if (preTimeToClose <= 0) {
                closeNotification();
                clearInterval(intervalId);
              }
              return preTimeToClose - 1;
            });
          }, 1000);
        }
        break;
      }
      default: {
      }
    }
  };
  useEffect(() => {
    tokenTimer.addListener(openNotifConfig);
    tokenTimer.addListener(refreshConfig);
    tokenTimer.addListener(logoutConfig);

    broadcastManager.addListener('logout', (msg, channelNamespace) => {
      if (keycloak.authenticated) {
        logout();
      }
    });
    broadcastManager.addListener('refresh', () => {
      broadcastAction();
    });

    if (keycloak?.refreshTokenParsed) {
      const timeRemain = tokenTimer.getRefreshRemainTime();
      if (
        keycloak &&
        keycloak.refreshTokenParsed &&
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
    }
    return () => {};
  }, []);

  const openNotification = () => {
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
    if (keycloak.authenticated) {
      setIsRefreshing(true);
      refresh().finally(() => {
        setIsRefreshing(false);
      });
    }
  };

  const openNotifConfig = {
    condition: (timeRemain) => {
      return (
        timeRemain >= 0 &&
        timeRemain === showExpiringModalTime &&
        (isIdle() || isSessionMax)
      );
    },
    func: openNotification,
  };

  const { isIdle } = useIdleTimer({
    timeout: 1000 * idleTimeout,
    onActive: handleOnActive,
    onAction: (e) => {
      if (e.type !== actionType) {
        debouncedBroadcastAction();
      }
    },
    debounce: 500,
  });

  const refreshConfig = {
    condition: (timeRemain) => {
      return (
        timeRemain < refreshTokenLiftTime &&
        timeRemain > 0 &&
        timeRemain % checkRefreshInterval === 0
      );
    },
    func: () => {
      !isIdle() &&
        refresh()
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
      window.onbeforeunload = () => {};
      logout();
    },
  };
  return (
    <KeycloakProvider
      onEvent={onEvent}
      initOptions={initOptions}
      autoRefreshToken={false}
      authClient={keycloak}
    >
      <Suspense fallback={<Loading />}>
        <>
          <Spin spinning={isRefrshing} tip="reconnecting">
            <Router history={history} forceRefresh={false}>
              <Switch>
                {authedRoutes.map((item) => (
                  <Route
                    path={item.path}
                    key={item.path}
                    exact={item.exact || false}
                    render={(props) => {
                      // only if keycloak ready, app will be rendered
                      if (isKeycloakReady) {
                        return <Portal />;
                      } else {
                        return <Loading />;
                      }
                    }}
                  ></Route>
                ))}
                {unAuthedRoutes.map((item) => (
                  <Route
                    path={item.path}
                    key={item.path}
                    exact={item.exact || false}
                    render={(props) => {
                      return <item.component />;
                    }}
                  ></Route>
                ))}
                <Route
                  path="/"
                  render={(props) => {
                    if (props.location.pathname === '/') {
                      // direct to login page
                      return <Redirect to="/login" />;
                    } else {
                      // General 404 when all rules not match the url
                      return <Redirect to="/404" />;
                    }
                  }}
                ></Route>
              </Switch>
            </Router>
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
          <ReleaseNoteModal
            visible={isReleaseNoteShown}
            currentVersion={version}
          />
        </>
      </Suspense>
    </KeycloakProvider>
  );
}

export default KeyCloakMiddleware;

function isUnauthedRoute(url) {
  if (url === '/' || url === '') {
    return true;
  }
  return unAuthedRoutes.some((route) => {
    const pathRaw = route.path;
    const path =
      basename + (pathRaw.endsWith('/') ? pathRaw.slice(0, -1) : pathRaw);
    const regexp = pathToRegexp(path);
    return Boolean(regexp.exec(url));
  });
}
