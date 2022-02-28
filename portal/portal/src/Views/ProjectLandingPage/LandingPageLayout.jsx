import React from 'react';
import { StandardLayout } from '../../Components/Layout';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import LandingPageContent from './LandingPageContent/LandingPageContent';
import styles from './LandingPageContent/index.module.scss';

function LandingPageLayout(props) {
  const config = {
    observationVars: [],
    initFunc: () => {},
  };
  return (
    <StandardLayout className={styles.landingPageLayout}>
      <LandingPageContent />
    </StandardLayout>
  );
}

export default connect((state) => ({
  role: state.role,
}))(withRouter(LandingPageLayout));
