import React, { useState, useEffect } from 'react';
import { Modal, Button } from 'antd';
import { connect, useSelector } from 'react-redux';
import { setRefreshModal } from '../../Redux/actions';
import { namespace, ErrorMessager } from '../../ErrorMessages';
import { tokenManager } from '../../Service/tokenManager';
import { userAuthManager } from '../../Service/userAuthManager';
import { broadcastManager } from '../../Service/broadcastManager';
import { namespace as ServiceNamespace } from '../../Service/namespace';
import { useTranslation } from 'react-i18next';

/**
 *
 * @param {{visible:boolean,setRefreshModal:(isShouldRefreshModal:boolean)=>void}} param0
 */
function CreateDatasetModal({ visible, setRefreshModal }) {
  const [secondsToGo, setTimer] = useState(tokenManager.getTokenTimeRemain());
  const [listenerId, setListenerId] = useState('default');
  const { refreshTokenModal, username } = useSelector((state) => state);
  const { t, i18n } = useTranslation('modals');

  const [isRefreshing,setIsRefreshing] = useState(false);
  const refreshToken = () => {
    setIsRefreshing(true);
    userAuthManager
      .extendAuth()
      .then((res) => {
        broadcastManager.postMessage(
          'refresh',
          ServiceNamespace.broadCast.CLICK_REFRESH_MODAL,
          username,
        );
        setRefreshModal(false);
      })
      .catch((err) => {
        if (err.response) {
          const errorMessager = new ErrorMessager(namespace.login.refresh);
          errorMessager.triggerMsg(err.response.status);
        }
      }).finally(()=>{
        setIsRefreshing(false);
      });
;
  };

  useEffect(() => {
    //set the time on the modal
    if (refreshTokenModal) {
      setTimer(tokenManager.getTokenTimeRemain());
      const time = 60; //any value because condition always return true;
      const condition = (timeRemain, time) => true;
      const func = () => {
        setTimer(tokenManager.getTokenTimeRemain());
      };
      const newListenerId = tokenManager.addListener({ time, condition, func });
      setListenerId(newListenerId);
    } else {
      tokenManager.removeListener(listenerId);
    }
  }, [refreshTokenModal]);

  const logout = () => {
    tokenManager.removeListener(listenerId);
    userAuthManager.logout(
      ServiceNamespace.userAuthLogout.LOGOUT_REFRESH_MODAL,
    );
    broadcastManager.postMessage(
      'logout',
      ServiceNamespace.broadCast.REFRESH_MODAL_LOGOUT,
    );
    localStorage.removeItem('sessionId');
    setRefreshModal(false);
  };

  return (
    <Modal
      id={`refresh_modal`}
      title={t('refreshModal.title')}
      visible={visible}
      maskClosable={false}
      footer={[
        <Button disabled={isRefreshing}  id={'refresh_modal_logout'} key="back" onClick={logout}>
          Logout
        </Button>,
        <Button
          id="refresh_modal_refresh"
          key="submit"
          type="primary"
          loading={isRefreshing}
          onClick={() => refreshToken()}
        >
          Refresh
        </Button>,
      ]}
      // style={{ zIndex: 9999 }}
      zIndex={9999}
    >
      {`${t('refreshModal.text.0')} ${secondsToGo}s. ${t(
        'refreshModal.text.1',
      )}`}
    </Modal>
  );
}

// export default CreateDatasetModal;
export default connect(
  (state) => ({
    visible: state.refreshTokenModal,
  }),
  { setRefreshModal },
)(CreateDatasetModal);
