import React, { useState } from 'react';
import { PlusOutlined, MinusOutlined } from '@ant-design/icons';
import styles from './index.module.scss';

function Collapse(props) {
  const [collapsed, setCollased] = useState(false);
  function onClick(e) {
    setCollased(!collapsed);
  }
  return (
    <div>
      <p onClick={onClick} className={styles.title}>
        <strong>
          {props.icon} {props.title}
        </strong>
        <span>{collapsed ? <PlusOutlined /> : <MinusOutlined />}</span>
      </p>
      <div
        className={styles.collpasePanel + ' ' + (collapsed && styles.collapsed)}
      >
        <div
          className={styles.collapseBg + ' ' + (props.active && styles.active)}
        >
          {props.children}
        </div>
      </div>
    </div>
  );
}

export default Collapse;