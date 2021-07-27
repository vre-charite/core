import React, { useState, useEffect, useCallback } from 'react';
import { Modal, Select, message, Result, Tooltip, Input } from 'antd';
import { useSelector, useDispatch } from 'react-redux';
import { useCurrentProject } from '../../../../../../../Utility';
import { getProjectManifestList } from '../../../../../../../APIs';

import { attachManifest } from '../../../../../../../APIs';
import { setSuccessNum } from '../../../../../../../Redux/actions';
import ManifestForm from '../../../../../../../Components/Form/Manifest/ManifestForm';
import { validateForm } from '../../../../../../../Components/Form/Manifest/FormValidate';
import {
  WarningFilled,
  CheckCircleFilled,
  CloseOutlined,
  FileImageOutlined,
  FolderOutlined,
} from '@ant-design/icons';
import i18n from '../../../../../../../i18n';
import styles from './index.module.scss';
const { Option } = Select;
const ManifestManagementModal = ({
  visible,
  setVisible,
  files,
  eraseSelect,
  selectedRows,
}) => {
  // const [confirmLoading, setConfirmLoading] = React.useState(false);
  // const project = useSelector((state) => state.project);
  // const username = useSelector((state) => state.username);
  const [step, setStep] = React.useState(1);
  const successNum = useSelector((state) => state.successNum);
  const dispatch = useDispatch();
  const [currentDataset = {}] = useCurrentProject();
  const [manifestList, setManifestList] = useState([]);
  const [selManifest, setSelManifest] = useState(null);
  const [attrForm, setAttrForm] = useState({});
  const [batchRes, setBatchRes] = useState(null);
  const loadManifest = useCallback(async () => {
    const manifests = await getProjectManifestList(currentDataset.code);
    const rawManifests = manifests.data.result;
    setManifestList(rawManifests);
  }, [currentDataset.code]);
  useEffect(() => {
    loadManifest();
  }, [loadManifest]);
  async function closeModal() {
    setVisible(false);
    setTimeout(() => {
      setStep(1);
      eraseSelect();
      setAttrForm({});
      setSelManifest(null);
    }, 300);
  }
  const handleOk = async () => {
    if (step === 1) {
      if (!selManifest) {
        message.error(
          `${i18n.t('formErrorMessages:attachManifestModal.manifest.empty')}`,
        );
        return;
      }
      const { valid, err } = validateForm(attrForm, selManifest);
      if (!valid) {
        message.error(err);
        return;
      }
      try {
        const res = await attachManifest(
          currentDataset.code,
          selManifest.id,
          files.map((v) => v.geid),
          attrForm,
        );
        setBatchRes(res.data.result?.result);
        setStep(2);
        dispatch(setSuccessNum(successNum + 1));
      } catch (e) {
        message.error(`${i18n.t('errormessages:attachManifest.default.0')}`);
      }
    }
    if (step === 2) {
      closeModal();
    }
  };

  const handleCancel = () => {
    closeModal();
    eraseSelect();
  };

  const successAttahcedList = batchRes?.filter(
    (v) => v.operationStatus === 'SUCCEED',
  );
  const failAttahcedList = batchRes?.filter(
    (v) => v.operationStatus === 'TERMINATED',
  );
  return (
    <Modal
      className={styles.annotate_modal}
      title="Annotate"
      visible={visible}
      width={490}
      onOk={handleOk}
      centered={true}
      // confirmLoading={confirmLoading}
      okText={step === 1 ? 'Confirm' : 'OK'}
      {...(step === 3 ? { footer: null } : {})}
      // onCancel={handleCancel}
      closeIcon={<></>}
      cancelButtonProps={{ style: { display: 'none' } }}
    >
      {step === 1 ? (
        <>
          <p
            style={{
              color: '#595959',
              fontWeight: 600,
              margin: '0px',
              whiteSpace: 'nowrap',
            }}
          >
            <span>Select Template</span>
            <span
              style={{
                color: '#FF6D72',
                fontWeight: 370,
                fontStyle: 'italic',
                marginLeft: '4px',
              }}
            >
              *All files within the folder will have attributes attached
            </span>
          </p>
          <div>
            {
              /* avoid value cache 
               re-render select component when visible change */
              visible && (
                <Select
                  className={styles.annotate_select}
                  initialValue={null}
                  onChange={(value) => {
                    if (!value) {
                      setSelManifest(null);
                      return;
                    }
                    const selM = manifestList.find(
                      (man) => man.id === Number(value),
                    );
                    setSelManifest(selM);
                  }}
                >
                  {manifestList.map((man) => (
                    <Option key={man.id}>{man.name}</Option>
                  ))}
                </Select>
              )
            }
          </div>
          <div
            style={
              selManifest?.attributes?.length > 2
                ? {
                    maxHeight: 125,
                    overflowY: 'auto',
                    marginRight: -15,
                    paddingRight: 5,
                    marginTop: 10,
                  }
                : {
                    maxHeight: 125,
                    overflowY: 'auto',
                    marginTop: 10,
                  }
            }
          >
            {selManifest?.attributes?.map((attr, ind) => {
              if (attr.type === 'multiple_choice') {
                return (
                  <>
                    <p
                      style={{
                        color: '#595959',
                        fontWeight: 600,
                        margin: ind === 0 ? 0 : '10px 0px 0px 0px',
                      }}
                    >
                      {!attr.optional && (
                        <span style={{ color: 'rgb(255, 109, 114)' }}>* </span>
                      )}
                      {attr.name}
                    </p>
                    <div>
                      <Select
                        className={styles.annotate_select}
                        onChange={(e) => {
                          const newVal = {
                            ...attrForm,
                          };
                          newVal[attr.name] = e ? e : '';
                          setAttrForm(newVal);
                        }}
                      >
                        {attr.value.split(',').map((man) => (
                          <Option key={man}>{man}</Option>
                        ))}
                        {attr.optional && (
                          <Option value="">
                            <em>null</em>
                          </Option>
                        )}
                      </Select>
                    </div>
                  </>
                );
              } else if (attr.type === 'text') {
                return (
                  <>
                    <p
                      style={{
                        color: '#595959',
                        fontWeight: 600,
                        margin: ind === 0 ? 0 : '10px 0px 0px 0px',
                      }}
                    >
                      {!attr.optional && (
                        <span style={{ color: 'rgb(255, 109, 114)' }}>* </span>
                      )}
                      {attr.name}
                    </p>
                    <Input
                      onChange={(e) => {
                        const newVal = {
                          ...attrForm,
                        };
                        newVal[attr.name] = e.target.value;
                        setAttrForm(newVal);
                      }}
                    ></Input>
                  </>
                );
              }
            })}
          </div>
          <p style={{ marginTop: '20px', marginBottom: 0 }}>
            Files and/or Folders selected
          </p>
          <div
            style={{
              maxHeight: '115px',
              overflowY: 'auto',
              overflowX: 'hidden',
              marginRight: -15,
            }}
          >
            {files.map((el) => {
              if (el.nodeLabel.includes('File')) {
                return (
                  <div style={{ display: 'flex', alignItems: 'baseline' }}>
                    <FileImageOutlined style={{ marginLeft: '4px' }} />
                    <p
                      style={{
                        margin: '0px 0px 0px 10px',
                        fontSize: '14px',
                        lineHeight: '23px',
                        fontWeight: 500,
                      }}
                    >
                      {el.fileName.length > 45 ? (
                        <Tooltip title={el.fileName}>
                          {el.fileName.slice(0, 45) + '...'}
                        </Tooltip>
                      ) : (
                        el.fileName
                      )}
                    </p>
                  </div>
                );
              } else if (el.nodeLabel.includes('Folder')) {
                return (
                  <div style={{ display: 'flex', alignItems: 'baseline' }}>
                    <FolderOutlined style={{ marginLeft: '4px' }} />
                    <p
                      style={{
                        margin: '0px 0px 0px 10px',
                        fontSize: '14px',
                        lineHeight: '23px',
                        fontWeight: 500,
                      }}
                    >
                      {el.fileName}
                    </p>
                  </div>
                );
              }
            })}
          </div>
        </>
      ) : null}
      {step === 2 && batchRes ? (
        <>
          <p>
            {failAttahcedList && failAttahcedList.length ? (
              <>
                <WarningFilled style={{ color: '#ff4d4f', marginRight: 10 }} />
                <span style={{ marginRight: 15 }}>
                  {failAttahcedList.length} files has been skipped because it
                  has attached attributes already
                </span>
              </>
            ) : (
              <span style={{ marginRight: 15 }}>
                {batchRes.length} files has been successfully attached
              </span>
            )}
          </p>
        </>
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

export default ManifestManagementModal;
