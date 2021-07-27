import React, { useEffect } from 'react';
import { Layout } from 'antd';
import AppHeader from './Header';
import Footer from './Footer';
import LeftSider from './LeftSider';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';

const { Content } = Layout;
function StandardLayout(props) {
  const {
    observationVars = [],
    initFunc = () => {},
    leftContent,
    children,
    leftMargin=true,
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
          <Layout style={{ marginLeft: leftMargin?'50px':0 }}>
            {children}
            <Footer />
          </Layout>
          {leftContent && <LeftSider>{leftContent}</LeftSider>}
        </Layout>
      </Content>
    </Layout>
  );
}

export default withRouter(connect(null, null)(StandardLayout));
