import React, { useState } from 'react';
import { Modal, Button, Input, Popover, Tooltip, Form, message } from 'antd';
import {
  CloudServerOutlined,
  FolderOutlined,
  FileImageOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import CoreDirTree from '../Copy2Core/CoreDirTree';
import { requestToCoreAPI } from '../../../../../../../APIs/index';
import {
  fileNameOrPathDisplay,
  getCurrentProject,
} from '../../../../../../../Utility';
import i18n from '../../../../../../../i18n';
import styles from './index.module.scss';

const { TextArea } = Input;

const RequestToCoreModal = (props) => {
  const { showModal, setShowModal, selectedRows, sourcePath, orderRouting } =
    props;
  const [step, setStep] = useState(1);
  const [destination, setDestination] = useState(null);
  const [destinationPath, setDestinationPath] = useState('');
  const [validateDestination, setValidateDestination] = useState(false);
  const [step2SelectDisabled, setStep2SelectDisabled] = useState(false);
  const [btnLoading, setBtnLoading] = useState(false);
  const [requestNote, setRequestNote] = useState('');
  const { datasetId } = useParams();
  const [form] = Form.useForm();
  const userName = useSelector((state) => state.username);
  const currentProject = getCurrentProject(datasetId);
  const entityGeids = selectedRows.map((el) => el.geid);
  const sourceFolderGeid = orderRouting[orderRouting.length - 1].globalEntityId;

  const handleCloseModal = () => {
    setShowModal(false);
    setDestination(null);
    setRequestNote('');
    form.resetFields(['notes']);
  };
  const handleOnChange = (e) => {
    setRequestNote(e.target.value);
  };

  const sendRequestToCore = async () => {
    try {
      setBtnLoading(true);
      const res = await requestToCoreAPI(
        currentProject.globalEntityId,
        entityGeids,
        destination.geid,
        sourceFolderGeid,
        sourcePath,
        destinationPath,
        requestNote.trim(),
        userName,
      );
      setBtnLoading(false);
      setDestination(null);
      form.resetFields(['notes']);
      message.success(`${i18n.t('success:requestToCore.default.0')}`, 3);
      if (res.data.code === 200) {
        setShowModal(false);
      }
    } catch (error) {
      message.error(`${i18n.t('errormessages:requestToCore.default.0')}`, 3);
      setBtnLoading(false);
    }
  };

  const handleStep2Select = () => {
    setStep(1);
    if (destination) {
      const folderNames = destination.routes.map((v) => v.title);
      const path = folderNames.join('/');
      setDestinationPath(`${path}`);
    }
  };

  const modalFooter = (step) => {
    switch (step) {
      case 1:
        return (
          <div className={styles.step_one_footer}>
            <Button className={styles.btn_cancel} onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button
              className={styles.btn_confirm}
              id="btn_confirm"
              type="primary"
              disabled={
                requestNote.trim().length &&
                destination &&
                destination.routes.length
                  ? false
                  : true
              }
              loading={btnLoading}
              onClick={sendRequestToCore}
            >
              Confirm
            </Button>
          </div>
        );
      case 2:
        return (
          <div>
            <Button style={{ border: '0px' }} onClick={() => setStep(1)}>
              Cancel
            </Button>
            <Button
              type="primary"
              data-id="select_path_btn"
              style={{ borderRadius: '6px' }}
              disabled={step2SelectDisabled}
              onClick={handleStep2Select}
            >
              Select
            </Button>
          </div>
        );
      default:
        return null;
    }
  };

  const filesPathDisplay = () => {
    return selectedRows.map((el) => {
      const filePath = el.displayPath.replace(el.fileName, '');
      if (el.nodeLabel.includes('Folder')) {
        return (
          <p className={styles.file_path_display}>
            <FolderOutlined className={styles.icon} />{' '}
            <span className={styles.file_name}>
              {fileNameOrPathDisplay(el.fileName)}
            </span>
            <span className={styles.file_path}>
              /Green Room/{fileNameOrPathDisplay(filePath)}
            </span>
          </p>
        );
      } else {
        return (
          <p className={styles.file_path_display}>
            <FileImageOutlined className={styles.icon} />{' '}
            <span className={styles.file_name}>
              {fileNameOrPathDisplay(el.fileName)}
            </span>
            <span className={styles.file_path}>
              /Green Room/{fileNameOrPathDisplay(filePath)}
            </span>
          </p>
        );
      }
    });
  };

  const popoverContent = (
    <p>
      Handling duplicate files or folders If a file with same name already
      exists in the destination, the file will be copied and a time-stamp will
      be appended to its filename. If a folder with the same name already exists
      in the destination, the files will be copied into the existing folder and
      a 10-digit time-based integer hash will be appended to the duplicate
      filenames.
    </p>
  );

  const modalTitle = (
    <p>
      <span>Request to Core</span>
      <Popover
        className={styles.popover}
        overlayClassName={styles.request2core_popover}
        content={popoverContent}
        placement={'bottomLeft'}
      >
        <ExclamationCircleOutlined />{' '}
        <span data-id="handling-duplicate-note">
          Handling duplicate files or folders
        </span>
      </Popover>
    </p>
  );

  function getCurrentFolder() {
    if (
      !destination ||
      !destination.routes ||
      destination.routes.length === 0
    ) {
      return null;
    }
    const MAX_CHARS = 35;
    const folderNames = destination.routes.map((v) => v.title);
    const path = folderNames.join(' / ');
    if (path.length > MAX_CHARS) {
      let shortPath = '';
      for (let i = folderNames.length - 1; i >= 0; i--) {
        if (
          i === folderNames.length - 1 &&
          folderNames[i].length > MAX_CHARS - 5
        ) {
          const shortenName = folderNames[i].slice(
            folderNames[i].length - (MAX_CHARS - 7),
            folderNames[i].length,
          );
          return (
            <Tooltip title={path}>
              {'Core / ... / ' + shortenName + '...'}
            </Tooltip>
          );
        }
        if ((folderNames[i] + ' / ' + shortPath).length > MAX_CHARS - 2) {
          return <Tooltip title={path}>{'Core / ... / ' + shortPath}</Tooltip>;
        }
        if (i === folderNames.length - 1) {
          shortPath = folderNames[i];
        } else {
          shortPath = folderNames[i] + ' / ' + shortPath;
        }
      }
      return <Tooltip title={path}>{'Core / ' + shortPath}</Tooltip>;
    } else {
      return 'Core / ' + path;
    }
  }

  const folderPathRender = () => {
    if (validateDestination) {
      return (
        <div style={{ marginLeft: 16 }}>
          <span style={{ color: '#FF6D72', fontStyle: 'italic' }}>
            *Select Destination
          </span>
        </div>
      );
    } else if (!validateDestination && destination) {
      if (destination.routes.length === 0) {
        return null;
      }
      return (
        <div data-id="folder-path" style={{ marginLeft: 16 }}>
          <p style={{ fontSize: 14, lineHeight: '18px', margin: 0 }}>
            Selected file(s) will be copied to
          </p>
          <p
            style={{
              fontSize: 14,
              lineHeight: '18px',
              fontWeight: 'bold',
              margin: 0,
            }}
          >
            {getCurrentFolder()}
          </p>
        </div>
      );
    } else {
      return null;
    }
  };

  return (
    <Modal
      className={styles.request_to_core_modal + ' request2core_modal'}
      title={modalTitle}
      visible={showModal}
      maskClosable={false}
      //destroyOnClose={true}
      centered={true}
      onCancel={handleCloseModal}
      footer={[modalFooter(step)]}
    >
      {step === 1 && (
        <>
          <div className={styles.section_one}>
            <p style={{ marginBottom: '5px' }}>Selected file(s)</p>
            {filesPathDisplay()}
          </div>
          <div className={styles.section_two}>
            <p>Where would you like to copy selected file(s)/folder(s) to?</p>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Button
                data-id="select_detination_btn"
                icon={<CloudServerOutlined />}
                onClick={() => setStep(2)}
              >
                Select Destination
              </Button>
              {folderPathRender()}
            </div>
          </div>
          <div className={styles.section_three}>
            <p>
              Request notes<span>*</span>
            </p>
            <Form form={form}>
              <Form.Item name="notes">
                <TextArea
                  data-id="request-notes"
                  maxLength={250}
                  onChange={handleOnChange}
                />
              </Form.Item>
            </Form>
            <span className={styles.request_note}>{`${
              requestNote.trim().length ? requestNote.trim().length : 0
            }/250`}</span>
          </div>
        </>
      )}
      {step === 2 && (
        <CoreDirTree
          destination={destination}
          setDestination={setDestination}
          setValidateDestination={setValidateDestination}
          setStep2SelectDisabled={setStep2SelectDisabled}
        />
      )}
    </Modal>
  );
};

export default RequestToCoreModal;
