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
