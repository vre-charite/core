import React, { useState, Component, useEffect } from 'react';
import { Menu, message, List } from 'antd';
import { TeamOutlined, SettingOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { withRouter } from 'react-router-dom';
import GreenRoomUploader from './GreenRoomUploader';
import { connect } from 'react-redux';
import _ from 'lodash';
import style from './index.module.scss';
import { useCurrentProject } from '../../../Utility';
import AnnouncementButton from './AnnouncementButton';

const ToolBar = ({
  location: { pathname },
  match: { params },
  containersPermission,
  role,
}) => {
  const [isShown, toggleModal] = useState(false);
  const [iconSelected, toggleIcon] = useState(pathname.split('/')[3]);

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
        {showSuperset ? (
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
        ) : (
          <Menu.Item
            key="superset"
            onClick={() => {
              message.info(
                'This project does not have superset configured yet.',
              );
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
        )}
        {showGuacamole ? (
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
        ) : (
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
        )}
        {showJupyter ? (
          <Menu.Item key="jupyter">
            <a
              href={`/workbench/${currentProject?.code}/j/`}
              //rel="noopener noreferrer"
              // eslint-disable-next-line
              target="_blank"
            >
              <span role="img" class="anticon">
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
            <span role="img" class="anticon">
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
            href={`/xwiki/bin/view/Main/${currentProject?.code}/`}
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
      {showGuacamole ? (
        <iframe
          title="guacamole"
          style={{ display: 'none', position: 'absolute', zIndex: -1 }}
          src={`/workbench/${currentProject?.code}/guacamole/`}
        ></iframe>
      ) : null}
      <GreenRoomUploader
        isShown={isShown}
        cancel={() => {
          toggleModal(false);
        }}
        datasetId={parseInt(params.datasetId)}
      />
    </>
  );
};

export default connect((state) => ({
  containersPermission: state.containersPermission,
  role: state.role,
}))(withRouter(ToolBar));
