import React, { useState } from 'react';
import { Layout, Menu } from 'antd';
import { withRouter } from 'react-router-dom';
import { MailOutlined } from '@ant-design/icons';
import CreateEmailModal from '../../../Components/Modals/CreateEmailModal';
import { connect } from 'react-redux';
import { withCookies } from 'react-cookie';
import {
  setPersonalDatasetIdCreator,
  setContainersPermissionCreator,
} from '../../../Redux/actions';

const { Sider } = Layout;

function UserManagementToolBar(props) {
  const [isCreateEmailModalShown, toggleCreateEmailModal] = useState(false);

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
                toggleCreateEmailModal(true);
              }}
            >
              <MailOutlined />
              <span>Send Email</span>
            </Menu.Item>
          )}
        </Menu>
      </Sider>

      <CreateEmailModal
        visible={isCreateEmailModalShown}
        setVisble={toggleCreateEmailModal}
      ></CreateEmailModal>
    </>
  );
}

export default connect(
  (state) => ({ personalDatasetId: state.personalDatasetId, role: state.role }),
  { setContainersPermissionCreator, setPersonalDatasetIdCreator },
)(withRouter(withCookies(UserManagementToolBar)));
