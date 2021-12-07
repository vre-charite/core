import React from 'react';
import { timeConvert } from '../../../../Utility';
export default function CreatedTimeDefault({ text, record }) {
  return <>{text && timeConvert(text, 'date')}</>;
}
