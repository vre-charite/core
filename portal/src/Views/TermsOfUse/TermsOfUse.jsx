import React, { useState } from 'react';
import { Layout, Button } from 'antd';
import AppHeader from '../../Components/Layout/Header';
import TermsOfUseModal from '../../Components/Modals/TermsOfUseModal';
import { useKeycloak } from '@react-keycloak/web';
import { changeUserStatusAPI } from '../../APIs';
const { Content } = Layout;
function TermsOfUse(props) {
  const { keycloak } = useKeycloak();
  const [visible, setVisible] = useState(true);
  const [btnDisable, setBtnDisable] = useState(true);
  const onCancel = () => {
    setVisible(false);
    setBtnDisable(true);
  };

  const onDecline = () => {
    setVisible(false);
    setBtnDisable(true);
  };

  const onOk = async () => {
    setVisible(false);
    const user = keycloak?.tokenParsed;
    const res = await changeUserStatusAPI(
      user.email,
      user.preferred_username,
      user.family_name,
      user.given_name,
    );
    if (res.status === 200) {
      window.location.reload();
    }
  };

  const onPrint = () => {
    console.log('print');
  };

  const handleScroll = (e) => {
    const bottom =
      Math.abs(
        e.target.scrollHeight - e.target.scrollTop - e.target.clientHeight,
      ) < 2;
    if (bottom) setBtnDisable(false);
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <AppHeader unauthorized />
      <Content
        style={{ margin: '15px 20px', background: 'white', borderRadius: 6 }}
      >
        <p
          style={{
            marginTop: '30vh',
            fontSize: 14,
            color: '#222222',
            fontWeight: 'bold',
            textAlign: 'center',
          }}
        >
          Terms of use not accepted.
          <br /> Please accept{' '}
          <b
            style={{
              color: '#1890FF',
              cursor: 'pointer',
              textDecoration: 'underline',
            }}
            onClick={(e) => {
              setVisible(true);
            }}
          >
            Terms of Use
          </b>{' '}
          if you wish to view projects.
        </p>
        <TermsOfUseModal
          footer={[
            <Button
              key="submit"
              type="primary"
              onClick={onPrint}
              style={{ float: 'left' }}
            >
              <a
                href="/vre/files/VRE Website Privacy Policy draft.pdf"
                download
                target="_self"
              >
                {' '}
                Export PDF
              </a>
            </Button>,

            <Button
              key="submit"
              type="primary"
              disabled={btnDisable}
              onClick={onOk}
            >
              Accept
            </Button>,

            <Button key="back" type="danger" onClick={onDecline}>
              Decline
            </Button>,
          ]}
          visible={visible}
          handleCancel={onCancel}
          handleScroll={handleScroll}
        />
      </Content>
    </Layout>
  );
}

export default TermsOfUse;
