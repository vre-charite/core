import React from 'react';
import { Popover, Tooltip } from 'antd';

export const fileNameOrPathDisplay = (str) => {
  if (str.length > 15) {
    return <Tooltip title={str}>{`${str.slice(0, 15)}...`}</Tooltip>;
  } else {
    return str;
  }
};