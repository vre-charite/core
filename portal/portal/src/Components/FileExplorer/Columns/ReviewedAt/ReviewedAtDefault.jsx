import React from 'react';
import { timeConvert } from '../../../../Utility';
export default function ReviewedAtDefault({ text, record }) {
  return <>{text && timeConvert(text, 'datetime')}</>;
}
