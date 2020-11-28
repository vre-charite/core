import React, { useState } from 'react';
import { Menu, message } from 'antd';
import {
  PieChartOutlined,
  UploadOutlined,
  TeamOutlined,
  DesktopOutlined,
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
        parseInt(item.containerId) === parseInt(params.datasetId) &&
        item.permission === 'admin'
      );
    });
  const currentProject = useCurrentProject();
  const istvbCloud = currentProject[0]?.code === 'tvbcloud';

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

        {istvbCloud ? (
          <Menu.Item key="jupyter">
            <a href={`/vre/workbench/j/${currentProject[0]?.code}/`} target="_blank">
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
      </Menu>
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
