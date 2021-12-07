import React from 'react';
import { Modal, Input, message, Button, Tooltip, Popover } from 'antd';
import {
  ArrowLeftOutlined,
  CloudServerOutlined,
  ExclamationCircleOutlined,
  EditOutlined,
  CheckOutlined,
} from '@ant-design/icons';
import Icon from '@ant-design/icons';
import { useSelector, useDispatch } from 'react-redux';
import { trimString } from '../../../../../../../Utility';
import { triggerEvent } from '../../../../../../../Redux/actions';
import { useEffect } from 'react';
import { tokenManager } from '../../../../../../../Service/tokenManager';
import { FILE_OPERATIONS } from '../../FileOperationValues';
import i18n from '../../../../../../../i18n';
import styles from './index.module.scss';
import {
  commitFileAction,
  validateRepeatFiles,
} from '../../../../../../../APIs';
import CoreDirTree from './CoreDirTree';

const Copy2CoreModal = ({
  visible,
  setVisible,
  files,
  selectedRows,
  eraseSelect,
}) => {
  const [confirmLoading, setConfirmLoading] = React.useState(false);
  const [proceedLoading, setProceedLoading] = React.useState(false);
  const [step2SelectDisabled, setStep2SelectDisabled] = React.useState(false);
  const [codeRandom, setCodeRandom] = React.useState('');
  const [codeInput, setCodeInput] = React.useState('');
  const [validateCodeInput, setValidateCodeInput] = React.useState('');
  const [validateDestination, setValidateDestination] = React.useState(false);
  const project = useSelector((state) => state.project);
  const username = useSelector((state) => state.username);
  const [step, setStep] = React.useState(1);
  const [skipped, setSkipped] = React.useState([]);
  const [need2Rename, setNeed2Rename] = React.useState([]);
  const [renamedFilesObj, setRenamedFilesObj] = React.useState({});
  const [renameSuccessList, setRenameSuccessList] = React.useState([]);
  const [renameValidateFailedObj, setRenameValidateFailedObj] = React.useState(
    {},
  );
  const [nameFormatFailedObj, setNameFormatFailedObj] = React.useState({});
  const [locked, setLocked] = React.useState([]);
  const [destination, setDestination] = React.useState(null);
  const dispatch = useDispatch();
  const btnDisabled = files.length === skipped.length;
  const sessionId = tokenManager.getCookie('sessionId');

  async function closeModal() {
    setVisible(false);
    setTimeout(() => {
      setCodeInput('');
      setCodeRandom(randomTxt(5));
      setStep(1);
      setSkipped([]);
      setNeed2Rename([]);
      setLocked([]);
      setRenamedFilesObj({});
      setRenameSuccessList([]);
      setRenameValidateFailedObj({});
      setStep2SelectDisabled(false);
    }, 300);
    if (step === 4) {
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

  const handleCancel = () => {
    closeModal();
    setRenamedFilesObj({});
    setValidateCodeInput('');
    setValidateDestination(false);
    setDestination(null);
  };

  useEffect(() => {
    setCodeRandom(randomTxt(5));
  }, []);

  const handleStep1Confirm = async () => {
    if (codeRandom === codeInput && destination) {
      if (destination.routes.length === 0) {
        setValidateDestination(true);
        return;
      }
      setConfirmLoading(true);
      try {
        await commitFileAction(
          {
            targets: files.map((file) => {
              return {
                geid: file.geid,
              };
            }),
            destination: destination.geid,
          },
          username,
          FILE_OPERATIONS.COPY,
          project.profile.globalEntityId,
          sessionId,
        );
      } catch (err) {
        if (err.response && err.response.status === 409) {
          const responseData = JSON.parse(err.response.data);
          let existingFilesList = responseData.result.filter(
            (item) => item.is_valid === false && item.error === 'entity-exist',
          );
          if (existingFilesList.length) {
            let existingFiles = existingFilesList
              .map((v) => {
                const selFileItem = files.find(
                  (selFile) => selFile.geid === v.geid,
                );
                if (selFileItem) {
                  return {
                    name: selFileItem.file_name,
                    geid: selFileItem.geid,
                  };
                } else {
                  return null;
                }
              })
              .filter((v) => !!v);
            existingFiles = existingFiles.filter(
              (item, index, self) =>
                index === self.findIndex((t) => t.geid === item.geid),
            );
            if (existingFiles.length > 0) {
              setStep(3);
            }
            setSkipped(existingFiles);
            setNeed2Rename(existingFiles);
          }
        }
        setConfirmLoading(false);
        return;
      }
      setTimeout(() => {
        dispatch(triggerEvent('LOAD_COPY_LIST'));
      }, 1000);
      setConfirmLoading(false);
      setStep(4);
    } else if (codeRandom !== codeInput && destination) {
      if (destination.routes.length === 0) {
        setValidateCodeInput(true);
        setValidateDestination(true);
      } else if (destination.routes.length > 0) {
        setValidateCodeInput(true);
      }
    } else if (codeRandom !== codeInput && destination === null) {
      setValidateCodeInput(true);
      setValidateDestination(true);
    } else if (codeRandom === codeInput && destination === null) {
      setValidateDestination(true);
    }
  };

  const handleStep3Proceed = async () => {
    setProceedLoading(true);
    try {
      await commitFileAction(
        {
          targets: files
            .map((file) => {
              if (
                need2Rename.find((renameFile) => renameFile.geid === file.geid)
              ) {
                // files need to be renamed
                const fileNameRecord = renameSuccessList.find(
                  (v) => v.geid === file.geid,
                );
                if (fileNameRecord) {
                  return {
                    geid: file.geid,
                    rename: fileNameRecord['name'],
                  };
                }
                return null;
              } else {
                // files do not need to be renamed
                return {
                  geid: file.geid,
                };
              }
            })
            .filter((file) => !!file),
          destination: destination.geid,
        },
        username,
        FILE_OPERATIONS.COPY,
        project.profile.globalEntityId,
        sessionId,
      );

      setTimeout(() => {
        dispatch(triggerEvent('LOAD_COPY_LIST'));
      }, 1000);
      setProceedLoading(false);
      setStep(4);
    } catch (e) {
      message.error(`${i18n.t('errormessages:copyFiles.default.0')}`, 3);
      setProceedLoading(false);
    }
  };

  const modalFooter = (step) => {
    switch (step) {
      case 1:
        return (
          <div>
            <Button style={{ border: '0px' }} onClick={handleCancel}>
              Cancel
            </Button>
            <Button
              type="primary"
              style={{ borderRadius: '6px' }}
              loading={confirmLoading}
              onClick={handleStep1Confirm}
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
              style={{ borderRadius: '6px' }}
              disabled={step2SelectDisabled}
              onClick={() => setStep(1)}
            >
              Select
            </Button>
          </div>
        );
      case 3:
        return (
          <div>
            <Button
              icon={<ArrowLeftOutlined />}
              style={{ border: '0px' }}
              onClick={() => {
                setStep(1);
                setRenamedFilesObj({});
                setRenameSuccessList([]);
                setRenameValidateFailedObj({});
              }}
            >
              Go back
            </Button>
            <Button
              type="primary"
              disabled={btnDisabled}
              loading={proceedLoading}
              style={{ borderRadius: '6px' }}
              onClick={() => handleStep3Proceed()}
            >
              Proceed
            </Button>
          </div>
        );
      case 4:
        return (
          <div>
            <Button
              type="primary"
              onClick={handleCancel}
              style={{ borderRadius: '6px' }}
            >
              Close
            </Button>
          </div>
        );
      case 5:
        return (
          <div>
            <Button
              type="primary"
              onClick={handleCancel}
              style={{ borderRadius: '6px' }}
            >
              Ok
            </Button>
          </div>
        );
      default:
        return null;
    }
  };

  const step4ModalContent = (selectedRows, skipped) => {
    if (skipped.length === 0) {
      return (
        <div style={{ display: 'flex' }}>
          <div style={{ width: '22px', margin: '0px 5px' }}>
            <ExclamationCircleOutlined style={{ color: '#5B8C00' }} />
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ marginBottom: '0px' }}>
              <strong>
                {selectedRows.length} file(s)/folder(s) will be copied to:
              </strong>
            </p>
            <p>{getCurrentFolder()}</p>
          </div>
        </div>
      );
    } else if (skipped.length > 0 && selectedRows.length - skipped.length > 0) {
      return (
        <div>
          <div style={{ display: 'flex' }}>
            <div style={{ width: '22px', margin: '0px 5px' }}>
              <ExclamationCircleOutlined style={{ color: '#5B8C00' }} />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ marginBottom: '8px' }}>
                <strong>
                  {selectedRows.length - skipped.length} file(s)/folder(s) will
                  be copied to:
                </strong>
              </p>
              <p>{getCurrentFolder()}</p>
            </div>
          </div>
          <div style={{ display: 'flex' }}>
            <div style={{ width: '22px', margin: '0px 5px' }}>
              <ExclamationCircleOutlined style={{ color: '#FFC118' }} />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ marginBottom: '8px' }}>
                <strong>{skipped.length} file(s)/folder(s)</strong> will be
                skipped
              </p>
              {skipped && skipped.length ? (
                <ul
                  style={{
                    maxHeight: 90,
                    overflowY: 'auto',
                    paddingLeft: '20px',
                    margin: '0px',
                  }}
                >
                  {skipped.map((v, index) => {
                    return (
                      <li key={v.geid} style={{ fontWeight: 600 }}>
                        {v.name}
                      </li>
                    );
                  })}
                </ul>
              ) : null}
            </div>
          </div>
        </div>
      );
    } else if (skipped.length > 0 && selectedRows.length === skipped.length) {
      return (
        <div style={{ display: 'flex' }}>
          <div style={{ width: '22px', margin: '0px 5px' }}>
            <ExclamationCircleOutlined style={{ color: '#FFC118' }} />
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ marginBottom: '8px' }}>
              <strong>{skipped.length} file(s)/folder(s)</strong> will be
              skipped
            </p>
            {skipped && skipped.length ? (
              <ul
                style={{
                  maxHeight: 90,
                  overflowY: 'auto',
                  paddingLeft: '20px',
                  margin: '0px',
                }}
              >
                {skipped.map((v, index) => {
                  return (
                    <li key={v.geid} style={{ fontWeight: 600 }}>
                      {v.name}
                    </li>
                  );
                })}
              </ul>
            ) : null}
          </div>
        </div>
      );
    }
  };

  const validateFolderName = (value, geid) => {
    const renameStr = value ? trimString(value) : null;
    if (!renameStr) {
      setNameFormatFailedObj({
        ...nameFormatFailedObj,
        [geid]: 'Folder name should be 1 ~ 20 characters',
      });
      return;
    }
    const isLengthValid = renameStr.length >= 1 && renameStr.length <= 20;
    if (!isLengthValid) {
      setNameFormatFailedObj({
        ...nameFormatFailedObj,
        [geid]: 'Folder name should be 1 ~ 20 characters',
      });
      return;
    }
    const specialChars = [
      '\\',
      '/',
      ':',
      '?',
      '*',
      '<',
      '>',
      '|',
      '"',
      "'",
      '.',
    ];
    for (let char of specialChars) {
      if (renameStr.indexOf(char) !== -1) {
        setNameFormatFailedObj({
          ...nameFormatFailedObj,
          [geid]: `Following character is forbidden: ${specialChars.join(' ')}`,
        });
        return;
      }
    }
    if (
      !destination ||
      !destination.routes ||
      destination.routes.length === 0
    ) {
      const reserved = ['raw', 'logs', 'trash', 'workdir'];
      if (reserved.indexOf(renameStr.toLowerCase()) !== -1) {
        setNameFormatFailedObj({
          ...nameFormatFailedObj,
          [geid]: `Following folder name is reserved: ${reserved.join(' ')}`,
        });
        return;
      }
    }
    const obj = { ...nameFormatFailedObj };
    delete obj[geid];
    setNameFormatFailedObj(obj);
  };
  const handleRenameOnChange = (e, geid) => {
    const renameStr = e.target.value;
    const renameItem = files.find((x) => x.geid === geid);
    let obj = { ...renamedFilesObj };
    obj[geid] = trimString(renameStr);
    setRenamedFilesObj({
      ...obj,
    });
    if (renameItem && renameItem.nodeLabel?.indexOf('Folder') !== -1) {
      validateFolderName(renameStr, geid);
    }
  };

  const renameFile = async (geid, type) => {
    let obj = { ...renameValidateFailedObj };
    let obj1 = { ...renamedFilesObj };
    const fileNewName = renamedFilesObj[geid];
    if (type === 'skippedList') {
      try {
        await validateRepeatFiles(
          [{ geid, rename: fileNewName }],
          destination.geid,
          username,
          FILE_OPERATIONS.COPY,
          project.profile.globalEntityId,
          sessionId,
        );
      } catch (err) {
        if (err.response && err.response.status === 409) {
          const responseData = JSON.parse(err.response.data);
          let existingFilesList = responseData.result.filter(
            (item) => item.is_valid === false && item.error === 'entity-exist',
          );
          if (existingFilesList.length) {
            obj[geid] = true;
            setRenameValidateFailedObj({ ...obj });
            return;
          }
        }
      }
      setRenameSuccessList([...renameSuccessList, { name: fileNewName, geid }]);

      // reset the renamedFiles object when a file has successfully renamed.
      delete obj1[geid];
      setRenamedFilesObj(obj1);

      if (obj[geid]) {
        delete obj[geid];
        setRenameValidateFailedObj({ ...obj });
      }
      const newSkippedFile = skipped.filter((el) => el.geid !== geid);
      setSkipped(newSkippedFile);
    } else if (type === 'succeedList') {
      try {
        await validateRepeatFiles(
          [{ geid, rename: fileNewName }],
          destination.geid,
          username,
          FILE_OPERATIONS.COPY,
          project.profile.globalEntityId,
          sessionId,
        );
      } catch (err) {
        if (err.response && err.response.status === 409) {
          const responseData = JSON.parse(err.response.data);
          let existingFilesList = responseData.result.filter(
            (item) => item.is_valid === false && item.error === 'entity-exist',
          );
          if (existingFilesList.length) {
            obj[geid] = true;
            setRenameValidateFailedObj({ ...obj });
            return;
          }
        }
      }
      let newSuccessList = renameSuccessList.map((el) => {
        if (el.geid === geid) {
          return {
            name: fileNewName,
            geid,
          };
        } else {
          return el;
        }
      });
      setRenameSuccessList(newSuccessList);
      // reset the renamedFiles object when a file has successfully renamed.
      delete obj1[geid];
      setRenamedFilesObj(obj1);
    }
  };

  const renameFileRender = (list, type) => {
    return list.map((v, index) => {
      let obj = { ...renamedFilesObj };
      if (Object.keys(renamedFilesObj).includes(v.geid)) {
        return (
          <div
            style={{
              marginBottom: '10px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'baseline' }}>
              <li key={v.geid} style={{ width: '200px' }}>
                <Input
                  defaultValue={v.name}
                  onChange={(e) => {
                    handleRenameOnChange(e, v.geid);
                  }}
                  style={{ borderRadius: '6px', height: '30px' }}
                ></Input>
              </li>
              <Button
                icon={<CheckOutlined />}
                type="primary"
                onClick={() => {
                  if (!nameFormatFailedObj[v.geid]) {
                    renameFile(v.geid, type);
                  }
                }}
                style={{
                  borderRadius: '6px',
                  marginLeft: '15px',
                  width: '85px',
                  height: '25px',
                  padding: '0px',
                }}
              >
                Confirm
              </Button>
            </div>
            {nameFormatFailedObj[v.geid] && (
              <p
                style={{
                  color: '#FF6D72',
                  fontStyle: 'italic',
                  marginLeft: '10px',
                  marginBottom: '0px',
                  marginTop: 0,
                }}
              >
                {nameFormatFailedObj[v.geid]}
              </p>
            )}

            {renameValidateFailedObj[v.geid] && (
              <p
                style={{
                  color: '#FF6D72',
                  fontStyle: 'italic',
                  marginLeft: '10px',
                  marginBottom: '0px',
                  marginTop: 0,
                }}
              >
                Name already exist
              </p>
            )}
          </div>
        );
      } else {
        return (
          <div style={{ display: 'flex', alignItems: 'baseline' }}>
            <div style={{ width: '200px' }}>
              {v.name.length > 30 ? (
                <Tooltip title={v.name}>
                  <li
                    key={v.geid}
                    style={{
                      fontWeight: 600,
                      maxWidth: '220px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {v.name}
                  </li>
                </Tooltip>
              ) : (
                <li
                  key={v.geid}
                  style={{
                    fontWeight: 600,
                    maxWidth: '220px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {v.name}
                </li>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', flex: 1 }}>
              <p
                style={{
                  cursor: 'pointer',
                  color: '#1890FF',
                  marginLeft: '14px',
                }}
                onClick={() => {
                  obj[v.geid] = v.name;
                  setRenamedFilesObj({
                    ...obj,
                  });
                }}
              >
                <EditOutlined style={{ marginRight: '6px' }} />
                Rename the copy
              </p>
              <Icon
                style={{ marginLeft: '10px' }}
                component={() => (
                  <img
                    alt="Approved"
                    style={{ width: '15px', height: '15px' }}
                    src={require('../../../../../../../Images/Approved.png')}
                  />
                )}
              />
            </div>
          </div>
        );
      }
    });
  };

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
        <div style={{ marginLeft: 16 }}>
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
      <span>Copy to Core</span>
      <Popover
        className={styles.popover}
        overlayClassName={styles.copy2core_popover}
        content={popoverContent}
        placement={'bottomLeft'}
      >
        <ExclamationCircleOutlined />{' '}
        <span>Handling duplicate files or folders</span>
      </Popover>
    </p>
  );

  return (
    <Modal
      className={styles.copy_to_core_modal}
      title={modalTitle}
      visible={visible}
      maskClosable={false}
      centered={true}
      confirmLoading={confirmLoading}
      //okText={step === 1 ? 'Confirm' : 'OK'}
      onCancel={handleCancel}
      footer={[modalFooter(step)]}
      cancelButtonProps={{ style: { display: 'none' } }}
    >
      {step === 1 && (
        <>
          <div style={{ maxWidth: '380px' }}>
            <p>
              You are about to copy {files.length} files from the Green Room
            </p>
            <p style={{ marginBottom: '8px' }}>
              Please input the code:{' '}
              <b className={styles.no_select}>{codeRandom}</b> to confirm{' '}
              {validateCodeInput === true && (
                <span style={{ color: '#FF6D72', fontStyle: 'italic' }}>
                  *Enter code
                </span>
              )}
            </p>
            <Input
              style={{ borderRadius: '6px', marginBottom: '20px' }}
              placeholder="Enter Code"
              value={codeInput}
              onChange={(e) => {
                setCodeInput(e.target.value);
                if (e.target.value === codeRandom) {
                  setValidateCodeInput(false);
                }
              }}
              onKeyDown={function (e) {
                if (e.key === 'Enter') {
                  handleStep1Confirm();
                }
              }}
            />
          </div>
          <div>
            <p>Where would you like to copy selected file(s)/folder(s) to?</p>
            <div style={{ display: 'flex' }}>
              <Button
                icon={<CloudServerOutlined />}
                style={{ borderRadius: '6px' }}
                onClick={() => setStep(2)}
              >
                Select Destination
              </Button>
              {folderPathRender()}
            </div>
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
      {step === 3 && (
        <div style={{ display: 'flex' }}>
          <div style={{ width: '22px', margin: '0px 5px' }}>
            <ExclamationCircleOutlined style={{ color: '#FFC118' }} />
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ marginBottom: '8px' }}>
              Transfering file(s)/folder(s) is in progress. It may take some
              time
            </p>
            {renameSuccessList && renameSuccessList.length > 0 && (
              <ul
                style={{
                  maxHeight: 100,
                  overflowY: 'auto',
                  paddingLeft: '20px',
                  margin: '0px',
                }}
              >
                {renameFileRender(renameSuccessList, 'succeedList')}
              </ul>
            )}
            {skipped && skipped.length ? (
              <>
                <p style={{ marginBottom: '8px' }}>
                  The following <strong>{skipped.length}</strong> file(s) will
                  be skipped because they already exist
                </p>
                <ul
                  style={{
                    maxHeight: 100,
                    overflowY: 'auto',
                    paddingLeft: '20px',
                    margin: '0px',
                  }}
                >
                  {renameFileRender(skipped, 'skippedList')}
                </ul>
              </>
            ) : null}
            <p>
              Would you like to proceed with the copies or{' '}
              <strong>rename</strong> the files in core?
            </p>
          </div>
        </div>
      )}
      {step === 4 && step4ModalContent(selectedRows, skipped)}
      {step === 5 && (
        <div style={{ display: 'flex' }}>
          <div style={{ width: '22px', margin: '0px 5px' }}>
            <ExclamationCircleOutlined style={{ color: '#FFC118' }} />
          </div>
          <div style={{ flex: 1, marginTop: '-4px' }}>
            <p
              style={{
                fontSize: '18px',
                fontWeight: 'bold',
                marginBottom: '10px',
              }}
            >
              Invalid File/Folder Operation
            </p>
            <p style={{ marginBottom: '10px' }}>
              The following {locked.length} file(s)/folder(s) will be skipped
              because there are concurrent file operations are taking place:
            </p>
            {locked &&
              locked.length > 0 &&
              locked.map((v) => {
                return (
                  <ul
                    style={{
                      maxHeight: 100,
                      overflowY: 'auto',
                      paddingLeft: '20px',
                      margin: '0px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'baseline' }}>
                      <li key={v} style={{ fontWeight: 600 }}>
                        {v.length > 30 ? (
                          <Tooltip title={v}>{`${v.slice(0, 30)}...`}</Tooltip>
                        ) : (
                          v
                        )}
                      </li>
                    </div>
                  </ul>
                );
              })}
          </div>
        </div>
      )}
    </Modal>
  );
};

export default Copy2CoreModal;
