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
        VRE is a product developed jointly by{' '}
        <a
          href="https://www.charite.de/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Charité
        </a>
        /
        <a
          href="https://www.bihealth.org/"
          target="_blank"
          rel="noopener noreferrer"
        >
          BIH
        </a>{' '}
        and{' '}
        <a
          href="https://www.indocresearch.org/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Indoc Research
        </a>{' '}
        and powered by{' '}
        <a
          href="https://github.com/PilotDataPlatform"
          target="_blank"
          rel="noopener noreferrer"
        >
          Indoc Pilot
        </a>
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
