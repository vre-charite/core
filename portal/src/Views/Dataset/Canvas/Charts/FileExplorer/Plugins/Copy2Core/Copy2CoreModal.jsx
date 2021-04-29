import React from 'react';
import { Modal, Input, message } from 'antd';
import { useSelector, useDispatch } from 'react-redux';
import { copyFiles } from '../../../../../../../APIs';
import { triggerEvent } from '../../../../../../../Redux/actions';
import { useEffect } from 'react';
import { tokenManager } from '../../../../../../../Service/tokenManager';
import i18n from '../../../../../../../i18n';
import styles from './index.module.scss';
const Copy2CoreModal = ({ visible, setVisible, files, eraseSelect }) => {
  const [confirmLoading, setConfirmLoading] = React.useState(false);
  const [warning, setWarning] = React.useState(false);
  const [codeRandom, setCodeRandom] = React.useState('');
  const [codeInput, setCodeInput] = React.useState('');
  const project = useSelector((state) => state.project);
  const username = useSelector((state) => state.username);
  const [step, setStep] = React.useState(1);
  const [skipped, setSkipped] = React.useState([]);
  const dispatch = useDispatch();

  const sessionId = tokenManager.getCookie('sessionId');

  async function closeModal() {
    setVisible(false);
    setTimeout(() => {
      setCodeInput('');
      setWarning(false);
      setCodeRandom(randomTxt(5));
      setStep(1);
      setSkipped([]);
    }, 300);
    if (step === 2) {
      eraseSelect();
    }
  }
  function randomTxt(length) {
    var result = '';
    var characters =
      'ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }

  const handleOk = async () => {
    if (step === 2) {
      closeModal();
      return;
    }
    if (codeRandom === codeInput) {
      setConfirmLoading(true);
      let res;
      try {
        res = await copyFiles(
          files,
          project.profile.path,
          username,
          sessionId,
          1,
        );
        setConfirmLoading(false);
        dispatch(triggerEvent('LOAD_COPY_LIST'));
      } catch (e) {
        message.error(`${i18n.t('errormessages:copyFiles.default.0')}`, 3);
        setConfirmLoading(false);
      }
      if (
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
    } else {
      setWarning(true);
    }
  };

  const handleCancel = () => {
    closeModal();
  };

  useEffect(() => {
    setCodeRandom(randomTxt(5));
  }, []);
  return (
    <Modal
      title="Copy to Core"
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
            You are about to copy {files.length} files from the Green Room to
            the VRE Core.
          </p>
          <p>
            Please input the code:{' '}
            <b className={styles.no_select}>{codeRandom}</b> to confirm
          </p>
          <Input
            placeholder=""
            value={codeInput}
            onChange={(e) => {
              setCodeInput(e.target.value);
              if (e.target.value === codeRandom) {
                setWarning(false);
              }
            }}
            onKeyDown={function (e) {
              if (e.key === 'Enter') {
                handleOk();
              }
            }}
          />
          <p
            style={{ color: '#ff4d4f', marginTop: 5, opacity: warning ? 1 : 0 }}
          >
            Please input the correct code
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

export default Copy2CoreModal;
