import React, { useState } from 'react';
import { Layout, Menu } from 'antd';
import { withRouter } from 'react-router-dom';
import { PlusOutlined } from '@ant-design/icons';
import UploaderModalDataset from '../../../../Components/Modals/UploaderModalDataset';
import CreateDatasetModal from '../../../../Components/Modals/CreateDatasetModal';
import { connect } from 'react-redux';
import { withCookies } from 'react-cookie';
import {
  setPersonalDatasetIdCreator,
  setContainersPermissionCreator,
} from '../../../../Redux/actions';
import styles from './index.module.scss';

const { Sider } = Layout;

function LandingPageToolBar(props) {
  let [isUploaderModalDatasetShow, toggleUploaderModalDatasetShow] = useState(
    false,
  );
  const [isCreateDatasetModalShown, toggleCreateDataset] = useState(false);
  return (
    <>
      <Sider collapsed={true} reverseArrow={true} trigger={null}>
        <Menu
          className={styles.menu}
          mode="inline"
          style={{
            position: 'fixed',
            backgroundColor: '#003262',
            width: '51px',
            maxWidth: '51px',
            minWidth: '51px',
            marginTop: 22,
          }}
        >
          {props.role === 'admin' && (
            <Menu.Item
              style={{ left: '-14px' }}
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
)(withRouter(withCookies(LandingPageToolBar)));
