// Copyright 2022 Indoc Research
// 
// Licensed under the EUPL, Version 1.2 or – as soon they
// will be approved by the European Commission - subsequent
// versions of the EUPL (the "Licence");
// You may not use this work except in compliance with the
// Licence.
// You may obtain a copy of the Licence at:
// 
// https://joinup.ec.europa.eu/collection/eupl/eupl-text-eupl-12
// 
// Unless required by applicable law or agreed to in
// writing, software distributed under the Licence is
// distributed on an "AS IS" basis,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
// express or implied.
// See the Licence for the specific language governing
// permissions and limitations under the Licence.
// 

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
