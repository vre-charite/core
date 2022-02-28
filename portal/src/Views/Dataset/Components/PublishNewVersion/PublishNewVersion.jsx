import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Modal,
  Button,
  Radio,
  Input,
  Table,
  message,
  Form,
  Spin,
  Space,
} from 'antd';
import { RocketOutlined } from '@ant-design/icons';
import {
  publishNewVersionAPI,
  checkPublishStatusAPI,
  datasetVersionLogs,
} from '../../../../APIs/index';
import { datasetInfoCreators } from '../../../../Redux/actions';
import i18n from '../../../../i18n';
import logsInfo from '../../DatasetActivity/DatasetActivityLogsDisplay';
import styles from './PublishNewVersion.module.scss';

const { TextArea } = Input;

const PublishNewVersion = (props) => {
  const { newVersionModalVisibility, setNewVersionModalVisibility } = props;
  const [radioValue, setRadioValue] = useState('');
  const [versionValue, setVersionValue] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [validateRadio, setValidateRadio] = useState(true);
  const [validateInput, setValidateInput] = useState(true);
  const [btnLoading, setBtnLoading] = useState(false);
  const [activityLogs, setActivityLogs] = useState([]);
  const [pageSize, setPageSize] = useState(1000);
  const [totalItem, setTotalItem] = useState(0);
  const [activityLogsLoading, setActivityLogsLoading] = useState(false);

  const columns = [
    {
      title: '',
      key: 'action',
      width: '100%',
      render: (item) => {
        const { action, detail, resource } = item.source;
        return logsInfo(action, detail, resource);
      },
    },
  ];

  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const datasetInfo = useSelector((state) => state.datasetInfo.basicInfo);
  const datasetCurrentVersion  = useSelector(
    (state) => state.datasetInfo.currentVersion
  );
  const userName = useSelector((state) => state.username);

  const datasetGeid = datasetInfo.geid;

  const getMinorVersion = () => {
    if (datasetCurrentVersion) {
      const minorVersion = Number(datasetCurrentVersion) + 0.1;
      return minorVersion.toFixed(1).toString();
    } else {
      return '1.0';
    }
  };

  const getMajorVersion = () => {
    if (datasetCurrentVersion) {
      const majorVersion = parseInt(datasetCurrentVersion);
      const newMajorVersion = majorVersion + 1;
      return newMajorVersion.toFixed(1).toString();
    } else {
      return '1.0';
    }
  };

  const getDatasetVersionActivityLogs = async () => {
    try {
      setActivityLogsLoading(true);
      const params = {
        version: datasetCurrentVersion,
        page: 0,
        page_size: pageSize,
      };

      const res = await datasetVersionLogs(datasetGeid, params);
      setActivityLogs(res.data.result);
      setTotalItem(res.data.total);
      setActivityLogsLoading(false);
      setInputValue('');
    } catch(error) {
      setActivityLogsLoading(false);
      message.error(
        `${i18n.t('errormessages:datasetVersionLogs.default.0')}`
      );
    }
  };

  useEffect(() => {
    if (newVersionModalVisibility && datasetGeid && datasetCurrentVersion) {
      getDatasetVersionActivityLogs();
    }
  }, [
    datasetGeid,
    datasetCurrentVersion,
    datasetInfo,
    newVersionModalVisibility
  ]);

  const handleRadioOnChange = (e) => {
    setValidateRadio(true);
    setRadioValue(e.target.value);
    if (e.target.value === 'minorVersion') {
      setVersionValue(getMinorVersion());
    } else if (e.target.value === 'majorVersion') {
      setVersionValue(getMajorVersion());
    }
  };

  const handleInputOnChange = (e) => {
    setValidateInput(true);
    setInputValue(e.target.value);
  };

  const checkPublishVersionStatus = async (statusId) => {
    try {
      const res = await checkPublishStatusAPI(datasetGeid, statusId);
      if (res.data.result.status === 'inprogress') {
        checkPublishVersionStatus(statusId);
      } else if (res.data.result.status === 'failed') {
        setBtnLoading(false);
        message.error(
          `${i18n.t('errormessages:publishDatasetNewVersion.default.0')}`,
        );
        return;
      } else if (res.data.result.status === 'success') {
        dispatch(datasetInfoCreators.setDatasetVersion(versionValue));
        setBtnLoading(false);
        return;
      }
    } catch(error) {
      setBtnLoading(false);
      message.error(
        `${i18n.t('errormessages:publishDatasetNewVersion.default.0')}`
      );
    }
  };

  const publishVersion = async () => {
    if (!versionValue && !inputValue) {
      setValidateRadio(false);
      setValidateInput(false);
      return;
    } else if (!versionValue && inputValue) {
      setValidateRadio(false);
      return;
    } else if (!inputValue && versionValue) {
      setValidateInput(false);
      return;
    }

    try {
      setBtnLoading(true);
      const res = await publishNewVersionAPI(
        datasetGeid,
        userName,
        inputValue,
        versionValue,
      );
      checkPublishVersionStatus(res.data.result.statusId);
      closeModal();
      message.success(
        `${i18n.t('success:publishDatasetNewVersion.default.0')}`,
      );
    } catch (error) {
      setBtnLoading(false);
      console.log(error);
    }
  };

  const closeModal = () => {
    setNewVersionModalVisibility(false);
    setRadioValue('');
    setVersionValue('');
    setInputValue('');
    setValidateRadio(true);
    setValidateInput(true);
    setBtnLoading(false);
    setActivityLogsLoading(false);
    form.resetFields(['notes']);
  };

  return (
    <Modal
      className={styles.new_version_modal}
      title={
        <p style={{ color: '#003262', margin: '0px' }}>Releasing Dataset Version</p>
      }
      visible={newVersionModalVisibility}
      maskClosable={false}
      centered={true}
      onCancel={closeModal}
      footer={[
        <div>
          <Button style={{ border: '0px' }} onClick={closeModal}>
            Cancel
          </Button>
          <Button
            type="primary"
            style={{
              borderRadius: '6px',
              width: '120px',
              height: '25px',
              padding: '0px',
            }}
            icon={<RocketOutlined />}
            loading={btnLoading}
            onClick={publishVersion}
          >
            Submit
          </Button>
        </div>,
      ]}
    >
      <div className={styles.modal_content}>
        <div>
          <p style={{ marginBottom: '5px' }}>
            Please select if this is a minor or major release.
            <span style={{ color: '#FF6D72' }}>*</span>
            {!validateRadio && (
              <span style={{ color: '#FF6D72', fontStyle: 'italic' }}>
                Please select a version
              </span>
            )}
          </p>
        </div>
        <div>
          <Radio.Group onChange={handleRadioOnChange} value={radioValue}>
            <Radio value={'minorVersion'}>
              Minor Release:{' '}
              <span style={{ fontWeight: 'bold' }}>{getMinorVersion()}</span>
            </Radio>
            <Radio value={'majorVersion'}>
              Major Release:{' '}
              <span style={{ fontWeight: 'bold' }}>{getMajorVersion()}</span>
            </Radio>
          </Radio.Group>
        </div>
        <div>
          <p style={{ margin: '10px 0px 0px 0px' }}>
            Version Notes<span style={{ color: '#FF6D72' }}>*</span>
            {!validateInput && (
              <span style={{ color: '#FF6D72', fontStyle: 'italic' }}>
                Please input version notes
              </span>
            )}
          </p>
          <Form form={form}>
            <Form.Item name="notes">
              <TextArea
                maxLength={250}
                style={{ borderRadius: '6px', height: '61px' }}
                onChange={handleInputOnChange}
              />
            </Form.Item>
          </Form>
          <span style={{ float: 'right', marginTop: '-20px' }}>{`${
            inputValue ? inputValue.length : 0
          }/250`}</span>
        </div>
        <div style={{ marginTop: '20px' }}>
          {datasetCurrentVersion && (
            <>
              <p>Recent changes since {datasetCurrentVersion}</p>
              {activityLogs.length > 0 && (
                <Table
                  className={styles.modal_content_table}
                  columns={columns}
                  dataSource={activityLogs}
                  pagination={false}
                  size="small"
                />
              )}
            </>
          )}
          {activityLogsLoading && <Space style={{width: '100%', marginLeft: '50%'}}><Spin size="middle"></Spin></Space>}
        </div>
      </div>
    </Modal>
  );
};

export default PublishNewVersion;
