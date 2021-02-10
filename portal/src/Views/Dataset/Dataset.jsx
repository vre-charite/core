import React, { useState } from 'react';
import { StandardLayout } from '../../Components/Layout';
import FilePanel from '../../Components/Layout/FilePanel';
import { message } from 'antd';
import { datasetRoutes as routes } from '../../Routes/index';
import {
  withRouter,
  Switch,
  Route,
  Redirect,
  useParams,
} from 'react-router-dom';
import ToolBar from './Components/ToolBar';
import { getUserOnProjectAPI } from '../../APIs';
import { connect } from 'react-redux';
import { protectedRoutes } from '../../Utility';
import roleMap from '../../Utility/project-roles.json';

import _ from 'lodash';
function Dataset(props) {
  const {
    match: { path, params },
    containersPermission,
    role,
  } = props;
  const [userListOnDataset, setUserListOnDataset] = useState(null);

  const rolesDetail = [];

  for (const key in roleMap) {
    rolesDetail.push({
      value: roleMap[key] && roleMap[key].value,
      label: roleMap[key] && roleMap[key].label,
      description: roleMap[key] && roleMap[key].description,
    });
  }

  const { datasetId } = useParams();
  const containerDetails =
    containersPermission &&
    _.find(containersPermission, (item) => {
      return parseInt(item.id) === parseInt(params.datasetId);
    });

  const config = {
    observationVars: [params.datasetId, containersPermission, role],
    initFunc: () => {
      if (containersPermission !== null && role !== null) {
        const isAccess =
          role === 'admin' ||
          _.some(containersPermission, (item) => {
            return parseInt(item.id) === parseInt(params.datasetId);
          });

        if (!isAccess) {
          message.error('No Access to the Container');
          window.setTimeout(() => {
            props.history.push('/landing');
          }, 1000);
          return;
        }
      }
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
              if (!datasetId) {
                throw new Error(`datasetId undefined`);
              }
              let res = protectedRoutes(
                item.protectedType,
                true,
                datasetId,
                containersPermission,
                role,
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
                    getUsersOnDatasetAPI={getUserOnProjectAPI}
                    setUserListOnDataset={setUserListOnDataset}
                    rolesDetail={rolesDetail}
                  />
                );
              }
            }}
          ></Route>
        ))}
        <Redirect to="/error/404" />
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
