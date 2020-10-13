import React from 'react';
import { Modal } from 'antd';
import _ from 'lodash';
import { useHotkeys } from 'react-hotkeys-hook';
function AsyncFormModal(props) {
  const { visible, onCancel, onOk, cancelAxios, children, form,confirmLoading } = props;
  if (!_.isObject(cancelAxios)&&_.isFunction(cancelAxios.cancelFunction)) {
    throw new Error('the cancelAxios.cancelFunction should be a function');
  }
  if(typeof confirmLoading!=='boolean'){
    throw new Error('comfirmLoading should be a boolean')
  }
 

  const otherProps = _.omit(props, [
    'visible',
    'onCancel',
    'onOk',
    'cancelAxios',
    'children',
    'form','confirmLoading'
  ]);
  const ok = (e) => {
    onOk(e);
  };
  const cancel = (e) => {
    console.log(cancelAxios,'cancelAxios')
    cancelAxios&&cancelAxios.cancelFunction && cancelAxios.cancelFunction();
    if (form && _.isFunction(form.resetFields)) {
      form.resetFields();
    }
    _.isFunction(onCancel) && onCancel(e);
  };
  useHotkeys('enter', ok);
  useHotkeys('esc', cancel);
  return (
    <Modal confirmLoading={confirmLoading} {...otherProps} onCancel={cancel} visible={visible} onOk={ok}>
      {children}
    </Modal>
  );
}

export default AsyncFormModal;
