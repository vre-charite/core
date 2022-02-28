import React from 'react';
import { Modal } from 'antd';
import { JsonMonacoEditor } from '../JsonMonacoEditor/JsonMonacoEditor';
import styles from './JsonPreviewerEnlargedModal.module.scss';
export function JsonPreviewerEnlargedModal(props) {
  const { isEnlarged, name, json, setIsEnlarged, format } = props;
  return (
    <Modal
      maskClosable={false}
      onCancel={() => setIsEnlarged(false)}
      footer={null}
      width={'90%'}
      title={name}
      visible={isEnlarged}
      className={styles['enlarged_json_model']}
    >
      <JsonMonacoEditor json={json} format={format} />
    </Modal>
  );
}
