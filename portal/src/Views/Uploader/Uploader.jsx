import React from 'react';
import { StandardLayout } from '../../Components/Layout';
import FilePanel from '../../Components/Layout/FilePanel';
import { withRouter } from 'react-router-dom';
import UploaderContent from './UploaderContent/UploaderContent';
import ToolBar from './Components/UploaderToolBar';

function Uploader(props) {
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
