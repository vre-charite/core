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

import React, { useEffect, useState } from 'react';
import { Modal, Typography } from 'antd';
import styles from './terms.module.scss';
import axios from 'axios';
import { PORTAL_PREFIX } from '../../config';
const { Title } = Typography;

function TermsOfUseModal(props) {
  const [html, setHtml] = useState('');
  useEffect(() => {
    axios(`${PORTAL_PREFIX}/files/terms-of-use.html`)
      .then((res) => {
        setHtml(res.data);
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);

  return (
    <Modal
      title="Platform Terms of Use Agreement"
      visible={props.visible}
      onOk={props.handleOk}
      onCancel={props.handleCancel}
      width={'70%'}
      // bodyStyle={{ maxHeight: '68vh', overflow: 'scroll' }}
      footer={props.footer}
      maskClosable={false}
      zIndex="1020"
      className={styles.terms_modal}
    >
      <div
        style={{ overflowY: 'scroll', height: '60vh' }}
        onScroll={props.handleScroll}
        dangerouslySetInnerHTML={{__html: html}}
      ></div>
    </Modal>
  );
}

export default TermsOfUseModal;
