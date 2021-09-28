import React, {useEffect} from 'react';
import { StandardLayout } from '../../Components/Layout';
import DatasetContent from './DatasetContent/DatasetContent'

function Dataset(props) {
  return (
    <StandardLayout leftMargin={false}>
      <DatasetContent />
    </StandardLayout>
  );
}

export default Dataset;
