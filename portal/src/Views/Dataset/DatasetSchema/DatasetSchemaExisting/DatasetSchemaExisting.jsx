import React from 'react';
import { DatasetCard as Card } from '../../Components/DatasetCard/DatasetCard';
import { ExistingSchemaContents } from '../Components/ExistingSchemaContents/ExistingSchemaContents';
import styles from './DatasetSchemaExisting.module.scss';

export default function DatasetSchemaExisting(props) {
  return (
    <Card className={styles['card']} title="Existing Schema">
      <ExistingSchemaContents />
    </Card>
  );
}
