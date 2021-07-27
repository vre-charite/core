import React from 'react';
import { Modal, message } from 'antd';
import { useSelector, useDispatch } from 'react-redux';
import { triggerEvent } from '../../../../../../../Redux/actions';
import { FILE_OPERATIONS } from '../../FileOperationValues';
import { tokenManager } from '../../../../../../../Service/tokenManager';
import { commitFileAction } from '../../../../../../../APIs';
import { useTranslation } from 'react-i18next';
import { PanelKey } from '../../RawTableValues';
import { DeleteModalFirstStep } from './DeleteModalFirstStep';
import { DeleteModalSecondStep } from './DeleteModalSecondStep';

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
  const [step, setStep] = React.useState(1);
  const [locked, setLocked] = React.useState([]);

  const { authorizedFilesToDelete, unauthorizedFilesToDelete } =
    getAuthorizedFilesToDelete(files, permission, username, panelKey);

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
    if (step === 2) {
      handleCancel();
      return;
    }
    if (authorizedFilesToDelete && authorizedFilesToDelete.length === 0) {
      handleCancel();
      return;
    }

    setConfirmLoading(true);

    try {
      const res = await commitFileAction(
        {
          targets: authorizedFilesToDelete.map((file) => {
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

  const firstStepProps = {
    panelKey,
    authorizedFilesToDelete,
    unauthorizedFilesToDelete,
  };

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
      {step === 1 && <DeleteModalFirstStep {...firstStepProps} />}
      {step === 2 && <DeleteModalSecondStep locked={locked} />}
    </Modal>
  );
};

export default DeleteFilesModal;

/**
 *
 * @param {Array} files all files selected
 * @param {"collaborator"|"contributor"|"admin"} permission
 * @param {string} username
 * @param {string} panelKey
 * @returns {{authorizedFilesToDelete:any[], unauthorizedFilesToDelete:any[]}}
 */
const getAuthorizedFilesToDelete = (files, permission, username, panelKey) => {
  let authorizedFilesToDelete = files;
  let unauthorizedFilesToDelete = [];

  // console.log(files, permission, username, panelKey);
  // if (permission === 'collaborator' && panelKey === PanelKey.GREENROOM_HOME) {
  //   authorizedFilesToDelete = files.filter((el) => el.uploader === username);
  //   unauthorizedFilesToDelete = files.filter((el) => el.uploader !== username);
  // } else {
  // authorizedFilesToDelete = files;
  // unauthorizedFilesToDelete = [];
  // }

  return { authorizedFilesToDelete, unauthorizedFilesToDelete };
};
