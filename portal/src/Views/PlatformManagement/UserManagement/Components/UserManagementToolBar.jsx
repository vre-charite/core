// Copyright 2022 Indoc Research
// 
// Licensed under the EUPL, Version 1.2 or – as soon they
// will be approved by the European Commission - subsequent
// versions of the EUPL (the "Licence");
// You may not use this work except in compliance with the
// Licence.
// You may obtain a copy of the Licence at:
// 
// https://joinup.ec.europa.eu/collection/eupl/eupl-text-eupl-12
// 
// Unless required by applicable law or agreed to in
// writing, software distributed under the Licence is
// distributed on an "AS IS" basis,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
// express or implied.
// See the Licence for the specific language governing
// permissions and limitations under the Licence.
// 

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
import styles from '../index.module.scss';
const { Sider } = Layout;

function UserManagementToolBar(props) {
  const [isCreateEmailModalShown, toggleCreateEmailModal] = useState(false);

  return (
    <>
      <Sider collapsed={true} reverseArrow={true} trigger={null} theme="light">
        <Menu
          defaultSelectedKeys={['dashboard']}
          mode="inline"
          className={styles.upperMenu}
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
