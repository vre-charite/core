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
