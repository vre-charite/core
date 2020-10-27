import React, { useState, useEffect } from 'react';
import { Layout, Button, Space } from 'antd';
import styles from './index.module.scss';
import TermsOfUseModal from '../Modals/TermsOfUseModal';
const { Header, Footer, Sider, Content } = Layout;

function AppFooter(props) {
  const [modal, setModal] = useState(false);
  const showModal = () => {
    setModal(true);
  };
  const handleOk = () => {
    setModal(false);
  };
  return (
    <Footer className={styles.footer}>
      <Space className={styles.menu}>
        <Button type="link" onClick={showModal} className={styles.tou}>
          <small>Terms of Use</small>
        </Button>
        {/* <Button type="link" className={styles.tou}>
          <small>About</small>
        </Button> */}
      </Space>
      <small className={styles.copyright}>
        Version 0.1.1. Copyright © {new Date().getFullYear()},{' '}
        <a
          href="https://www.indocresearch.org/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Indoc Research
        </a>
        . All Rights Reserved.
      </small>{' '}
      <TermsOfUseModal
        visible={modal}
        handleOk={handleOk}
        handleCancel={handleOk}
      />
    </Footer>
  );
}

export default AppFooter;
