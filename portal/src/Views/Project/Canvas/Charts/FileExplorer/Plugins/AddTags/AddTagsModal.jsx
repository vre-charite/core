import React, { useState } from 'react';
import { Modal, Select, Menu, Dropdown, Button, Checkbox, message } from 'antd';
import { batchTagsAPI } from '../../../../../../../APIs';
import { validateTag } from '../../../../../../../Utility';
import { useSelector, connect } from 'react-redux';
import { setSuccessNum } from '../../../../../../../Redux/actions';
import {
  CloseOutlined,
  PlusOutlined,
  FileImageOutlined,
  FolderOutlined,
  DeleteOutlined,
  DownOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import i18n from '../../../../../../../i18n';
import styles from './index.module.scss';

const AddTagsModal = ({ visible, setVisible, selectedRows, setSuccessNum }) => {
  const [step, setStep] = useState(1);
  const [addTagsToFolder, setAddTagsToFolder] = useState(false);
  const [removeTagsFromFolder, setRemoveTagsFromFolder] = useState(false);
  const [addTagsArray, setAddTagsArray] = useState([]);
  const [removeTagsArray, setRemoveTagsArray] = useState([]);
  const [addTagsBtnLoading, setAddTagsBtnLoading] = useState(false);
  const [removeTagsBtnLoading, setRemoveTagsBtnLoading] = useState(false);
  const [addTagsCheckBoxDisabled, setAddTagsCheckBoxDisabled] = useState(false);
  const [removeTagsCheckBoxDisabled, setRemoveTagsCheckBoxDisabled] =
    useState(false);
  const [skippedArray, setSkippedArray] = useState([]);
  const [addTagsErrorMessage, setAddTagsErrorMessage] = useState([]);
  const [removeTagsErrorMessage, setRemoveTagsErrorMessage] = useState([]);

  const project = useSelector((state) => state.project);
  const successNum = useSelector((state) => state.successNum);
  const children = [];
  const menu = (
    <Menu className={styles.tags_menu}>
      {step === 1 && (
        <Menu.Item key="0" onClick={() => setStep(2)}>
          <DeleteOutlined style={{ color: '#1890FF' }} />
          <span style={{ color: '#1890FF' }}>Remove Tags</span>
        </Menu.Item>
      )}
      {step === 2 && (
        <Menu.Item key="0" onClick={() => setStep(1)}>
          <PlusOutlined style={{ color: '#1890FF' }} />
          <span style={{ color: '#1890FF' }}>Add Tags</span>
        </Menu.Item>
      )}
    </Menu>
  );

  async function closeModal() {
    setVisible(false);
    setAddTagsArray([]);
    setAddTagsToFolder(false);
    setRemoveTagsArray([]);
    setSkippedArray([]);
    setAddTagsErrorMessage([]);
    setRemoveTagsErrorMessage([]);
    setRemoveTagsFromFolder(false);
    setAddTagsCheckBoxDisabled(false);
    setRemoveTagsCheckBoxDisabled(false);
    setTimeout(() => {
      setStep(1);
    }, 300);
  }

  const addTagsSubmit = async () => {
    try {
      if (addTagsErrorMessage.length) {
        return;
      }
      setAddTagsBtnLoading(true);
      setAddTagsCheckBoxDisabled(true);
      let entity = selectedRows.map((el) => el.geid);
      const res = await batchTagsAPI({
        entity,
        project_geid: project.profile.globalEntityId,
        tags: addTagsArray,
        only_files: !addTagsToFolder,
        operation: 'add',
        inherit: true,
      });

      setAddTagsBtnLoading(false);
      setAddTagsCheckBoxDisabled(false);
      setSuccessNum(successNum + 1);
      const skippedArr = res.data.result.filter(
        (el) => el.operationStatus === 'terminated',
      );

      setSkippedArray(skippedArr);
      if (skippedArr.length) {
        setStep(3);
      } else {
        handleCancel();
      }
    } catch (error) {
      setAddTagsBtnLoading(false);
      setAddTagsCheckBoxDisabled(false);
      message.error(`${i18n.t('errormessages:addFileTags.default.0')}`);
    }
  };

  const removeTagsSubmit = async () => {
    try {
      if (removeTagsErrorMessage.length) {
        return;
      }
      setRemoveTagsBtnLoading(true);
      setRemoveTagsCheckBoxDisabled(true);
      let entity = selectedRows.map((el) => el.geid);
      await batchTagsAPI({
        entity,
        project_geid: project.profile.globalEntityId,
        tags: removeTagsArray,
        only_files: !removeTagsFromFolder,
        operation: 'remove',
        inherit: true,
      });
      setRemoveTagsBtnLoading(false);
      setRemoveTagsCheckBoxDisabled(false);
      setSuccessNum(successNum + 1);
      handleCancel();
    } catch (error) {
      setRemoveTagsBtnLoading(false);
      setRemoveTagsCheckBoxDisabled(false);
      message.error(`${i18n.t('errormessages:deleteFileTags.default.0')}`);
    }
  };

  const handleCancel = () => {
    closeModal();
  };

  const modalFooter = (step) => {
    switch (step) {
      case 1:
        return (
          <Button
            type="primary"
            disabled={
              addTagsArray.length && !addTagsErrorMessage.length ? false : true
            }
            loading={addTagsBtnLoading}
            onClick={addTagsSubmit}
          >
            Add Tags
          </Button>
        );
      case 2:
        return (
          <Button
            type="primary"
            disabled={
              removeTagsArray.length && !removeTagsErrorMessage.length
                ? false
                : true
            }
            onClick={removeTagsSubmit}
            loading={removeTagsBtnLoading}
            danger
          >
            Remove
          </Button>
        );
      case 3:
        return (
          <Button type="primary" onClick={handleCancel}>
            OK
          </Button>
        );
    }
  };

  const tagsModalContent = (operation) => {
    return (
      <div style={{ marginLeft: '20px' }}>
        <div style={{ marginTop: '20px' }}>
          {operation === 'addTags' ? (
            <Checkbox
              checked={addTagsToFolder}
              disabled={addTagsCheckBoxDisabled}
              onChange={() => setAddTagsToFolder(!addTagsToFolder)}
            >
              Add tag to all the folders
            </Checkbox>
          ) : (
            <Checkbox
              checked={removeTagsFromFolder}
              disabled={removeTagsCheckBoxDisabled}
              onChange={() => setRemoveTagsFromFolder(!removeTagsFromFolder)}
            >
              Remove tag on all the folders
            </Checkbox>
          )}
        </div>
        <p style={{ marginTop: '25px', marginBottom: '10px' }}>
          Files and/or Folders selected
        </p>
        <div style={{ maxHeight: '100px', overflowY: 'scroll' }}>
          {selectedRows.map((el) => {
            if (el.nodeLabel.includes('File')) {
              return (
                <div style={{ display: 'flex', alignItems: 'baseline' }}>
                  <FileImageOutlined style={{ marginLeft: '4px' }} />
                  <p
                    style={{
                      margin: '0px 0px 5px 10px',
                      fontSize: '14px',
                      fontWeight: 600,
                    }}
                  >
                    {el.fileName}
                  </p>
                </div>
              );
            } else if (el.nodeLabel.includes('Folder')) {
              return (
                <div style={{ display: 'flex', alignItems: 'baseline' }}>
                  <FolderOutlined style={{ marginLeft: '4px' }} />
                  <p
                    style={{
                      margin: '0px 0px 5px 10px',
                      fontSize: '14px',
                      fontWeight: 600,
                    }}
                  >
                    {el.fileName}
                  </p>
                </div>
              );
            }
          })}
        </div>
      </div>
    );
  };

  const handleAddTagsChange = (value) => {
    let errorNum = 0;
    setAddTagsArray(value);
    const projectSystemTags = project.manifest.tags;
    if (value.length) {
      if (value.filter((el) => !validateTag(el)).length) {
        if (
          !addTagsErrorMessage.includes(
            `${i18n.t('formErrorMessages:project.filePanel.tags.valid')}`,
          )
        ) {
          setAddTagsErrorMessage((addTagsErrorMessage) => [
            ...addTagsErrorMessage,
            `${i18n.t('formErrorMessages:project.filePanel.tags.valid')}`,
          ]);
        }
        errorNum++;
      } else {
        if (
          addTagsErrorMessage.includes(
            `${i18n.t('formErrorMessages:project.filePanel.tags.valid')}`,
          )
        ) {
          const newArr = addTagsErrorMessage.filter(
            (el) =>
              el !==
              `${i18n.t('formErrorMessages:project.filePanel.tags.valid')}`,
          );
          setAddTagsErrorMessage(newArr);
        }
      }

      if (value.length > 10) {
        if (
          !addTagsErrorMessage.includes(
            `${i18n.t('formErrorMessages:project.filePanel.tags.limit')}`,
          )
        ) {
          setAddTagsErrorMessage((addTagsErrorMessage) => [
            ...addTagsErrorMessage,
            `${i18n.t('formErrorMessages:project.filePanel.tags.limit')}`,
          ]);
        }
        errorNum++;
      } else {
        if (
          addTagsErrorMessage.includes(
            `${i18n.t('formErrorMessages:project.filePanel.tags.limit')}`,
          )
        ) {
          const newArr = addTagsErrorMessage.filter(
            (el) =>
              el !==
              `${i18n.t('formErrorMessages:project.filePanel.tags.limit')}`,
          );
          setAddTagsErrorMessage(newArr);
        }
      }

      if (
        projectSystemTags &&
        value.filter((el) => projectSystemTags.includes(el)).length
      ) {
        if (
          !addTagsErrorMessage.includes(
            `${i18n.t('formErrorMessages:project.filePanel.tags.systemtags')}`,
          )
        ) {
          setAddTagsErrorMessage([
            ...addTagsErrorMessage,
            `${i18n.t('formErrorMessages:project.filePanel.tags.systemtags')}`,
          ]);
        }
        errorNum++;
      } else {
        if (
          addTagsErrorMessage.includes(
            `${i18n.t('formErrorMessages:project.filePanel.tags.systemtags')}`,
          )
        ) {
          const newArr = addTagsErrorMessage.filter(
            (el) =>
              el !==
              `${i18n.t(
                'formErrorMessages:project.filePanel.tags.systemtags',
              )}`,
          );
          setAddTagsErrorMessage(newArr);
        }
      }

      if (errorNum > 0) {
        return;
      }
    }

    setAddTagsErrorMessage([]);
  };

  const handleRemoveTagsChange = (value) => {
    let errorNum = 0;
    setRemoveTagsArray(value);
    const projectSystemTags = project.manifest.tags;

    if (value.length) {
      if (value.filter((el) => !validateTag(el)).length) {
        if (
          !removeTagsErrorMessage.includes(
            `${i18n.t('formErrorMessages:project.filePanel.tags.valid')}`,
          )
        ) {
          setRemoveTagsErrorMessage([
            ...addTagsErrorMessage,
            `${i18n.t('formErrorMessages:project.filePanel.tags.valid')}`,
          ]);
        }
        errorNum++;
      } else {
        if (
          removeTagsErrorMessage.includes(
            `${i18n.t('formErrorMessages:project.filePanel.tags.valid')}`,
          )
        ) {
          const newArr = removeTagsErrorMessage.filter(
            (el) =>
              el !==
              `${i18n.t('formErrorMessages:project.filePanel.tags.valid')}`,
          );
          setRemoveTagsErrorMessage(newArr);
        }
      }

      if (
        projectSystemTags &&
        value.filter((el) => projectSystemTags.includes(el)).length
      ) {
        if (
          !removeTagsErrorMessage.includes(
            `${i18n.t('formErrorMessages:project.filePanel.tags.systemtags')}`,
          )
        ) {
          setRemoveTagsErrorMessage([
            ...removeTagsErrorMessage,
            `${i18n.t('formErrorMessages:project.filePanel.tags.systemtags')}`,
          ]);
        }
        errorNum++;
      } else {
        if (
          removeTagsErrorMessage.includes(
            `${i18n.t('formErrorMessages:project.filePanel.tags.systemtags')}`,
          )
        ) {
          const newArr = removeTagsErrorMessage.filter(
            (el) =>
              el !==
              `${i18n.t(
                'formErrorMessages:project.filePanel.tags.systemtags',
              )}`,
          );
          setRemoveTagsErrorMessage(newArr);
        }
      }

      if (errorNum > 0) {
        return;
      }
    }

    setRemoveTagsErrorMessage([]);
  };

  return (
    <Modal
      className={styles.tags_modal}
      title={<p style={{ color: '#003262', margin: '0px' }}>Add/Remove Tags</p>}
      visible={visible}
      width={550}
      height={330}
      footer={[modalFooter(step)]}
      centered={true}
      closeIcon={<></>}
      cancelButtonProps={{ style: { display: 'none' } }}
    >
      {step === 1 ? (
        <>
          <div style={{ display: 'flex', alignItems: 'baseline' }}>
            <Dropdown overlay={menu} trigger={['click']}>
              <a>
                <PlusOutlined /> Add Tags <DownOutlined />
              </a>
            </Dropdown>
            <p
              style={{
                color: '#FF6D72',
                fontWeight: 370,
                fontStyle: 'italic',
                marginLeft: '10px',
                marginBottom: '10px',
              }}
            >
              *All files within the folder will have tags attached
            </p>
          </div>
          <div>
            <Select
              mode="tags"
              value={addTagsArray}
              onChange={handleAddTagsChange}
              style={{ width: '100%', borderRadius: '6px' }}
            >
              {children}
            </Select>
          </div>
          {addTagsErrorMessage.length
            ? addTagsErrorMessage.map((el) => (
                <div style={{ color: 'red', marginLeft: '10px' }}>{el}</div>
              ))
            : null}
          {tagsModalContent('addTags')}
        </>
      ) : null}
      {step === 2 ? (
        <>
          <div style={{ display: 'flex', alignItems: 'baseline' }}>
            <Dropdown overlay={menu} trigger={['click']}>
              <a>
                <DeleteOutlined /> Remove Tags <DownOutlined />
              </a>
            </Dropdown>
            <p
              style={{
                color: '#FF6D72',
                fontWeight: 370,
                fontStyle: 'italic',
                marginLeft: '10px',
                marginBottom: '10px',
              }}
            >
              *All tags selected will be removed from all files within the
              folder.
            </p>
          </div>
          <div>
            <Select
              mode="tags"
              value={removeTagsArray}
              onChange={handleRemoveTagsChange}
              style={{ width: '100%', borderRadius: '6px' }}
            >
              {children}
            </Select>
          </div>
          {removeTagsErrorMessage.length
            ? removeTagsErrorMessage.map((el) => (
                <div style={{ color: 'red', marginLeft: '10px' }}>{el}</div>
              ))
            : null}
          {tagsModalContent('removeTags')}
        </>
      ) : null}
      {step === 3 ? (
        <div>
          <ExclamationCircleOutlined
            style={{ color: '#FFC118', margin: '0px 10px 0px 20px' }}
          />{' '}
          {skippedArray.length} file(s)/folder(s) has exceeded 10 tags
          limitation.
        </div>
      ) : null}
      <CloseOutlined
        onClick={handleCancel}
        style={{
          position: 'absolute',
          right: 20,
          top: 16,
          fontSize: '16px',
          zIndex: 1000,
        }}
      />
    </Modal>
  );
};

export default connect(null, { setSuccessNum })(AddTagsModal);
