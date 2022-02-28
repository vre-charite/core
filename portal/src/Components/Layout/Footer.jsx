import React, { useState } from 'react';
import { Layout, Button, Space } from 'antd';
import styles from './index.module.scss';
import TermsOfUseModal from '../Modals/TermsOfUseModal';
import { setIsReleaseNoteShownCreator } from '../../Redux/actions';
import { useDispatch } from 'react-redux';
import { version } from '../../../package.json';
import { xwikis } from '../../externalLinks';
const { Footer } = Layout;

function AppFooter(props) {
  const dispatch = useDispatch();
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
        <a
          target="_blank"
          rel="noreferrer"
          href={xwikis.termsOfUse}
          style={{
            fontSize: '80%',
            height: '32px',
            lineHeight: '32px',
            display: 'block',
            marginTop: -3,
            marginRight: 20,
          }}
        >
          Terms of Use
        </a>
        <a
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontSize: '80%',
            height: '32px',
            lineHeight: '32px',
            display: 'block',
            marginTop: -3,
          }}
          href={xwikis.privacyPolicy}
        >
          Privacy Policy
        </a>
        {/* <Button type="link" className={styles.tou}>
          <small>About</small>
        </Button> */}
      </Space>
      <small className={styles.copyright}>
        <Button
          onClick={() => {
            dispatch(setIsReleaseNoteShownCreator(true));
          }}
          style={{ paddingRight: 0 }}
          type="link"
        >
          <small className={styles.copyright}> Version {version}</small>
        </Button>
        {' / '}
        <a
          style={{ marginRight: 10 }}
          href={xwikis.documentation}
          target="_blank"
          rel="noopener noreferrer"
        >
          Documentation
        </a>
        Copyright © {new Date().getFullYear()},{' '}
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
