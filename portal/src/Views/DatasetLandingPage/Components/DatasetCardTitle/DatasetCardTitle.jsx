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

import React from 'react';
import { PageHeader, Tooltip } from 'antd';
import { Link } from 'react-router-dom';
import styles from './DatasetCardTitle.module.scss';

export default function DatasetCardHeader(props) {
  const { title,code } = props;

  return (
    <PageHeader
      ghost={true}
      style={{
        padding: '0px 0px 0px 0px',
      }}
      title={getTitle(title,code)}
    ></PageHeader>
  );
}

const getTitle = (title,code) => {
  const titleComponent =
    title.length > 40 ? (
      <Tooltip title={title}>
        <div className={styles['toolTip-div']}>
          <Link to={`/dataset/${code}/home`}>
            <span>{title}</span>
          </Link>
        </div>
      </Tooltip>
    ) : (
      <div className={styles['no-toolTip-div']}>
        <Link to={`/dataset/${code}/home`}>
          <span>{title}</span>
        </Link>
      </div>
    );

  return titleComponent;
};
