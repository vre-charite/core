import React  from 'react';
import {DatasetCard as Card} from '../../Components/DatasetCard/DatasetCard';
import SchemaTemplates from '../Components/SchemaTemplates/SchemaTemplates';
import styles from './DatasetSchemaTemplates.module.scss';

export default function DatasetSchemaTemplates(props) {
    return (
      <Card className={styles.card} title="Schemas">
        <SchemaTemplates />
      </Card>
    );
}