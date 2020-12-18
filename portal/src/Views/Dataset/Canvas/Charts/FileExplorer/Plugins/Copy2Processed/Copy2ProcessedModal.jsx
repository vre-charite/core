import React from 'react';
import { Modal, message } from 'antd';
import { useSelector, useDispatch } from 'react-redux';
import { copyFiles } from '../../../../../../../APIs';
import { triggerEvent } from '../../../../../../../Redux/actions';
const Copy2ProcessedModal = ({ visible, setVisible, files, eraseSelect }) => {
  const [confirmLoading, setConfirmLoading] = React.useState(false);
  const project = useSelector((state) => state.project);
  const username = useSelector((state) => state.username);
  const [step, setStep] = React.useState(1);
  const [skipped, setSkipped] = React.useState([]);
  const dispatch = useDispatch();

  const sessionId = localStorage.getItem('sessionId');

  async function closeModal() {
    setVisible(false);
    setTimeout(() => {
      setStep(1);
      setSkipped([]);
    }, 300);
    if (step === 2) {
      eraseSelect();
    }
  }

  const handleOk = async () => {
    if (step === 2) {
      closeModal();
      return;
    }
    setConfirmLoading(true);
    let res;
    try {
      res = await copyFiles(
        files,
        project.profile.path,
        username,
        sessionId,
        0,
      );
      setConfirmLoading(false);
      dispatch(triggerEvent('LOAD_COPY_LIST'));
    } catch (e) {
      message.error('Network error, please try again later', 3);
      setConfirmLoading(false);
    }
    if (
      res &&
      res.data.result &&
      res.data.result.repeatFileList &&
      res.data.result.repeatFileList.length
    ) {
      let list = res.data.result.repeatFileList;
      list = list
        .map((v) => {
          let paths = v.split('/');
          if (paths && paths.length) {
            return paths[paths.length - 1];
          } else {
            return null;
          }
        })
        .filter((v) => !!v);
      setSkipped(list);
    }
    setStep(2);
  };

  const handleCancel = () => {
    closeModal();
  };

  return (
    <Modal
      title="Copy To Green Room Processed"
      visible={visible}
      onOk={handleOk}
      confirmLoading={confirmLoading}
      okText={step === 1 ? 'Confirm' : 'OK'}
      onCancel={handleCancel}
      cancelButtonProps={{ style: { display: 'none' } }}
    >
      {step === 1 ? (
        <>
          <p>
            You are about to copy {files.length} files from the Green Room Raw
            to Green Room Processed.
          </p>
        </>
      ) : (
        <>
          <p>
            Transferring files is in progress, it may take some time.{' '}
            {skipped && skipped.length
              ? `The following ${skipped.length} files will be skipped because they already exists`
              : null}
          </p>
          {skipped && skipped.length ? (
            <ul style={{ maxHeight: 90, overflowY: 'scroll' }}>
              {skipped.map((v) => {
                return <li key={v}>{v}</li>;
              })}
            </ul>
          ) : null}
        </>
      )}
    </Modal>
  );
};

export default Copy2ProcessedModal;
