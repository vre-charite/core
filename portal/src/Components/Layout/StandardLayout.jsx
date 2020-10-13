import React, { useState, useEffect } from 'react';
import { Layout } from 'antd';
import AppHeader from './Header';

import RightSlider from './RightSlider';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import {} from '../../Utility';
import { useSelector, useDispatch } from 'react-redux';
import {
  updateUploadItemCreator,
  updateClearIdCreator,
  setSuccessNum,
} from '../../Redux/actions';
import { namespace, ErrorMessager } from '../../ErrorMessages';
import { checkPendingStatusAPI } from '../../APIs';
import _ from 'lodash';
import Promise from 'bluebird';

const { Content } = Layout;
function StandardLayout(props) {
  const {
    observationVars = [],
    initFunc = () => {},
    rightContent,
    children,
  } = props;


  useEffect(() => {
    initFunc();
  }, [...observationVars]);

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <AppHeader />
      <Content>
        <Layout>
          {children}
          {rightContent && <RightSlider>{rightContent}</RightSlider>}
        </Layout>
      </Content>
    </Layout>
  );
}

export default withRouter(connect(null, null)(StandardLayout));
