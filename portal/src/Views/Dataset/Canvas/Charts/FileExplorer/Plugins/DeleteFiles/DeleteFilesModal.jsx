import React from 'react';
import { Modal, message } from 'antd';
import { useSelector, useDispatch } from 'react-redux';
import {
  triggerEvent,
  setDeletedFileList,
} from '../../../../../../../Redux/actions';
import { tokenManager } from '../../../../../../../Service/tokenManager';
import { deleteFileAPI } from '../../../../../../../APIs';
import { useTranslation } from 'react-i18next';

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

  const { t } = useTranslation([
    'tooltips',
    'success',
    'formErrorMessages',
  ]);

  const dispatch = useDispatch();

  const sessionId = tokenManager.getCookie('sessionId');

  const handleCancel = () => {
    eraseSelect();
    setVisible(false);
  };

  const handleOk = () => {
    const projectCode = project && project.profile && project.profile.code;
    const deleteFiles = [];
    const allFiles = deletedFileList;
    if (permission === 'collaborator' && panelKey === 'core-Raw') {
      files = files.filter(el => el.uploader === username);
    }

    if (files && files.length === 0) {
      handleCancel();
      return;
    }

    for (const file of files) {
      const pathArray = file && file.input_path && file.input_path.split('/');
      pathArray.pop();

      const isExist = deletedFileList.find(
        (el) => el.fileName === file.fileName,
      );

      if (!isExist) {
        file.status = 'pending';
        file.projectCode = projectCode;
        file.panelKey = panelKey;
        file.input_file = file.source;
        allFiles.push(file);
      }

      deleteFiles.push({
        path: pathArray && pathArray.join('/'),
        file_name: file.fileName,
        namespace: panelKey.includes('greenroom') ? 'greenroom' : 'vrecore',
        generate_id: file.generate_id,
        uploader: file.uploader,
      });
    }

    const data = {
      to_delete: deleteFiles,
      operator: username,
      session_id: sessionId,
      project_code: projectCode,
      job_id: 'test_job',
    };

    setConfirmLoading(true);

    deleteFileAPI(data)
      .then((res) => {
        if (res.status === 200) message.success(t('success:fileOperations.delete'));
        dispatch(setDeletedFileList(allFiles));
        dispatch(triggerEvent('LOAD_DELETED_LIST'));
        setConfirmLoading(false);
        handleCancel();
      })
      .catch((err) => {
        message.error(t('errorMessages:fileOperations.delete'));
        setConfirmLoading(false);
        handleCancel();
      });
  };

  let content = null;
  let trashPath = 'Green Room';
  const currentPanelArray = panelKey ? panelKey.split('-') : [];
  if (currentPanelArray.length > 0 && currentPanelArray[0] !== 'greenroom')
    trashPath = 'Core';

  if (files && files.length === 1) {
    content = (
      <p>{`${files[0].fileName} will be sent to ${trashPath} > Trash Bin`}</p>
    );

    if (permission === 'collaborator' && panelKey === 'core-Raw') {
      const ownFiles = files.filter(el => el.uploader === username);
      const otherFiles = files.filter(el => el.uploader !== username);

      if (ownFiles && ownFiles.length) {
        content = (
          <p>{`${files[0].fileName} will be sent to ${trashPath} > Trash Bin`}</p>
        );
      } else {
        content = (
          <p>{`${files[0].fileName} will be skipped. Because it is uploaded by other user.`}</p>
        );
      }
    }
  } else if (files && files.length > 1) {
    content = (
      <div>
        <p>
          {`The following ${files.length} files will be sent to ${trashPath} > Trash Bin`}
        </p>

        <ul style={{ maxHeight: 90, overflowY: 'scroll' }}>
          {files.map((v) => {
            return <li key={v.name}>{v.fileName}</li>;
          })}
        </ul>
      </div>
    );

    if (permission === 'collaborator' && panelKey === 'core-Raw') {
      const ownFiles = files.filter(el => el.uploader === username);
      const otherFiles = files.filter(el => el.uploader !== username);

      if (otherFiles && otherFiles.length) {
        content = (
          <div>
            <p>
              {`${otherFiles.length} files will be skipped. Because these files are uploaded by other users.`}
            </p>
  
            <p>
              {`The following ${ownFiles.length} files will be sent to ${trashPath} > Trash Bin`}
            </p>
    
            <ul style={{ maxHeight: 90, overflowY: 'scroll' }}>
              {ownFiles.map((v) => {
                return <li key={v.name}>{v.fileName}</li>;
              })}
            </ul>
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
      {content}
    </Modal>
  );
};

export default DeleteFilesModal;
