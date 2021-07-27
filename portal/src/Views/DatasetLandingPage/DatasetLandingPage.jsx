import React from 'react';
import { StandardLayout } from '../../Components/Layout';
import DatasetLandingContent from './DatasetLandingContent/DatasetLandingContent';

function DatasetLandingPage(props) {
  return (
    <StandardLayout leftMargin={false}>
      <DatasetLandingContent />
    </StandardLayout>
  );
}

export default DatasetLandingPage;
