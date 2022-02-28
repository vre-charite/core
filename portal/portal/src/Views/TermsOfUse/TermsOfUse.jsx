import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Layout, Button } from 'antd';
import AppHeader from '../../Components/Layout/Header';
import TermsOfUseModal from '../../Components/Modals/TermsOfUseModal';
import { useKeycloak } from '@react-keycloak/web';
import { changeUserStatusAPI, lastLoginAPI } from '../../APIs';
import { PORTAL_PREFIX } from '../../config';

const { Content } = Layout;
function TermsOfUse(props) {
  const { keycloak } = useKeycloak();
  const [visible, setVisible] = useState(true);
  const [btnDisable, setBtnDisable] = useState(true);
  const [acceptLoading, setAcceptLoading] = useState(false);
  const username = useSelector((state) => state.username);
  const onCancel = () => {
    setVisible(false);
    setBtnDisable(true);
  };

  const onDecline = () => {
    setVisible(false);
    setBtnDisable(true);
  };

  const onOk = async () => {
    setAcceptLoading(true);
    const user = keycloak?.tokenParsed;
    const res = await changeUserStatusAPI(
      user.email,
      user.preferred_username,
      user.family_name,
      user.given_name,
    );
    if (res.status === 200) {
      // if (res.data.result.projectDetails.length) {
      //   try {
      //     const { name, globalEntityId, projectDetails } = res.data.result;
      //     setAcceptLoading(true);
      //     for (let i = 0; i < projectDetails.length; i++) {
      //       await createSubFolderApi(
      //         name,
      //         globalEntityId,
      //         projectDetails[i].projectCode,
      //         name,
      //         'Greenroom',
      //       );
      //       await createSubFolderApi(
      //         name,
      //         globalEntityId,
      //         projectDetails[i].projectCode,
      //         name,
      //         'Core',
      //       );
      //     }
      //     setAcceptLoading(false);
      //   } catch (error) {
      //     setAcceptLoading(false);
      //     console.log(error);
      //   }
      // }
      setAcceptLoading(false);
      setVisible(false);
      await lastLoginAPI(username);
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
                href={
                  PORTAL_PREFIX + '/files/Website Privacy Policy draft.pdf'
                }
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
              loading={acceptLoading}
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
