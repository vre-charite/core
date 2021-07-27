import React from 'react';
import { ExplorerActions } from '../ExplorerActions/ExplorerActions';
import { ExplorerTree } from '../ExplorerTree/ExplorerTree';
import { DatasetCard as Card } from '../../../Components/DatasetCard/DatasetCard';
import styles from './DatasetDataExplorer.module.scss';

export default function DatasetDataExplorer(props) {
  return (
    <Card className={styles['card']} title="Explorer">
      <ExplorerActions />
      <ExplorerTree />
    </Card>
  );
}
