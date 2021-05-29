import React from 'react';
import { Modal, message } from 'antd';
import { useSelector, useDispatch } from 'react-redux';
import { triggerEvent } from '../../../../../../../Redux/actions';
import { FILE_OPERATIONS } from '../../FileOperationValues';
import { tokenManager } from '../../../../../../../Service/tokenManager';
import {
  commitFileAction,
  validateFileAction,
} from '../../../../../../../APIs';
import { useTranslation } from 'react-i18next';
import { JOB_STATUS } from '../../../../../../../Components/Layout/FilePanel/jobStatus';
import { PanelKey } from '../../RawTableValues';
const DeleteFilesModal = ({
  visible,
  setVisible,
  files,
  eraseSelect,
  panelKey,
  permission,
}) => {
  const [confirmLoading, setConfirmLoading] = React.useState(false);
  const project = useSelector((state) => state.project);
  const username = useSelector((state) => state.username);
  const deletedFileList = useSelector((state) => state.deletedFileList);
  const [step, setStep] = React.useState(1);
  const [locked, setLocked] = React.useState([]);

  const { t } = useTranslation([
    'tooltips',
    'success',
    'formErrorMessages',
    'errormessages',
  ]);

  const dispatch = useDispatch();

  const sessionId = tokenManager.getCookie('sessionId');

  const handleCancel = () => {
    setStep(1);
    setLocked([]);
    eraseSelect();
    setVisible(false);
  };

  const handleOk = async () => {
    if (step == 2) {
      handleCancel();
      return;
    }
    if (permission === 'collaborator' && panelKey === PanelKey.CORE_HOME) {
      files = files.filter((el) => el.uploader === username);
    }
    if (files && files.length === 0) {
      handleCancel();
      return;
    }

    setConfirmLoading(true);

    try {
      // const validationRes = await validateFileAction(
      //   files.map((file) => {
      //     return {
      //       geid: file.geid,
      //     };
      //   }),
      //   username,
      //   FILE_OPERATIONS.DELETE,
      //   project.profile.globalEntityId,
      // );
      // let invalidList = validationRes.data.result.filter(
      //   (item) => !item.isValid,
      // );
      // if (invalidList.length) {
      //   setStep(2);
      //   setConfirmLoading(false);
      //   let lockedList = invalidList
      //     .map((v) => {
      //       let paths = v.fullPath.split('/');
      //       if (paths && paths.length) {
      //         return paths[paths.length - 1];
      //       } else {
      //         return null;
      //       }
      //     })
      //     .filter((v) => !!v);
      //   setLocked(lockedList);
      //   return;
      // }
      const res = await commitFileAction(
        {
          targets: files.map((file) => {
            return {
              geid: file.geid,
            };
          }),
        },
        username,
        FILE_OPERATIONS.DELETE,
        project.profile.globalEntityId,
        sessionId,
      );
      if (res.code === 202) {
        message.success(t('success:fileOperations.delete'));
      }

      dispatch(triggerEvent('LOAD_DELETED_LIST'));
      setConfirmLoading(false);
      handleCancel();
    } catch (err) {
      console.log(err.response.status);
      if (err.response.status === 403 || err.response.status === 400) {
        message.error(t('errormessages:fileOperations.unauthorizedDelete'));
      } else {
        message.error(t('errormessages:fileOperations.deleteErr'));
      }

      setConfirmLoading(false);
      handleCancel();
    }
  };

  let content = null;
  let trashPath = 'Green Room';
  const currentPanelArray = panelKey ? panelKey.split('-') : [];
  if (currentPanelArray.length > 0 && currentPanelArray[0] !== 'greenroom')
    trashPath = 'Core';

  if (files && files.length === 1) {
    content = <p>{`${files[0].fileName} will be sent to Trash Bin`}</p>;

    if (permission === 'collaborator' && panelKey === PanelKey.CORE_HOME) {
      const ownFiles = files.filter((el) => el.uploader === username);
      const otherFiles = files.filter((el) => el.uploader !== username);

      if (ownFiles && ownFiles.length) {
        content = <p>{`${files[0].fileName} will be sent to Trash Bin`}</p>;
      } else {
        content = (
          <p>{`${files[0].fileName} will be skipped. Because it is uploaded by other user.`}</p>
        );
      }
    }
  } else if (files && files.length > 1) {
    content = (
      <div>
        <p>{`The following ${files.length} file(s)/folder(s) will be sent to Trash Bin`}</p>

        <ul style={{ maxHeight: 90, overflowY: 'auto' }}>
          {files.map((v) => {
            return <li key={v.name}>{v.fileName}</li>;
          })}
        </ul>
      </div>
    );

    if (permission === 'collaborator' && panelKey === PanelKey.CORE_HOME) {
      const ownFiles = files.filter((el) => el.uploader === username);
      const otherFiles = files.filter((el) => el.uploader !== username);

      if (otherFiles && otherFiles.length) {
        content = (
          <div>
            <p>
              {`${otherFiles.length} file(s)/folder(s) will be skipped. Because these files are uploaded by other users.`}
            </p>

            {ownFiles.length ? (
              <>
                <p>
                  {`The following ${ownFiles.length} file(s)/folder(s) will be sent to ${trashPath} > Trash Bin`}
                </p>
                <ul style={{ maxHeight: 90, overflowY: 'auto' }}>
                  {ownFiles.map((v) => {
                    return <li key={v.name}>{v.fileName}</li>;
                  })}
                </ul>
              </>
            ) : null}
          </div>
        );
      }
    }
  }

  return (
    <Modal
      title="Delete Files"
      visible={visible}
      maskClosable={false}
      confirmLoading={confirmLoading}
      onCancel={handleCancel}
      onOk={handleOk}
      cancelButtonProps={{ style: { display: 'none' } }}
    >
      {step == 1 && content}
      {step == 2 && (
        <>
          <p>
            The following {locked.length} file(s)/folder(s) will be skipped
            because there are concurrent file operations are taking place:
          </p>
          {locked && locked.length ? (
            <ul style={{ maxHeight: 90, overflowY: 'auto' }}>
              {locked.map((v) => {
                return <li key={v}>{v}</li>;
              })}
            </ul>
          ) : null}
        </>
      )}
    </Modal>
  );
};

export default DeleteFilesModal;
