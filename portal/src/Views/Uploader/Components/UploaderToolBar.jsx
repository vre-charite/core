import React, { useState } from 'react';
import { Layout, Menu} from 'antd';
import { withRouter } from 'react-router-dom';
import {
  PlusOutlined,
} from '@ant-design/icons';
import UploaderModalDataset from '../../../Components/Modals/UploaderModalDataset';
import CreateDatasetModal from '../../../Components/Modals/CreateDatasetModal';
import { connect } from 'react-redux';
import { withCookies } from 'react-cookie';
import {
  setPersonalDatasetIdCreator,
  setContainersPermissionCreator,
} from '../../../Redux/actions';

const { Sider } = Layout;


function UploaderToolBar(props) {
  let [isUploaderModalDatasetShow, toggleUploaderModalDatasetShow] = useState(
    false,
  );
  const [isCreateDatasetModalShown, toggleCreateDataset] = useState(false);

  return (
    <>
      <Sider collapsed={true} reverseArrow={true} trigger={null} theme="light">
        <Menu
          defaultSelectedKeys={['dashboard']}
          mode="inline"
          style={{ position: 'fixed' }}
        >
          {props.role === 'admin' && (
            <Menu.Item
              key="dataset"
              onClick={() => {
                toggleCreateDataset(true);
              }}
            >
              <PlusOutlined />
              <span>New Project</span>
            </Menu.Item>
          )}
        </Menu>
      </Sider>
      <UploaderModalDataset
        isShown={isUploaderModalDatasetShow}
        cancel={() => {
          toggleUploaderModalDatasetShow(false);
        }}
      />

      <CreateDatasetModal
        visible={isCreateDatasetModalShown}
        cancel={() => {
          toggleCreateDataset(false);
        }}
      ></CreateDatasetModal>
    </>
  );
}

export default connect(
  (state) => ({ personalDatasetId: state.personalDatasetId, role: state.role }),
  { setContainersPermissionCreator, setPersonalDatasetIdCreator },
)(withRouter(withCookies(UploaderToolBar)));
