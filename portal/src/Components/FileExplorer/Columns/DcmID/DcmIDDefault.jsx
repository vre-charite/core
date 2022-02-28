import React from 'react';
export default function DcmIDDefault({ text, record }) {
  return <>{text && text !== 'undefined' ? text : null}</>;
}
