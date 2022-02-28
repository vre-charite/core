import React from 'react';
import styles from './DatasetActivity.module.scss';

const DatasetActivityViewSelector = (props) => {
  const { viewValue, changeViewValue } = props;
  return (
    <div className={styles.view_selector}>
      <span style={{ color: '#595959', fontWeight: 500, width: '40px' }}>
        View
      </span>
      <div className={styles.view}>
        <div
          className={`${styles.view_all} ${
            viewValue === 'All' && styles.view_backgroundColor
          }`}
          onClick={changeViewValue}
        >
          All
        </div>
        <div
          className={`${styles.view_1d} ${
            viewValue === '1 D' && styles.view_backgroundColor
          }`}
          onClick={changeViewValue}
        >
          1 D
        </div>
        <div
          className={`${styles.view_1w} ${
            viewValue === '1 W' && styles.view_backgroundColor
          }`}
          onClick={changeViewValue}
        >
          1 W
        </div>
        <div
          className={`${styles.view_1m} ${
            viewValue === '1 M' && styles.view_backgroundColor
          }`}
          onClick={changeViewValue}
        >
          1 M
        </div>
        <div
          className={`${styles.view_6m} ${
            viewValue === '6 M' && styles.view_backgroundColor
          }`}
          onClick={changeViewValue}
        >
          6 M
        </div>
        <div
          className={`${styles.view_custom} ${
            viewValue === 'Custom' && styles.view_backgroundColor
          }`}
          onClick={changeViewValue}
        >
          Custom
        </div>
      </div>
    </div>
  );
};

export default DatasetActivityViewSelector;
