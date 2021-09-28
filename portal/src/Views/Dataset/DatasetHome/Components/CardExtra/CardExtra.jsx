import React, { useState, useEffect } from 'react';
import { Button } from 'antd';
import { EditOutlined, SaveOutlined } from '@ant-design/icons';
import styles from './CardExtra.module.scss';

export function CardExtra(props) {
  const { editMode, onCancel, submitting, onClickSubmit, onClickEditButton } =
    props;

  if (editMode) {
    return (
      //if the <div></div> is replaced with <></>, when toggling, the buttons will shake. why?
      <div>
        <Button
          onClick={onCancel}
          className={styles['cancel-button']}
          type="link"
          disabled={submitting}
        >
          Cancel
        </Button>{' '}
        <Button
          className={styles['submit-button']}
          icon={<SaveOutlined />}
          type="primary"
          onClick={onClickSubmit}
          loading={submitting}
        >
          Submit
        </Button>{' '}
      </div>
    );
  }

  // return (
  //   <Button
  //     className={styles['edit-button']}
  //     type="link"
  //     onClick={onClickEditButton}
  //     icon={<EditOutlined />}
  //   ></Button>
  // );
  return null;
}
