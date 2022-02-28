import React from 'react';
import { Popover } from 'antd';

export const partialString = (string, length, isDisplay) => {
  const partString = `${string.substring(0, length)}...`;

  if (isDisplay) {
    return (
      <Popover overlayStyle={{ maxWidth: 600, wordBreak: 'break-word' }} content={<span>{string}</span>}>
        {partString}
      </Popover>
    );
  }

  return partString;
};