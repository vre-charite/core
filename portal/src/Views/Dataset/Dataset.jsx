import React, { useState, useEffect } from 'react';
import { StandardLayout } from '../../Components/Layout';
import FilePanel from '../../Components/Layout/FilePanel';
import { message } from 'antd';
import { datasetRoutes as routes } from '../../Routes/index';
import { withRouter, Switch, Route, Redirect } from 'react-router-dom';
import ToolBar from './Components/ToolBar';
import { getUsersOnDatasetAPI } from '../../APIs';
import { objectKeysToCamelCase } from '../../Utility';
import { connect } from 'react-redux';
import { apiErrorHandling, protectedRoutes } from '../../Utility';

import _ from 'lodash';
function Dataset(props) {
  const {
    match: { path, params },
    containersPermission,
    role,
    datasetList,
  } = props;
  const [userListOnDataset, setUserListOnDataset] = useState(null);
  const containerDetails =
    datasetList[0] &&
    _.find(datasetList[0]['datasetList'], (item) => {
      return parseInt(item.id) === parseInt(params.datasetId);
    });

  const config = {
    observationVars: [params.datasetId, containersPermission, role],
    initFunc: () => {
      const currentContainer = _.find(containersPermission, (item) => {
        return parseInt(item.container_id) === parseInt(params.datasetId);
      });
      if (containersPermission !== null && role !== null) {
        const isAccess =
          role === 'admin' ||
          _.some(containersPermission, (item) => {
            const itemId = parseInt(item.container_id);
            const paramId = parseInt(params.datasetId);
            return parseInt(item.container_id) === parseInt(params.datasetId);
          });

        if (!isAccess) {
          message.error('No Access to the Container');
          window.setTimeout(() => {
            props.history.push('/uploader');
          }, 1000);
          return;
        }
      }

      // currentContainer &&
      //   currentContainer.permission === 'admin' &&
      //   getUsersOnDatasetAPI(params.datasetId)
      //     .then((res) => {
      //       setUserListOnDataset(objectKeysToCamelCase(res.data.result));
      //     })
      //     .catch(
      //       apiErrorHandling({
      //         e500: 'when getting users list',
      //         e400: 'service to get users list',
      //         e403: 'get users list',
      //       }),
      //     );
    },
  };
  return (
    <StandardLayout {...config} rightContent={<ToolBar />}>
      <Switch>
        {routes.map((item) => (
          <Route
            exact={item.exact || false}
            path={path + item.path}
            key={item.path}
            render={(props) => {
              let res = protectedRoutes(
                item.protectedType,
                true,
                props,
                containersPermission,
              );
              if (res === '403') {
                return <Redirect to="/error/403" />;
              } else if (res === '404') {
                return <Redirect to="/error/404" />;
              } else {
                return (
                  <item.component
                    datasetId={params.datasetId}
                    userListOnDataset={userListOnDataset}
                    containerDetails={containerDetails}
                    getUsersOnDatasetAPI={getUsersOnDatasetAPI}
                    setUserListOnDataset={setUserListOnDataset}
                  />
                );
              }
            }}
          ></Route>
        ))}
      </Switch>
      <FilePanel />
    </StandardLayout>
  );
}

export default connect((state) => ({
  containersPermission: state.containersPermission,
  role: state.role,
  datasetList: state.datasetList,
}))(withRouter(Dataset));
