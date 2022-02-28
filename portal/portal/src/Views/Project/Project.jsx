import React, { useEffect, useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { StandardLayout } from '../../Components/Layout';
import { message } from 'antd';
import { projectRoutes as routes } from '../../Routes/index';
import {
  withRouter,
  Switch,
  Route,
  Redirect,
  useParams,
  useLocation,
} from 'react-router-dom';
import ToolBar from './Components/ToolBar';
import { getUserOnProjectAPI, getProjectInfoAPI } from '../../APIs';
import { connect } from 'react-redux';
import { protectedRoutes, getCurrentProject } from '../../Utility';
import roleMap from '../../Utility/project-roles.json';
import {
  triggerEvent,
  setCurrentProjectProfile,
  setCurrentProjectManifest,
  setFolderRouting,
  clearCurrentProject,
} from '../../Redux/actions';

import _ from 'lodash';
function Dataset(props) {
  const { pathname } = useLocation();
  const project = useSelector((state) => state.project);
  const dispatch = useDispatch();
  const { params } = props.match;
  const currentProject = getCurrentProject(params.datasetId);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  useEffect(() => {
    if (params.datasetId) {
      dispatch(clearCurrentProject());
      getProjectInfoAPI(currentProject.globalEntityId).then((res) => {
        if (res.status === 200 && res.data && res.data.code === 200) {
          const currentDataset = res.data.result;
          dispatch(setCurrentProjectProfile(currentDataset));
          dispatch(
            setCurrentProjectManifest({
              tags: currentDataset && currentDataset.systemTags,
            }),
          );
        }
      });
    }
    dispatch(setFolderRouting({}));
  }, []);

  useEffect(() => {
    if (project.profile) {
      dispatch(triggerEvent('LOAD_COPY_LIST'));
      dispatch(triggerEvent('LOAD_DELETED_LIST'));
    }
  }, [project.profile]);

  const {
    match: { path },
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
    <StandardLayout {...config} leftContent={<ToolBar />}>
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
                    getUserOnProjectAPI={getUserOnProjectAPI}
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
    </StandardLayout>
  );
}

export default connect((state) => ({
  containersPermission: state.containersPermission,
  role: state.role,
  datasetList: state.datasetList,
}))(withRouter(Dataset));
