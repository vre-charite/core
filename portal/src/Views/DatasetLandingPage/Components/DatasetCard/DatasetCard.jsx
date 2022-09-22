// Copyright 2022 Indoc Research
// 
// Licensed under the EUPL, Version 1.2 or – as soon they
// will be approved by the European Commission - subsequent
// versions of the EUPL (the "Licence");
// You may not use this work except in compliance with the
// Licence.
// You may obtain a copy of the Licence at:
// 
// https://joinup.ec.europa.eu/collection/eupl/eupl-text-eupl-12
// 
// Unless required by applicable law or agreed to in
// writing, software distributed under the Licence is
// distributed on an "AS IS" basis,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
// express or implied.
// See the Licence for the specific language governing
// permissions and limitations under the Licence.
// 

import React, { useState } from 'react';
import { Card, Tag } from 'antd';
import { DownCircleTwoTone, UpCircleTwoTone } from '@ant-design/icons';
import styles from './DatasetCard.module.scss';
import DatasetCardTitle from '../DatasetCardTitle/DatasetCardTitle';
import { getFileSize, getTags } from '../../../../Utility';
import moment from 'moment';

export default function DatasetCard(props) {
  const {
    title,
    creator,
    timeCreated,
    description,
    tags,
    size,
    totalFiles,
    code,
  } = props.dataset;
  const [isExpand, setIsExpand] = useState(false);

  const toggleExpand = () => {
    setIsExpand((preValue) => !preValue);
  };

  return (
    <div className={styles['dataset-card']}>
      <Card>
        <div className={styles['left']}>
          <DatasetCardTitle title={title} code={code} />
          <div className={styles['dataset-card-note']}>
            <b>
              Dataset Code: {code} / Created on{' '}
              {moment.utc(timeCreated).local().format('YYYY-MM-DD')}
            </b>{' '}
            by {creator || 'N/A'}
          </div>
          {isExpand && <Description>{description}</Description>}
        </div>

        <div className={styles['right']}>
          <div className={styles['statistics-container']}>
            <Statistics label="Files">{totalFiles}</Statistics>
            <Statistics label="Size">{getFileSize(size)}</Statistics>
          </div>
          <div className={styles['tags-container']}>{getTags(tags)}</div>
        </div>

        <div onClick={toggleExpand} className={styles['expand']}>
          {isExpand ? <UpCircleTwoTone /> : <DownCircleTwoTone />}
        </div>
      </Card>
    </div>
  );
}

const Statistics = (props) => {
  const { label, children } = props;
  return (
    <span className={styles['statistics']}>
      <span className={styles['statistics-title']}>{label}</span>
      <span className={styles['statistics-value']}>{children}</span>
    </span>
  );
};

const Description = (props) => {
  const { children } = props;
  return (
    <div className={styles['description']}>
      <div>Description:</div>
      <p>{children || 'N/A'}</p>
    </div>
  );
};
