import React from 'react';
import styles from './DatasetSchema.module.scss';
import DatasetSchemaExisting from './DatasetSchemaExisting/DatasetSchemaExisting';
import DatasetSchemaTemplates from './DatasetSchemaTemplates/DatasetSchemaTemplates'


export default function DatasetData(props) {
  return (
    <div className={styles['container']}>
     <div className={styles['existing-schema']}>
         <DatasetSchemaExisting />
     </div>
     <div className={styles['blank-templates']}>
         <DatasetSchemaTemplates />
     </div>
    </div>
  );
}
