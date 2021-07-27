import React, { useState, useEffect } from 'react';
import { Modal, Button, Select, Tooltip, Form, message } from 'antd';
import {
  ArrowRightOutlined,
  ExclamationCircleOutlined,
  FileOutlined,
  FolderOutlined,
} from '@ant-design/icons';
import { useSelector } from 'react-redux';
import styles from './index.module.scss';
import {
  addToDatasetsAPI,
  getDatasetsListingAPI,
} from '../../../../../../../APIs';
import i18n from '../../../../../../../i18n';

const { Option } = Select;

const DatasetsModal = (props) => {
  const { visible, setVisible, selectedRows } = props;
  const [BtnLoading, setBtnLoading] = useState(false);
  const [selectedValue, setSelectedValue] = useState('');
  const [validateSelect, setValidateSelect] = useState(true);
  const [dataSetsList, setDataSetsList] = useState([]);
  const [skippedFiles, setSkippedFiles] = useState([]);
  const [modalContentStep, setModalContentStep] = useState(1);
  const [form] = Form.useForm();
  const userName = useSelector((state) => state.username);
  const currentProject = useSelector((state) => state.project);

  const closeModal = () => {
    setVisible(false);
    setSelectedValue('');
    setValidateSelect(true);
    setBtnLoading(false);
    setModalContentStep(1);
    form.resetFields(['datasetsSelection']);
  };

  const getDatasetsListing = async () => {
    try {
      let payLoad = {
        filter: {},
        order_by: 'time_created',
        order_type: 'desc',
        page: 0,
        page_size: 1000,
      };
      const res = await getDatasetsListingAPI(userName, payLoad);
      setDataSetsList(res.data.result);
    } catch (error) {
      message.error(`${i18n.t('errormessages:listDatasets.default.0')}`, 3);
    }
  };

  useEffect(() => {
    getDatasetsListing();
  }, []);

  const addToDatasets = async () => {
    if (!selectedValue) {
      setValidateSelect(false);
      return;
    }
    try {
      let payLoad = {};
      payLoad['source_list'] =
        selectedRows.length && selectedRows.map((el) => el.id || el.geid);
      payLoad['operator'] = userName;
      payLoad['project_geid'] = currentProject.profile.globalEntityId;
      setBtnLoading(true);
      const res = await addToDatasetsAPI(selectedValue, payLoad);
      if (res.data.result.ignored.length) {
        setSkippedFiles(res.data.result.ignored);
        setBtnLoading(false);
        setModalContentStep(2);
      } else {
        message.success(`${i18n.t('success:addToDataset')}`);
        setBtnLoading(false);
        closeModal();
      }
    } catch (error) {
      if (error.message === 'Request failed with status code 403') {
        message.warning(`${i18n.t('errormessages:addToDataset.403.0')}`, 3);
        setBtnLoading(false);
      } else {
        message.error(`${i18n.t('errormessages:addToDataset.default.0')}`, 3);
        setBtnLoading(false);
      }
    }
  };

  const handleSelectChange = (value) => {
    setSelectedValue(value);
    setValidateSelect(true);
  };

  const modalFooters = (modalContentStep) => {
    switch (modalContentStep) {
      case 1:
        return (
          <Button
            type="primary"
            loading={BtnLoading}
            style={{ width: '161px', height: '30px', borderRadius: '6px' }}
            onClick={addToDatasets}
          >
            <ArrowRightOutlined /> Add to Dataset
          </Button>
        );
      case 2:
        return (
          <div>
            <Button
              type="primary"
              style={{ borderRadius: '6px' }}
              onClick={closeModal}
            >
              Ok
            </Button>
          </div>
        );
    }
  };

  return (
    <Modal
      className={styles.dataset_modal}
      title={<p style={{ margin: '0px', color: '#003262' }}>Add to Datasets</p>}
      visible={visible}
      centered={true}
      maskClosable={false}
      footer={[modalFooters(modalContentStep)]}
      onCancel={closeModal}
    >
      {modalContentStep === 1 && (
        <div>
          <p style={{ margin: '0px 0px 5px 0px', fontWeight: 'bold' }}>
            Select Dataset{' '}
            {!validateSelect ? (
              <span
                style={{
                  marginLeft: '10px',
                  color: '#FF6D72',
                  fontStyle: 'italic',
                }}
              >
                *Please select a dataset
              </span>
            ) : null}
          </p>
          <Form form={form}>
            <Form.Item name="datasetsSelection">
              <Select
                className={styles.dateset_select}
                placeholder="Select Dataset"
                onChange={handleSelectChange}
              >
                {dataSetsList.length &&
                  dataSetsList.map((el) => (
                    <Option value={el.globalEntityId}>
                      {el.name.length > 40 ? (
                        <Tooltip title={el.name}>{`${el.name.slice(
                          0,
                          40,
                        )}...`}</Tooltip>
                      ) : (
                        el.name
                      )}
                    </Option>
                  ))}
              </Select>
            </Form.Item>
          </Form>
        </div>
      )}
      {modalContentStep === 2 && (
        <div style={{ display: 'flex' }}>
          <div style={{ width: '22px', margin: '0px 5px' }}>
            <ExclamationCircleOutlined style={{ color: '#FFC118' }} />
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ marginBottom: '5px' }}>
              The following file/folder already exist, will be skipped:
            </p>
            <ul
              style={{
                maxHeight: 70,
                overflowY: 'auto',
                paddingLeft: '10px',
                margin: '0px',
              }}
            >
              {skippedFiles &&
                skippedFiles.map((el, index) => (
                  <li
                    key={index}
                    style={{
                      fontWeight: 600,
                      maxWidth: '320px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {el.labels.includes('File') ? (
                      <FileOutlined style={{ marginRight: '5px' }} />
                    ) : el.labels.includes('Folder') ? (
                      <FolderOutlined style={{ marginRight: '5px' }} />
                    ) : null}
                    {el.name.length > 40 ? <Tooltip title={el.name}>{`${el.name.slice(0, 40)}...`}</Tooltip> : el.name}
                  </li>
                ))}
            </ul>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default DatasetsModal;
