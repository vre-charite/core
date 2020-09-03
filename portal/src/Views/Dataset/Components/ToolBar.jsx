import React, { useState } from "react";
import { Menu } from "antd";
import {
  DesktopOutlined,
  PieChartOutlined,
  UploadOutlined,
  TeamOutlined,
  SettingOutlined,
  FileSearchOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { Link } from "react-router-dom";
import { withRouter } from "react-router-dom";
import GreenRoomUploader from "./GreenRoomUploader";
import { connect } from "react-redux";
import _ from "lodash";
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
    role === "admin" ||
    _.some(containersPermission, (item) => {
      return (
        parseInt(item.container_id) === parseInt(params.datasetId) &&
        item.permission === "admin"
      );
    });

  return (
    <>
      <Menu mode="inline" selectedKeys={[pathname.split("/")[3]]}>
        <Menu.Item key="canvas">
          <Link to="canvas">
            <PieChartOutlined />
            <span>canvas</span>
          </Link>
        </Menu.Item>
        {/* <Menu.Item title={"workspace"} key="workspace">
          <Link to="workspace">
            <DesktopOutlined />
          </Link>
        </Menu.Item> */}
        {/* <Menu.Item
          key="dataset"
          onClick={() => {
            toggleCreateDataset(true);
          }}
        >
          <PlusOutlined />
          <span>New Dataset</span>
        </Menu.Item> */}

         <Menu.Item
          key="uploader"
          onClick={() => {
            toggleModal(true);
          }}
        >
          <UploadOutlined />
          <span>Uploader</span>
        </Menu.Item>
        {/* <Menu.Item key="files">
          <Link to="files">
            <FileSearchOutlined />
            <span>Files</span>
          </Link>
        </Menu.Item> */}
        {adminPermission && (
          <Menu.Item key="teams">
            <Link to="teams">
              <TeamOutlined />
              <span>Teams</span>
            </Link>
          </Menu.Item>
        )}

        {/* <Menu.Item key="setting">
          <SettingOutlined />
          <span>Setting</span>
        </Menu.Item> */}
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
