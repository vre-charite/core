import React, { useState, Component, useEffect } from 'react';
import { Menu, message, Spin } from 'antd';
import {
  TeamOutlined,
  SettingOutlined,
  LoadingOutlined,
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { withRouter } from 'react-router-dom';
import GreenRoomUploader from './GreenRoomUploader';
import { connect } from 'react-redux';
import _ from 'lodash';
import style from './index.module.scss';
import { useCurrentProject } from '../../../Utility';
import AnnouncementButton from './AnnouncementButton';
import RequestAccessModal from './requestAccessModal';
import { getResourceRequestsAPI } from '../../../APIs';

const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;

const ToolBar = ({
  location: { pathname },
  match: { params },
  containersPermission,
  role,
  project,
  username,
}) => {
  const [isShown, toggleModal] = useState(false);
  const [iconSelected, toggleIcon] = useState(pathname.split('/')[3]);
  const [showRequestModal, toggleRequestModal] = useState(false);
  const [requestItem, setRequestItem] = useState('');
  const [requests, setRequests] = useState(null);
  const [superSetActive, setSuperSetActive] = useState(true);
  const [guacamoleActive, setGuacamoleActive] = useState(true);
  const adminPermission =
    role === 'admin' ||
    _.some(containersPermission, (item) => {
      return (
        parseInt(item.id) === parseInt(params.datasetId) &&
        item.permission === 'admin'
      );
    });
  let currentProject = useCurrentProject();
  currentProject = currentProject[0];
  const showJupyter = ['tvbcloud', 'indoctestproject', 'retunetest'].includes(
    currentProject?.code,
  );
  const showGuacamole =
    currentProject?.code === 'tvbcloud' ||
    currentProject?.code === 'indoctestproject';

  const showSuperset = ['indoctestproject'].includes(currentProject?.code);

  useEffect(() => {
    const getResourceRequests = async () => {
      const res = await getResourceRequestsAPI({});
      const { result } = res.data;
      if (result && result.length > 0) {
        setRequests(result);
        const superSetRequests = result.filter(
          (el) => el.requestFor === 'SuperSet',
        );
        const guacamoleRequests = result.filter(
          (el) => el.requestFor === 'Guacamole',
        );
        if (superSetRequests.length > 0) {
          if (currentProject) {
            const currentProjectRequest = superSetRequests.filter(
              (el) => el.projectGeid === currentProject.globalEntityId,
            );
            if (currentProjectRequest.length === 0) {
              // set true if this project doesn't have superSet request
              setSuperSetActive(true);
            } else if (currentProjectRequest.length > 0) {
              setSuperSetActive(currentProjectRequest[0].active);
            }
          }
        }
        if (guacamoleRequests.length > 0) {
          if (currentProject) {
            const currentProjectRequest = guacamoleRequests.filter(
              (el) => el.projectGeid === currentProject.globalEntityId,
            );
            if (currentProjectRequest.length === 0) {
              //set true if this project doesn't have Guacamole request
              setGuacamoleActive(true);
            }
            if (currentProjectRequest.length > 0) {
              setGuacamoleActive(currentProjectRequest[0].active);
            }
          }
        }
      }
    };

    getResourceRequests();
  }, [params.datasetId]);

  const superSet = (role, showSuperset, superSetActive) => {
    if (showSuperset) {
      if (role === 'admin' || superSetActive === false) {
        return (
          <Menu.Item key="superset">
            <a
              href={`/bi/${currentProject?.code}/superset/welcome`}
              //rel="noopener noreferrer"
              // eslint-disable-next-line
              target="_blank"
            >
              <span role="img" class="anticon">
                <img
                  style={{ height: 10 }}
                  src={require('../../../Images/SuperSet.svg')}
                />
              </span>
              <span>Superset</span>
            </a>
          </Menu.Item>
        );
      } else {
        return (
          <Menu.Item
            key="superset"
            onClick={() => {
              setRequestItem('Superset');
              toggleRequestModal(true);
            }}
          >
            <span role="img" class="anticon">
              <img
                style={{ height: 10 }}
                src={require('../../../Images/SuperSet.svg')}
              />
            </span>
            <span>Superset</span>
          </Menu.Item>
        );
      }
    } else {
      return (
        <Menu.Item
          key="superset"
          onClick={() => {
            message.info('This project does not have superset configured yet.');
          }}
        >
          <span role="img" class="anticon">
            <img
              style={{ height: 10 }}
              src={require('../../../Images/SuperSet.svg')}
            />
          </span>
          <span>Superset</span>
        </Menu.Item>
      );
    }
  };

  const guacamole = (role, showGuacamole, guacamoleActive) => {
    if (showGuacamole) {
      if (role === 'admin' || guacamoleActive === false) {
        return (
          <Menu.Item key="guacamole">
            <a
              href={`/workbench/${currentProject?.code}/guacamole/`}
              //rel="noopener noreferrer"
              // eslint-disable-next-line
              target="_blank"
            >
              <span role="img" class="anticon">
                <img
                  style={{ width: 14 }}
                  src={require('../../../Images/Guacamole.svg')}
                />
              </span>
              <span>Guacamole</span>
            </a>
          </Menu.Item>
        );
      } else {
        return (
          <Menu.Item
            key="guacamole"
            onClick={() => {
              setRequestItem('Guacamole');
              toggleRequestModal(true);
            }}
          >
            <span role="img" class="anticon">
              <img
                style={{ width: 14 }}
                src={require('../../../Images/Guacamole.svg')}
              />
            </span>
            <span>Guacamole</span>
          </Menu.Item>
        );
      }
    } else {
      return (
        <Menu.Item
          key="guacamole"
          onClick={() => {
            message.info(
              'This project does not have Guacamole configured yet.',
            );
          }}
        >
          <span role="img" class="anticon">
            <img
              style={{ width: 14 }}
              src={require('../../../Images/Guacamole.svg')}
            />
          </span>
          <span>Guacamole</span>
        </Menu.Item>
      );
    }
  };

  return (
    <>
      <Menu
        mode="inline"
        selectedKeys={[pathname.split('/')[3]]}
        className={style.upperMenu}
      >
        <Menu.Item key="canvas" onClick={() => toggleIcon('canvas')}>
          <Link to="canvas">
            {iconSelected === 'canvas' ? (
              <span role="img" class="anticon">
                <img
                  style={{ width: 15 }}
                  src={require('../../../Images/Dashboard-selected.svg')}
                />
              </span>
            ) : (
              <span role="img" class="anticon">
                <img
                  style={{ width: 15 }}
                  src={require('../../../Images/Dashboard.svg')}
                />
              </span>
            )}
            <span>Canvas</span>
          </Link>
        </Menu.Item>
        <Menu.Item
          title={null}
          key="announcement"
          onClick={() => toggleIcon('')}
        >
          <AnnouncementButton currentProject={currentProject} />
        </Menu.Item>
        {adminPermission && (
          <Menu.Item key="teams" onClick={() => toggleIcon('')}>
            <Link to="teams">
              <TeamOutlined />
              <span>Members</span>
            </Link>
          </Menu.Item>
        )}

        {adminPermission && (
          <Menu.Item key="settings" onClick={() => toggleIcon('')}>
            <Link to="settings">
              <SettingOutlined />
              <span>Settings</span>
            </Link>
          </Menu.Item>
        )}
      </Menu>

      <Menu
        mode="inline"
        className={style.lowerMenu}
        selectedKeys={[pathname.split('/')[3]]}
      >
        {superSet(role, showSuperset, superSetActive)}

        {guacamole(role, showGuacamole, guacamoleActive)}

        {showJupyter ? (
          <Menu.Item key="jupyter">
            <a
              href={`/workbench/${currentProject?.code}/j/`}
              //rel="noopener noreferrer"
              // eslint-disable-next-line
              target="_blank"
            >
              <span role="img" className="anticon">
                <img
                  style={{ width: 17 }}
                  src={require('../../../Images/Jupyter.svg')}
                />
              </span>
              <span>Jupyterhub</span>
            </a>
          </Menu.Item>
        ) : (
          <Menu.Item
            key="jupyter"
            onClick={() => {
              message.info(
                'This project does not have Jupyterhub configured yet.',
              );
            }}
          >
            <span role="img" className="anticon">
              <img
                style={{ width: 17 }}
                src={require('../../../Images/Jupyter.svg')}
              />
            </span>
            <span>Jupyterhub</span>
          </Menu.Item>
        )}

        <Menu.Item key="xwiki">
          <a
            href={`/xwiki/wiki/${currentProject?.code}/view/Main/`}
            //rel="noopener noreferrer"
            // eslint-disable-next-line
            target="_blank"
          >
            <span role="img" class="anticon">
              <img
                style={{ width: 18 }}
                src={require('../../../Images/XWIKI.svg')}
              />
            </span>
            <span>XWiki</span>
          </a>
        </Menu.Item>
      </Menu>
      <GreenRoomUploader
        isShown={isShown}
        cancel={() => {
          toggleModal(false);
        }}
        datasetId={parseInt(params.datasetId)}
      />
      <RequestAccessModal
        showRequestModal={showRequestModal}
        requestItem={requestItem}
        toggleRequestModal={toggleRequestModal}
        username={username && username}
        projectGeid={
          project && project.profile && project.profile.globalEntityId
        }
      />
    </>
  );
};

export default connect((state) => ({
  containersPermission: state.containersPermission,
  role: state.role,
  project: state.project,
  username: state.username,
}))(withRouter(ToolBar));
