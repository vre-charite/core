import React, { useState } from 'react';
import { CloudUploadOutlined } from '@ant-design/icons';
import { Modal, Button, Upload, message } from 'antd';
import styles from './uploadSchemaModal.module.scss';
import {
  createSchemaData,
  getDatasetSchemaListAPI,
} from '../../../../../../APIs';
import { useSelector, useDispatch } from 'react-redux';
import { schemaTemplatesActions } from '../../../../../../Redux/actions';
import _ from 'lodash';
import map from 'async/map';
import asyncify from 'async/asyncify';
import UploadErrorModal from '../UploadErrorModal/UploadErrorModal';
import { useTranslation } from 'react-i18next';
const MAX_UPLOAD = 20;

const UploadSchemaModal = (props) => {
  const { visibility, setModalVisibility } = props;
  const [fileList, setFileList] = useState([]);
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation(['errormessages', 'success']);
  const { geid } = useSelector((state) => state.datasetInfo.basicInfo);
  const { schemaTPLs } = useSelector((state) => state.schemaTemplatesInfo);
  const { username } = useSelector((state) => state);
  const [errorFileList, setErrorFileList] = useState([]);
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const dispatch = useDispatch();
  const openMindsTemplate = _.find(schemaTPLs, (item) => {
    return item.standard === 'open_minds';
  });

  const debouncedWarn = _.debounce(
    () => {
      message.error(
        `${t('errormessages:uploadOpenMindsSchema.fileNumOverLimit.0')}`,
      );
    },
    1000,
    {
      leading: true,
      trailing: false,
    },
  );
  const uploadOnChange = ({ file, fileList }) => {
    const unique = [
      ...new Map(fileList.map((item) => [item['name'], item])).values(),
    ];
    if (unique.length > MAX_UPLOAD) {
      debouncedWarn();
      return;
    }
    setFileList(unique.slice(-MAX_UPLOAD));
  };

  const closeModal = () => {
    setFileList([]);
    setModalVisibility(false);
  };

  const onSubmit = async () => {
    if (!openMindsTemplate) {
      message.error(
        `${t('errormessages:uploadOpenMindsSchema.noOpenMindsTemplate.0')}`,
      );
      return;
    }
    for (let i = 0; i < fileList.length; i++) {
      const fileItem = fileList[i];
      if (fileItem.size > 1 * 1024 * 1024) {
        message.error(
          `${t('errormessages:uploadOpenMindsSchema.fileSizeOverLimit.0')}`,
        );
        const fileListCopy = _.cloneDeep(fileList);
        fileListCopy[i].status = 'error';
        setFileList(fileListCopy);
        return;
      }
    }
    setLoading(true);

    const errorList = [];
    try {
      const errors = await map(fileList, asyncify(uploadFile));
      errors.forEach((error, index) => {
        if (error instanceof Error) {
          errorList.push(fileList[index]);
        }
      });
      if (errorList.length > 0) {
        // show the alert modal
        setErrorFileList(errorList);
        setErrorModalVisible(true);
      } else {
        message.success(t('success:uploadOpenMindsSchema.default.0'));
      }
      closeModal();
      const res = await getDatasetSchemaListAPI(geid);
      dispatch(schemaTemplatesActions.updateDefaultSchemaList(res.data.result));
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  /**
   * upload a file
   * @param {*} file antd file obj
   * @returns null for succeed, otherwise return error
   */
  const uploadFile = async (file) => {
    try {
      const { name, originFileObj } = file;
      const fileText = await readFile(originFileObj);
      const json = JSON.parse(fileText);
      await createSchemaData(
        geid,
        false,
        'open_minds',
        name,
        json,
        openMindsTemplate.geid,
        username,
        false,
      );
      return null;
    } catch (error) {
      return error;
    }
  };

  /**
   * read json file and parse, return the string
   * @param {File} fileObj
   * @returns
   */
  const readFile = (fileObj) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = function (evt) {
        resolve(evt.target.result);
      };
      reader.onerror = (error) => reject(error);
      reader.readAsText(fileObj);
    });
  };

  const uploadErrorModalProps = {
    errorModalVisible,
    setErrorFileList,
    setErrorModalVisible,
    errorFileList,
  };

  return (
    <>
      {' '}
      <Modal
        className={styles.upload_schema_modal}
        title={
          <p style={{ color: '#003262', margin: '0px' }}>
            Upload openMINDS Schemas
          </p>
        }
        width={600}
        visible={visibility}
        maskClosable={false}
        centered={true}
        closable={false}
        footer={[
          <div>
            <Button
              disabled={loading}
              className={styles.footer_cancel_btn}
              onClick={closeModal}
            >
              Cancel
            </Button>
            <Button
              className={styles.footer_upload_btn}
              type="primary"
              icon={<CloudUploadOutlined />}
              loading={loading}
              disabled={fileList.length===0}
              onClick={onSubmit}
            >
              Upload
            </Button>
          </div>,
        ]}
        onCancel={closeModal}
      >
        <div className={styles['top']}>
          <div>
            <Upload
              fileList={fileList}
              multiple
              accept=".json"
              maxCount={MAX_UPLOAD}
              beforeUpload={() => false}
              onChange={uploadOnChange}
              disabled={loading}
            >
              <Button
                className={styles['button']}
                type="primary"
                icon={<CloudUploadOutlined />}
              >
                Select Schema
              </Button>
            </Upload>
          </div>

          <div>
            <span className={styles['description']}>
              Selected schemas will be uploaded
            </span>
            <br />
            <span className={styles['annotation']}>
              *During upload process, you will not be able to close this window
            </span>
          </div>
        </div>
      </Modal>
      <UploadErrorModal {...uploadErrorModalProps} />
    </>
  );
};

export default UploadSchemaModal;
