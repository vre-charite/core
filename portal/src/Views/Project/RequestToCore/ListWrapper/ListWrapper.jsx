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
import { List } from 'antd';
import styles from './ListWrapper.module.scss';

const ListWrapper = (props) => {
  const [selectedListIndex, setSelectedListIndex] = useState(0);
  const { data } = props;

  const onListClick = (e) => {
    setSelectedListIndex(parseInt(e.target.id));
  };

  return (
    <List
      size="large"
      bordered={false}
      dataSource={data}
      pagination={data.length > 10 ? {
        onChange: (page) => {
          console.log(page);
        },
        pageSize: 10,
      } : null}
      renderItem={(item, index) => (
        <List.Item
          className={`${styles.list_item} ${
            selectedListIndex === index && styles.list_item_backgroundColor
          }`}
          id={index}
          style={{ cursor: 'pointer' }}
          onClick={onListClick}
        >
          {item}
        </List.Item>
      )}
    />
  );
};

export default ListWrapper;
