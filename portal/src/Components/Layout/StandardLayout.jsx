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

import React, { useEffect } from 'react';
import { Layout } from 'antd';
import AppHeader from './Header';
import Footer from './Footer';
import LeftSider from './LeftSider';
import { withRouter, Switch } from 'react-router-dom';
import { connect } from 'react-redux';
import styles from './index.module.scss';
import { useSelector, useDispatch } from 'react-redux';
import { getAllNotifications } from '../../APIs';
import MaintenanceWarningModel from '../Modals/MaintenanceWarningModel';
import { notificationActions } from '../../Redux/actions';
const { Content } = Layout;
function StandardLayout(props) {
  const {
    observationVars = [],
    initFunc = () => {},
    leftContent,
    children,
    leftMargin = true,
  } = props;

  useEffect(() => {
    initFunc();
    // eslint-disable-next-line
  }, [...observationVars]);
  const { updateNotificationTimes } = useSelector(
    (state) => state.notifications,
  );
  const dispatch = useDispatch();
  useEffect(() => {
    async function initData() {
      const res = await getAllNotifications();
      const listData = res.data?.result?.result;
      if (listData && listData.length) {
        dispatch(notificationActions.setNotificationList(listData));
      }
    }
    initData();
  }, [updateNotificationTimes]);
  useEffect(() => {
    const interval = setInterval(() => {
      dispatch(
        notificationActions.setUpdateNotificationTimes(
          (updateNotificationTimes) => updateNotificationTimes + 1,
        ),
      );
    }, 60 * 1000);
    return () => clearInterval(interval);
  }, []);
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <AppHeader />
      <Content>
        <Layout>
          <Layout
            style={{ marginLeft: leftMargin ? '50px' : 0 }}
            className={styles.layout_wrapper}
            id="layout-wrapper"
          >
            {children}
            <Footer />
          </Layout>
          {leftContent && <LeftSider>{leftContent}</LeftSider>}
        </Layout>
      </Content>
      <MaintenanceWarningModel />
    </Layout>
  );
}

export default withRouter(connect(null, null)(StandardLayout));
