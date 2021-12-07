import React from 'react';
import { getFileSize } from '../../../../Utility';
export default function SizeDefault({ text, record }) {
  if ([undefined, null].includes(record.fileSize)) {
    return '';
  }
  return getFileSize(text);
}
