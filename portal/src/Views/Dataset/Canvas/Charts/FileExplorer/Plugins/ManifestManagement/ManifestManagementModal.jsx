import React, { useState, useEffect, useCallback } from 'react';
import { Modal, Select, message, Result } from 'antd';
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
} from '@ant-design/icons';
import i18n from '../../../../../../../i18n';
const { Option } = Select;
const ManifestManagementModal = ({
  visible,
  setVisible,
  files,
  eraseSelect,
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
      setStep(2);
      return;
    }
    if (step === 2) {
      const { valid, err } = validateForm(attrForm, selManifest);
      if (!valid) {
        message.error(err);
        return;
      }
      try {
        const res = await attachManifest(
          selManifest.id,
          files.map((v) => v.geid),
          attrForm,
        );
        setBatchRes(res.data.result);
        setStep(3);
        dispatch(setSuccessNum(successNum + 1));
      } catch (e) {
        message.error(`${i18n.t('errormessages:attachManifest.default.0')}`);
      }

      // closeModal();
    }
  };

  const handleCancel = () => {
    closeModal();
    eraseSelect();
  };

  return (
    <Modal
      title="Attach Attribute Template"
      visible={visible}
      width={400}
      onOk={handleOk}
      // confirmLoading={confirmLoading}
      okText={step === 1 ? 'Next' : 'OK'}
      {...(step === 3 ? { footer: null } : {})}
      // onCancel={handleCancel}
      closeIcon={<></>}
      cancelButtonProps={{ style: { display: 'none' } }}
    >
      {step === 1 ? (
        <>
          <p style={{ color: 'rgba(0,0,0,0.45)' }}>
            Please choose Attribute Template for {files.length} files.
          </p>
          <div>
            <Select
              style={{ width: 200 }}
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
          </div>
        </>
      ) : null}
      {step === 2 ? (
        <>
          <p
            style={{
              color: 'rgba(0,0,0,0.45)',
              textAlign: 'center',
              marginBottom: 20,
            }}
          >
            Please set the attributes value for selected template
          </p>
          {selManifest && (
            <div style={{ maxHeight: 195, overflowY: 'scroll' }}>
              <ManifestForm
                manifest={selManifest}
                attrForm={attrForm}
                setAttrForm={setAttrForm}
              />
            </div>
          )}
        </>
      ) : null}
      {step === 3 && batchRes ? (
        <>
          <Result
            style={{ paddingTop: 0, paddingBottom: 0 }}
            status={batchRes.error.length ? 'error' : 'success'}
            title=""
            subTitle={
              batchRes.error.length
                ? `${files.length} file${
                    files.length > 1 ? 's have' : ' has'
                  } been processed with ${batchRes.error.length} error${
                    batchRes.error.length > 1 ? 's' : ''
                  }`
                : `${files.length} file${
                    files.length > 1 ? 's have' : ' has'
                  } been processed`
            }
          />
          <div
            style={{
              border: '1px solid #dfdfdf',
              height: 150,
              marginTop: 30,
              overflowY: 'scroll',
              padding: '10px 20px',
            }}
          >
            <div>
              {batchRes.error && batchRes.error.length ? (
                <>
                  <WarningFilled
                    style={{ color: '#ff4d4f', marginRight: 10 }}
                  />
                  <span style={{ marginRight: 15 }}>
                    {batchRes.error.length} error
                  </span>
                </>
              ) : null}
              {batchRes.success && batchRes.success.length ? (
                <>
                  <CheckCircleFilled
                    style={{
                      color: '#51c512',
                      marginRight: 8,
                    }}
                  />
                  <span>{batchRes.success.length} success</span>
                </>
              ) : null}
            </div>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {batchRes.error && batchRes.error.length
                ? batchRes.error.map((errFile, ind) => {
                    const errFileArr = errFile.split('/');
                    return (
                      <li key={'err-' + ind} style={{ listStyle: 'none' }}>
                        <WarningFilled
                          style={{
                            color: '#ff4d4f',
                            marginRight: 10,
                          }}
                        />
                        Error occured while processing{' '}
                        {errFileArr[errFileArr.length - 1]}
                      </li>
                    );
                  })
                : null}
              {batchRes.success && batchRes.success.length
                ? batchRes.success.map((successFile, ind) => {
                    const successFileArr = successFile.split('/');
                    return (
                      <li key={'success-' + ind} style={{ listStyle: 'none' }}>
                        <CheckCircleFilled
                          style={{
                            color: '#51c512',
                            marginRight: 8,
                          }}
                        />
                        {successFileArr[successFileArr.length - 1]} has been
                        processed successfully
                      </li>
                    );
                  })
                : null}
            </ul>
          </div>
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
