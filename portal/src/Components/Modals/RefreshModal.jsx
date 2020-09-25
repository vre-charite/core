import React, { useState, useEffect } from 'react';
import { Modal, Button, message } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { useCookies } from 'react-cookie';
import { refreshTokenAPI } from '../../APIs';
import { headerUpdate, clearCookies,refreshChannel } from '../../Utility';
import jwt_decode from 'jwt-decode';
import moment from 'moment';
import { connect } from 'react-redux';
import { setRefreshModal,setIsLoginCreator } from '../../Redux/actions';
import { namespace, ErrorMessager } from '../../ErrorMessages';
import { logout as logoutUtility, getCookie } from '../../Utility';

function CreateDatasetModal({
  visible,
  uploadList,
  downloadList,
  setRefreshModal,setIsLoginCreator
}) {
  const [cookies, setCookie] = useCookies(['cookies']);
  const [secondsToGo, setTimer] = useState(60);
  let timer;

  const refreshToken = (autoRefresh) => {
    const payload = {
      refreshtoken: cookies['refresh_token'],
    };

    // call API to refresh token
    refreshTokenAPI(payload)
      .then((res) => {
        const { access_token, refresh_token } = res.data.result;
        setCookie('access_token', access_token, { path: '/' });
        setCookie('refresh_token', refresh_token, { path: '/' });
        headerUpdate(access_token, refresh_token);
        clearInterval(timer);
        setRefreshModal(false);

        if (autoRefresh) message.success('Automatic refresh');
        refreshChannel.postMessage();
      })
      .catch((err) => {
        if (err.response) {
          const errorMessager = new ErrorMessager(namespace.login.refresh);
          errorMessager.triggerMsg(err.response.status);
        }
      });
  };

  useEffect(() => {
    timer = setInterval(() => {
      const token = getCookie('access_token');
      // let exp = jwt_decode(cookies["access_token"]).exp;
      if (token) {
        let exp = jwt_decode(token).exp;
        let remain = exp - moment().unix();
        if (remain <= 0) {
          console.log('logout in refreshModal.jsx, remain <= 0')
          logoutUtility();
          setRefreshModal(false);
        }else if(remain>60){

          setRefreshModal(false);
        } else {
          setTimer(remain);
        }
      }else{ 
        console.log('logout in refreshModal.jsx, no token')
        logoutUtility();

      }
    }, 1000);
    return () => clearInterval(timer);
  });

  const logout =  () => {
    Modal.confirm({
      title: 'Are you sure you want to log out?',
      icon: <ExclamationCircleOutlined />,
      content:
        `If you're uploading/downloading, all the progress will be lost.`,
      onOk() {
        logoutUtility(true);
      },
      onCancel() {
        console.log('Cancel');
      },
    });
    
  };

  const upladingList =
    uploadList && uploadList.filter((el) => el.status === 'uploading');

  if (
    (upladingList && upladingList.length > 0) ||
    (downloadList && downloadList.length > 0)
  ) {
    setRefreshModal(false);
    console.log('refresh automatically');
    refreshToken(true);
  }

  return (
    <Modal
      title="Warning"
      visible={visible}
      maskClosable={false}
      // icon={<ExclamationCircleOutlined />}
      onCancel={() => {
        setRefreshModal(false);
        logout();
      }}
      footer={[
        <Button key="back" onClick={logout}>
          Logout
        </Button>,
        <Button key="submit" type="primary" onClick={() => refreshToken(false)}>
          Refresh
        </Button>,
      ]}
    >
      {`Your session will expire in ${secondsToGo}s. Please click “Refresh” if you wish to remain logged in.`}
    </Modal>
  );
}

// export default CreateDatasetModal;
export default connect(
  (state) => ({
    visible: state.refreshTokenModal,
    uploadList: state.uploadList,
    downloadList: state.downloadList,
  }),
  { setRefreshModal,setIsLoginCreator },
)(CreateDatasetModal);
