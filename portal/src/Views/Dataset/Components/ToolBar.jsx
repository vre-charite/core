import React, { useState } from 'react';
import { Menu, message } from 'antd';
import {
  PieChartOutlined,
  UploadOutlined,
  TeamOutlined,
  DesktopOutlined,
  SettingOutlined,
  FileTextOutlined,
  ClusterOutlined,
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { withRouter } from 'react-router-dom';
import GreenRoomUploader from './GreenRoomUploader';
import { connect } from 'react-redux';
import _ from 'lodash';
import style from './index.module.scss';
import { useCurrentProject } from '../../../Utility';

const ToolBar = ({
  location: { pathname },
  match: { params },
  containersPermission,
  role,
}) => {
  const [isShown, toggleModal] = useState(false);
  const adminPermission =
    role === 'admin' ||
    _.some(containersPermission, (item) => {
      return (
        parseInt(item.id) === parseInt(params.datasetId) &&
        item.permission === 'admin'
      );
    });
  const currentProject = useCurrentProject();
  const showJupyter = ['tvbcloud', 'indoctestproject','retunetest'].includes(currentProject[0]?.code);
  const showGuacamole =
    currentProject[0]?.code === 'tvbcloud' ||
    currentProject[0]?.code === 'indoctestproject';
  return (
    <>
      <Menu
        mode="inline"
        selectedKeys={[pathname.split('/')[3]]}
        className={style.menu}
      >
        <Menu.Item key="canvas">
          <Link to="canvas">
            <PieChartOutlined />
            <span>Canvas</span>
          </Link>
        </Menu.Item>

        <Menu.Item
          key="uploader"
          onClick={() => {
            toggleModal(true);
          }}
        >
          <UploadOutlined />
          <span>Upload</span>
        </Menu.Item>

        {adminPermission && (
          <Menu.Item key="teams">
            <Link to="teams">
              <TeamOutlined />
              <span>Members</span>
            </Link>
          </Menu.Item>
        )}

        {showGuacamole ? (
          <Menu.Item key="guacamole">
            <a
              href={`/workbench/${currentProject[0]?.code}/guacamole/`}
              //rel="noopener noreferrer"
              // eslint-disable-next-line
              target="_blank"
            >
              <ClusterOutlined />
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
            <ClusterOutlined />
            <span>Guacamole</span>
          </Menu.Item>
        )}
        {showJupyter ? (
          <Menu.Item key="jupyter">
            <a
              href={`/workbench/${currentProject[0]?.code}/j/`}
              //rel="noopener noreferrer"
              // eslint-disable-next-line
              target="_blank"
            >
              <DesktopOutlined />
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
            <DesktopOutlined />
            <span>Jupyterhub</span>
          </Menu.Item>
        )}
        <Menu.Item key="xwiki">
          <a
            href={`/xwiki/bin/view/Main/${currentProject[0]?.code}/`}
            //rel="noopener noreferrer"
            // eslint-disable-next-line
            target="_blank"
          >
            <FileTextOutlined />
            <span>XWiki</span>
          </a>
        </Menu.Item>
        {adminPermission && (
          <Menu.Item key="settings">
            <Link to="settings">
              <SettingOutlined />
              <span>Settings</span>
            </Link>
          </Menu.Item>
        )}
      </Menu>
      {showGuacamole ? (
        <iframe
          title="guacamole"
          style={{ display: 'none', position: 'absolute', zIndex: -1 }}
          src={`/workbench/${currentProject[0]?.code}/guacamole/`}
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
