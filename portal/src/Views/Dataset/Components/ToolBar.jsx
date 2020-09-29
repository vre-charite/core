import React, { useState } from 'react';
import { Menu } from 'antd';
import {
  DesktopOutlined,
  PieChartOutlined,
  UploadOutlined,
  TeamOutlined,
  SettingOutlined,
  FileSearchOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { withRouter } from 'react-router-dom';
import GreenRoomUploader from './GreenRoomUploader';
import { connect } from 'react-redux';
import _ from 'lodash';
import style from './index.module.scss';
const { SubMenu } = Menu;

const ToolBar = ({
  location: { pathname },
  match: { params },
  containersPermission,
  role,
}) => {
  const [isShown, toggleModal] = useState(false);
  const [isCreateDatasetModalShown, toggleCreateDataset] = useState(false);
  const adminPermission =
    role === 'admin' ||
    _.some(containersPermission, (item) => {
      return (
        parseInt(item.container_id) === parseInt(params.datasetId) &&
        item.permission === 'admin'
      );
    });

  return (
    <>
      <Menu mode="inline" selectedKeys={[pathname.split('/')[3]]} className={style.menu}>
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
              <span>Teams</span>
            </Link>
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
