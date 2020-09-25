import React, { useState, useEffect } from 'react';
import { StandardLayout } from '../../Components/Layout';
import FilePanel from '../../Components/Layout/FilePanel';
import { datasetRoutes as routes } from '../../Routes/index';
import { withRouter, Switch, Route, Redirect } from 'react-router-dom';
import UploaderContent from './UploaderContent/UploaderContent';
import ToolBar from './Components/UploaderToolBar';

function Uploader(props) {
  const {
    match: { path, params },
  } = props;
  const config = {
    observationVars: [],
    initFunc: () => {},
  };
  return (
    <StandardLayout {...config} rightContent={<ToolBar />}>
      <UploaderContent />
      <FilePanel />
    </StandardLayout>
  );
}

export default withRouter(Uploader);
