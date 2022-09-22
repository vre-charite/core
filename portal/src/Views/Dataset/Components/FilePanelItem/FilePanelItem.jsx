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
import { List, Tooltip } from 'antd';
import styles from './FilePanelItem.module.scss';
import { WarningOutlined } from '@ant-design/icons';
import _ from 'lodash';
const getPopupContainer = (node) => node.parentNode;
export function FilePanelItem(props) {
  const { icon, status, originalFullPath } = props;
  const statusLowerCase = _.lowerCase(status);
  const isError = statusLowerCase === 'error';
  const title = (
    <div className={styles['title']}>
      {isError ? <WarningOutlined className={styles['icon']} /> : icon}
      <Tooltip getPopupContainer={getPopupContainer} title={originalFullPath}>
        <div className={styles['file-name']}>
          {/** add \u200E,which is Left-to-right mark https://en.wikipedia.org/wiki/Left-to-right_mark.
           * Since we use direction:rtl in css,without \u200E,
           *  the punctuation at the end will be moved to the left */}
          <div>{originalFullPath + '\u200E'}</div>
        </div>
      </Tooltip>{' '}
      <i className={styles['status']}>
        {' '}
        -{' '}
        {statusLowerCase === 'init' ? 'waiting' : _.capitalize(statusLowerCase)}
      </i>
    </div>
  );
  return (
    <List.Item className={isError ? styles['error'] : styles['not-error']}>
      <List.Item.Meta title={title} />
    </List.Item>
  );
}
