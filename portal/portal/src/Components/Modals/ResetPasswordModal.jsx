import React, { useState, useEffect } from 'react';
import { Modal, Button, message, Form, Input, Tooltip } from 'antd';
import { useTranslation } from 'react-i18next';
import { CloseOutlined, ArrowRightOutlined } from '@ant-design/icons';
import styles from './resetpasswd.module.scss';
import { ORGANIZATION_PORTAL_DOMAIN } from '../../config';
const ResetPasswordModal = (props) => {
  const [userInfo, setUserInfo] = useState({});
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const { t } = useTranslation(['tooltips', 'success', 'formErrorMessages']);

  useEffect(() => {
    const info = { username: props.username };
    setUserInfo(info);
  }, [props.visible, props.username]);

  const onCancel = () => {
    props.handleCancel();
  };

  const onOk = () => {};

  return (
    <Modal
      title={
        <div>
          <p
            style={{
              margin: 0,
              padding: '4px 20px 0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <b style={{ color: '#003262', fontSize: 14, lineHeight: '40px' }}>
              Password Reset
            </b>
            <CloseOutlined
              style={{ fontSize: 14 }}
              onClick={() => {
                props.handleCancel();
              }}
            />
          </p>
        </div>
      }
      className={styles.reset_pop_up}
      visible={props.visible}
      maskClosable={false}
      closable={false}
      destroyOnClose={true}
      footer={null}
    >
      <div style={{ margin: '35px 0 30px', textAlign: 'center' }}>
        <p style={{ textAlign: 'center', cursor: 'default', marginBottom: 4 }}>
          To reset Password please visit
        </p>
        <a
          style={{ fontSize: 16, fontWeight: 'bold' }}
          href={`https://${ORGANIZATION_PORTAL_DOMAIN}/`}
          target="_blank"
        >
          https://{ORGANIZATION_PORTAL_DOMAIN}/
        </a>
      </div>
      <div style={{ textAlign: 'center', paddingBottom: 15 }}>
        <Button
          type="link"
          style={{
            marginRight: 40,
            color: 'rgba(0,0,0,0.65)',
            fontWeight: 'bold',
          }}
          onClick={() => {
            props.handleCancel();
          }}
        >
          Cancel
        </Button>
        <a target="_blank" href={`https://${ORGANIZATION_PORTAL_DOMAIN}/`}>
          <Button
            style={{ borderRadius: 10, width: 120 }}
            type="primary"
            icon={<ArrowRightOutlined />}
          >
            Visit Link
          </Button>
        </a>
      </div>
    </Modal>
  );
};

export default ResetPasswordModal;
