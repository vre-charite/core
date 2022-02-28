import React from 'react';
import { Card } from 'antd';
import styles from './DatasetCard.module.scss';
import _ from 'lodash';

export function DatasetCard(props) {
  const { className } = props;
  return (
    <Card
      className={`${styles['card']} ${className}`}
      {..._.omit(props, ['className'])}
    ></Card>
  );
}
