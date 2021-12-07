import React from 'react';
export default function GenerateIDDefault({ text, record }) {
  return <>{text && text !== 'undefined' ? text : null}</>;
}
