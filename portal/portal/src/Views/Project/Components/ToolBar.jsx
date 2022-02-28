import React, { useState, Component, useEffect } from 'react';
import { Menu, message, Badge } from 'antd';
import {
  TeamOutlined,
  SettingOutlined,
  LoadingOutlined,
  SearchOutlined,
  PullRequestOutlined,
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
import {
  getResourceRequestsAPI,
  getWorkbenchInfo,
  listAllCopyRequests,
} from '../../../APIs';
import { useTranslation } from 'react-i18next';

const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;

const ToolBar = ({
  location: { pathname },
  match: { params },
  containersPermission,
  role,
  project,
  username,
}) => {
  const { t } = useTranslation(['errormessages', 'success']);
  const [isShown, toggleModal] = useState(false);
  const [showRequestToCoreRedDot, setShowRequestToCoreRedDot] = useState(false);
  const [iconSelected, toggleIcon] = useState(pathname.split('/')[3]);
  const [showRequestModal, toggleRequestModal] = useState(false);
  const [requestItem, setRequestItem] = useState('');
  const [requests, setRequests] = useState(null);
  const [superSetActive, setSuperSetActive] = useState(true);
  const [guacamoleActive, setGuacamoleActive] = useState(true);
  const [guacamoleDeployed, setGuacamoleDeployed] = useState('');
  const [supersetDeployed, setSupersetDeployed] = useState('');
  const [jupyterhubDeployed, setJupyterhubDeployed] = useState('');

  const adminPermission =
    role === 'admin' ||
    _.some(containersPermission, (item) => {
      return (
        parseInt(item.id) === parseInt(params.datasetId) &&
        item.permission === 'admin'
      );
    });
  const collaboratorPermission = _.some(containersPermission, (item) => {
    return (
      parseInt(item.id) === parseInt(params.datasetId) &&
      item.permission === 'collaborator'
    );
  });
  let currentProject = useCurrentProject();
  currentProject = currentProject[0];
  const projectGeid = currentProject?.globalEntityId;

  const getWorkbenchInformation = async () => {
    try {
      const res = await getWorkbenchInfo(currentProject?.globalEntityId);
      const workbenchKeys = Object.keys(res.data.result);
      if (workbenchKeys.length > 0) {
        if (workbenchKeys.includes('guacamole')) {
          setGuacamoleDeployed(res.data.result['guacamole'].deployed);
        } else {
          setGuacamoleDeployed(false);
        }
        if (workbenchKeys.includes('superset')) {
          setSupersetDeployed(res.data.result['superset'].deployed);
        } else {
          setSupersetDeployed(false);
        }
        if (workbenchKeys.includes('jupyterhub')) {
          setJupyterhubDeployed(res.data.result['jupyterhub'].deployed);
        } else {
          setJupyterhubDeployed(false);
        }
      } else {
        setGuacamoleDeployed(false);
        setSupersetDeployed(false);
        setJupyterhubDeployed(false);
      }
    } catch (error) {
      message.error(t('errormessages:projectWorkench.getWorkbench.default.0'));
    }
  };

  useEffect(() => {
    if (currentProject?.permission !== 'contributor') getWorkbenchInformation();
  }, [project.workbenchDeployedCounter]);

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

    const requestToCorePendingCheck = async () => {
      const res = await listAllCopyRequests(projectGeid, 'pending', 0, 10);
      if (res.data.result.length) {
        const requestToCoreTimeRecord = new Date(
          localStorage.getItem('requestToCoreTimeRecord'),
        );
        const latestRequestToCoreTime = new Date(
          res.data.result[0].submittedAt,
        );
        if (latestRequestToCoreTime > requestToCoreTimeRecord) {
          setShowRequestToCoreRedDot(true);
        }
      }
    };

    getResourceRequests();
    requestToCorePendingCheck();
  }, [params.datasetId]);

  const superSet = (
    platFormRole,
    projectRole,
    supersetDeployed,
    superSetActive,
  ) => {
    if (projectRole === 'contributor') {
      return null;
    }
    if (supersetDeployed === true) {
      if (platFormRole === 'admin' || superSetActive === false) {
        return (
          <Menu.Item key="superset">
            <a
              href={`/bi/${currentProject?.code}/superset/welcome`}
              //rel="noopener noreferrer"
              // eslint-disable-next-line
              target="_blank"
            >
              <span role="img" className="anticon">
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
            <span role="img" className="anticon">
              <img
                style={{ height: 10 }}
                src={require('../../../Images/SuperSet.svg')}
              />
            </span>
            <span>Superset</span>
          </Menu.Item>
        );
      }
    } else if (supersetDeployed === false) {
      return (
        <Menu.Item
          key="superset"
          onClick={() => {
            message.info('This project does not have superset configured yet.');
          }}
        >
          <span role="img" className="anticon">
            <img
              style={{ height: 10 }}
              src={require('../../../Images/SuperSet.svg')}
            />
          </span>
          <span>Superset</span>
        </Menu.Item>
      );
    } else {
      return null;
    }
  };

  const guacamole = (
    platFormRole,
    projectRole,
    guacamoleDeployed,
    guacamoleActive,
  ) => {
    if (projectRole === 'contributor') {
      return null;
    }
    if (guacamoleDeployed === true) {
      if (platFormRole === 'admin' || guacamoleActive === false) {
        return (
          <Menu.Item key="guacamole">
            <a
              href={`/workbench/${currentProject?.code}/guacamole/`}
              //rel="noopener noreferrer"
              // eslint-disable-next-line
              target="_blank"
            >
              <span role="img" className="anticon">
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
            <span role="img" className="anticon">
              <img
                style={{ width: 14 }}
                src={require('../../../Images/Guacamole.svg')}
              />
            </span>
            <span>Guacamole</span>
          </Menu.Item>
        );
      }
    } else if (guacamoleDeployed === false) {
      return (
        <Menu.Item
          key="guacamole"
          onClick={() => {
            message.info(
              'This project does not have Guacamole configured yet.',
            );
          }}
        >
          <span role="img" className="anticon">
            <img
              style={{ width: 14 }}
              src={require('../../../Images/Guacamole.svg')}
            />
          </span>
          <span>Guacamole</span>
        </Menu.Item>
      );
    } else {
      return null;
    }
  };

  const jupyterhub = (projectRole, jupyterhubDeployed) => {
    if (projectRole === 'contributor') {
      return null;
    }
    if (jupyterhubDeployed === true) {
      return (
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
      );
    } else if (jupyterhubDeployed === false) {
      return (
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
      );
    } else {
      return null;
    }
  };

  const handleRequestToCoreOnClick = () => {
    toggleIcon('');
    setShowRequestToCoreRedDot(false);
  };

  return (
    <>
      <Menu
        id="side-bar"
        mode="inline"
        selectedKeys={[pathname.split('/')[3]]}
        className={style.upperMenu}
      >
        <Menu.Item key="canvas" onClick={() => toggleIcon('canvas')}>
          <Link to="canvas">
            {iconSelected === 'canvas' ? (
              <span role="img" className="anticon">
                <img
                  style={{ width: 15 }}
                  src={require('../../../Images/Dashboard-selected.svg')}
                />
              </span>
            ) : (
              <span role="img" className="anticon">
                <img
                  style={{ width: 15 }}
                  src={require('../../../Images/Dashboard.svg')}
                />
              </span>
            )}
            <span>Canvas</span>
          </Link>
        </Menu.Item>
        <Menu.Item key="search" onClick={() => toggleIcon('')}>
          <Link to="search">
            <SearchOutlined />
            <span>Search</span>
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
        {(adminPermission || collaboratorPermission) && (
          <Menu.Item key="requestToCore" onClick={handleRequestToCoreOnClick}>
            <Link to="requestToCore">
              <PullRequestOutlined />
              <span>Requests</span>
            </Link>
          </Menu.Item>
        )}
        {(adminPermission || collaboratorPermission) && (
          <>
            {showRequestToCoreRedDot && (
              <Menu.Item
                key="request-dot"
                style={{
                  marginTop: -30,
                  width: 10,
                  height: 10,
                  marginLeft: 31,
                  marginBottom: 35,
                  pointerEvents: 'none',
                }}
              >
                <Badge className={style.badge} status={'error'}>
                  {' '}
                </Badge>
              </Menu.Item>
            )}
          </>
        )}
      </Menu>

      <Menu
        mode="inline"
        className={style.lowerMenu}
        selectedKeys={[pathname.split('/')[3]]}
      >
        {superSet(
          role,
          currentProject?.permission,
          supersetDeployed,
          superSetActive,
        )}

        {guacamole(
          role,
          currentProject?.permission,
          guacamoleDeployed,
          guacamoleActive,
        )}

        {jupyterhub(currentProject?.permission, jupyterhubDeployed)}

        <Menu.Item key="xwiki">
          <a
            href={`/xwiki/wiki/${currentProject?.code}/view/Main/`}
            //rel="noopener noreferrer"
            // eslint-disable-next-line
            target="_blank"
          >
            <span role="img" className="anticon">
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
