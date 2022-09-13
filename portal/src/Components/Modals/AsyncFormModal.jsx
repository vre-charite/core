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

import React from 'react';
import { Modal } from 'antd';
import _ from 'lodash';
import { useHotkeys } from 'react-hotkeys-hook';
function AsyncFormModal(props) {
  const {
    visible,
    onCancel,
    onOk,
    cancelAxios,
    children,
    form,
    confirmLoading,
    id,
  } = props;
  if (!_.isObject(cancelAxios) && _.isFunction(cancelAxios.cancelFunction)) {
    throw new Error('the cancelAxios.cancelFunction should be a function');
  }
  if (typeof confirmLoading !== 'boolean') {
    throw new Error('comfirmLoading should be a boolean');
  }

  const otherProps = _.omit(props, [
    'visible',
    'onCancel',
    'onOk',
    'cancelAxios',
    'children',
    'form',
    'confirmLoading',
  ]);
  const ok = (e) => {
    onOk(e);
  };
  const cancel = (e) => {
    cancelAxios && cancelAxios.cancelFunction && cancelAxios.cancelFunction();
    if (form && _.isFunction(form.resetFields)) {
      form.resetFields();
    }
    _.isFunction(onCancel) && onCancel(e);
  };
  // useHotkeys('enter', ok);
  useHotkeys('esc', cancel);
  return (
    <Modal
      id={id}
      confirmLoading={confirmLoading}
      {...otherProps}
      onCancel={cancel}
      visible={visible}
      onOk={ok}
      maskClosable={false}
      closable={false}
    >
      {children}
    </Modal>
  );
}

export default AsyncFormModal;
