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

import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Button, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import styles from './index.module.scss';
import { createSubFolderApi } from '../../../../../../../APIs';
import { PanelKey } from '../../RawTableValues';
import { namespace, ErrorMessager } from '../../../../../../../ErrorMessages';
import i18n from '../../../../../../../i18n';
import { trimString } from '../../../../../../../Utility';
export default function CreateFolderModal(props) {
  const {
    visible,
    hideModal,
    refresh,
    currentRouting,
    projectCode,
    uploader,
    panelKey,
  } = props;
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const submit = () => {
    setLoading(true);
    form
      .validateFields()
      .then((values) => {
        const { folderName } = values;
        const zone = getZone(panelKey);
        const destinationGeid =
          currentRouting[currentRouting.length - 1]?.globalEntityId;
        createSubFolderApi(
          trimString(folderName),
          destinationGeid,
          projectCode,
          uploader,
          zone,
        )
          .then((res) => {
            if (res.data.code === 409) {
              message.error(`${i18n.t('errormessages:createFolder.409.0')}`);
            }
            if (res.data.code === 200) {
              message.success(`${i18n.t('success:createFolder')}`);
              refresh();
              hideModal();
              form.resetFields(['folderName']);
            }
          })
          .catch((err) => {
            if (err.response) {
              const errorMessager = new ErrorMessager(
                namespace.fileExplorer.createFolder,
              );
              errorMessager.triggerMsg(err.response.status);
            }
          })
          .finally(() => {
            setLoading(false);
          });
      })
      .catch((err) => {
        setLoading(false);
      });
  };
  return (
    <Modal
      visible={visible}
      title="Create a Folder"
      className={styles['create-folder-modal']}
      onCancel={() => {
        hideModal();
        form.resetFields(['folderName']);
      }}
      maskClosable={false}
      footer={[
        <Button
          disabled={loading}
          onClick={() => {
            hideModal();
            form.resetFields(['folderName']);
          }}
          type="link"
        >
          Cancel
        </Button>,
        <Button
          loading={loading}
          type="primary"
          icon={<PlusOutlined />}
          onClick={submit}
        >
          Create
        </Button>,
      ]}
    >
      <Form layout="vertical" form={form}>
        <Form.Item
          name="folderName"
          label="Folder Name"
          rules={[
            {
              required: true,
              validator: (rule, value) => {
                const collection = value ? trimString(value) : null;
                if (!collection) {
                  return Promise.reject(
                    'Folder name should be 1 ~ 20 characters',
                  );
                }
                const isLengthValid =
                  collection.length >= 1 && collection.length <= 20;
                if (!isLengthValid) {
                  return Promise.reject(
                    'Folder name should be 1 ~ 20 characters',
                  );
                } else {
                  const specialChars = [
                    '\\',
                    '/',
                    ':',
                    '?',
                    '*',
                    '<',
                    '>',
                    '|',
                    '"',
                    "'",
                    '.',
                  ];
                  for (let char of specialChars) {
                    if (collection.indexOf(char) !== -1) {
                      return Promise.reject(
                        `Folder name can not contain any of the following character ${specialChars.join(
                          ' ',
                        )}`,
                      );
                    }
                  }
                  if (!currentRouting || currentRouting.length === 0) {
                    const reserved = ['raw', 'logs', 'trash', 'workdir'];
                    if (reserved.indexOf(collection.toLowerCase()) !== -1) {
                      return Promise.reject(
                        `Following folder name is reserved: ${reserved.join(
                          ' ',
                        )}`,
                      );
                    }
                  }

                  return Promise.resolve();
                }
              },
            },
          ]}
        >
          <Input placeholder="Enter Your Folder Name"></Input>
        </Form.Item>
      </Form>
    </Modal>
  );
}

function getZone(panelKey) {
  if (panelKey === PanelKey.CORE_HOME || panelKey === PanelKey.CORE) {
    return 'Core';
  }
  if (panelKey === PanelKey.GREENROOM_HOME || panelKey === PanelKey.GREENROOM) {
    return 'greenroom';
  }
  throw new Error('The panel key is incorrect');
}
