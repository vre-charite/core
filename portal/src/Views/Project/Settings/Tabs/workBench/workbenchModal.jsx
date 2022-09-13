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
import { connect } from 'react-redux';
import { Button, Modal, message } from 'antd';
import styles from '../../index.module.scss';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { deployWorkbenchAPI } from '../../../../../APIs';
import { useTranslation } from 'react-i18next';
import { setCurrentProjectWorkbench } from '../../../../../Redux/actions';

const modalTitle = (
  <p style={{ padding: '14px 0px 0px 29px' }}>
    <ExclamationCircleOutlined
      style={{ color: '#FF9418', marginRight: '8px' }}
    />
    Confirmation
  </p>
);

const WorkbenchModal = (props) => {
  const { t } = useTranslation(['errormessages', 'success']);
  const [btnLoading, setBtnLoading] = useState(false);
  const {
    showModal,
    workbench,
    closeModal,
    projectGeid,
    setCurrentProjectWorkbench,
  } = props;

  const deployWorkbench = async () => {
    try {
      setBtnLoading(true);
      const res = await deployWorkbenchAPI(projectGeid, workbench.toLowerCase());
      if (res.data.result === 'success') {
        setBtnLoading(false);
        setCurrentProjectWorkbench();
        closeModal();
      }
    }catch(error) {
      setBtnLoading(false);
      message.error(
        t('errormessages:projectWorkench.deployWorkbench.default.0'),
      );
    }
  }

  return (
    <Modal
      className={styles.workbench_modal}
      title={modalTitle}
      visible={showModal}
      maskClosable={false}
      centered={true}
      footer={null}
      closable={false}
    >
      <div>
        <p style={{ marginLeft: '38px' }}>
          Do you confirm to configure{' '}
          <span style={{ color: '#003262' }}><strong>{workbench}</strong></span>?
        </p>
        <div style={{ textAlign: 'end', marginRight: '24px' }}>
          <Button type="text" style={{ border: 'none' }} onClick={closeModal}>
            Cancel
          </Button>
          <Button
            type="primary"
            style={{
              borderRadius: '6px',
              width: '80px',
              height: '30px',
              padding: '0px',
            }}
            loading={btnLoading}
            onClick={() => {
              deployWorkbench();
            }}
          >
            Confirm
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default connect(null, { setCurrentProjectWorkbench })(WorkbenchModal);
