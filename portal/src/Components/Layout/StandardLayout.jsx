import React, { useEffect } from 'react';
import { Layout } from 'antd';
import AppHeader from './Header';
import Footer from './Footer';

import RightSlider from './RightSlider';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import {} from '../../Utility';

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
    // eslint-disable-next-line
  }, [...observationVars]);

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <AppHeader />
      <Content>
        <Layout>
          <Layout>
            {children}
            <Footer />
          </Layout>
          {rightContent && <RightSlider>{rightContent}</RightSlider>}
        </Layout>
      </Content>
    </Layout>
  );
}

export default withRouter(connect(null, null)(StandardLayout));
