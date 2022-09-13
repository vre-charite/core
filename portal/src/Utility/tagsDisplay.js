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
import { Tag } from 'antd';

const getTags = (tags) => {
  if (tags.length <= 3) {
    return tags.map((tag) => <Tag>{tag}</Tag>);
  }

  const hideTags = [
    ...tags.slice(0, 3).map((tag) => <Tag>{tag}</Tag>),
    <Tag style={{ color: '#1890FF', backgroundColor: '#E6F5FF' }}>{`+${
      tags.length - 3
    }`}</Tag>,
  ];
  return hideTags;
};

export { getTags };
