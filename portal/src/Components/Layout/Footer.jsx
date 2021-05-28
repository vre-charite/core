import React, { useState } from 'react';
import { Layout, Button, Space } from 'antd';
import styles from './index.module.scss';
import TermsOfUseModal from '../Modals/TermsOfUseModal';
import { setIsReleaseNoteShownCreator } from '../../Redux/actions';
import { useDispatch } from 'react-redux';
import { version } from '../../../package.json';
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
  let documentsLink;
  switch (process.env.REACT_APP_ENV) {
    case 'dev':
      documentsLink =
        'http://10.3.7.220/xwiki/wiki/vrepublic/view/Main/user_guide/';
      break;
    case 'staging':
      documentsLink =
        'https://vre-staging.indocresearch.org/xwiki/wiki/vrepublic/view/Main/user_guide/';
      break;
    case 'charite':
      documentsLink =
        'https://vre.charite.de/xwiki/wiki/vrepublic/view/Main/user_guide/';
      break;
    default:
      documentsLink =
        'http://10.3.7.220/xwiki/wiki/vrepublic/view/Main/user_guide/';
      break;
  }
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
          href={documentsLink}
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
