import React, { useState, useEffect, useCallback } from 'react';
import {
  UploadOutlined,
  PlusOutlined,
  DownloadOutlined,
} from '@ant-design/icons';
import { Button, Input, Modal, message, Upload, Form } from 'antd';
import FileManifestItem from './FileManifestCompo/ManifestEdit/FileManifestItem';

import { getProjectManifestList, importManifestAPI } from '../../../../../APIs';
import CreateManifest from './FileManifestCompo/ManifestCreation/CreateManifest';
import { useCurrentProject } from '../../../../../Utility';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
function FileManifest() {
  const { t } = useTranslation(['errormessages', 'success']);
  const [isCreateManifest, setIsCreateManifest] = useState(false);
  const [importModalVisible, setImportModalVisible] = useState(false);
  const [manifestList, setManifestList] = useState([]);
  const [btnLoading, setBtnLoading] = useState(false);
  const [currentDataset = {}] = useCurrentProject();
  const [form] = Form.useForm();
  const loadManifest = useCallback(async () => {
    const manifests = await getProjectManifestList(currentDataset.code);
    const rawManifests = manifests.data.result;
    setManifestList(rawManifests);
  }, [currentDataset.code]);

  useEffect(() => {
    loadManifest();
  }, [loadManifest]);
  const importModal = (
    <Modal
      title="Import Attribute Template"
      visible={importModalVisible}
      onOk={() => {
        if (btnLoading) {
          return;
        }
        setBtnLoading(true);
        form
          .validateFields()
          .then((res) => {
            const name = res.manifestName;
            const file = res.file.file;
            let reader = new FileReader();
            reader.readAsText(file);
            reader.onload = function () {
              let json;
              try {
                json = JSON.parse(reader.result);
              } catch (err) {
                setBtnLoading(false);
                message.error(
                  t('errormessages:importExportManifest.parseJsonFailed.0'),
                );
                return;
              }
              const { result, message: errorMessage } = validateJson(json, t);
              if (!result) {
                setBtnLoading(false);
                message.error(errorMessage);
                return;
              }
              importManifestAPI({
                name,
                project_code: currentDataset?.code,
                attributes: json.attributes,
              })
                .then((res) => {
                  setImportModalVisible(false);
                  form.resetFields();
                  message.success(t('success:importManifestAPI.default.0'));
                  loadManifest();
                  setBtnLoading(false);
                })
                .catch((err) => {
                  message.error(t('errormessages:importManifestAPI.default.0'));
                  setBtnLoading(false);
                });
            };

            reader.onerror = function () {
              message.error(
                t('errormessages:importExportManifest.fileTypeError.0'),
              );
              setBtnLoading(false);
            };
          })
          .catch((err) => {
            console.log(err);
            setBtnLoading(false);
          });
      }}
      onCancel={() => {
        setImportModalVisible(false);
        form.resetFields();
      }}
    >
      <Form form={form}>
        <Form.Item
          name="manifestName"
          rules={[
            { required: true, message: 'Attribute template name is required' },
            {
              pattern: /^[^\\/:?*<>|"']+$/,
              message: `Attribute template name should not includes  \\ / : ? * < > | " ' `,
            },
            {
              validator(rule, value) {
                if (!value) {
                  return Promise.resolve();
                }
                const isValid =
                  typeof value === 'string' &&
                  value.length >= 1 &&
                  value.length <= 32;
                if (isValid) {
                  return Promise.resolve();
                } else {
                  return Promise.reject(
                    'Attribute template name length should between 1-32 characters',
                  );
                }
              },
            },
          ]}
          label="Attribute Template Name"
        >
          <Input style={{ width: 150, borderRadius: 6 }} />
        </Form.Item>
        <Form.Item
          name="file"
          required
          rules={[
            {
              validator(rule, value) {
                const fileList = value && value.fileList;
                if (!fileList || (fileList && fileList.length === 0)) {
                  return Promise.reject('Please select the json file');
                } else if (
                  fileList[0].type !== 'application/json' &&
                  fileList[0].type !== 'application/JSON'
                ) {
                  return Promise.reject('This is not a json media type');
                } else {
                  return Promise.resolve();
                }
              },
            },
          ]}
          label="JSON File"
        >
          <Upload
            beforeUpload={() => {
              return false;
            }}
            accept=".json"
            multiple={false}
          >
            <Button icon={<UploadOutlined />}>Upload</Button>
          </Upload>
        </Form.Item>
      </Form>
    </Modal>
  );

  return (
    <>
      {manifestList.length
        ? manifestList.map((mItem) => {
            return (
              <FileManifestItem
                key={mItem.id}
                manifestID={mItem.id}
                manifestList={manifestList}
                loadManifest={loadManifest}
              />
            );
          })
        : null}
      <div style={{ padding: '20px 13px' }}>
        {!isCreateManifest ? (
          <div style={{ textAlign: 'center' }}>
            <Button
              type="link"
              onClick={(e) => {
                if (manifestList.length >= 10) {
                  message.error(
                    t(
                      'errormessages:importExportManifest.manifestNumberOver.0',
                    ),
                  );
                  return;
                }
                setIsCreateManifest(true);
              }}
              icon={<PlusOutlined />}
            >
              Create New Attribute Template
            </Button>
            <Button
              type="link"
              style={{ marginLeft: 20 }}
              onClick={(e) => setImportModalVisible(true)}
              icon={<DownloadOutlined />}
            >
              Import Attribute Template
            </Button>
          </div>
        ) : null}
        {isCreateManifest ? (
          <CreateManifest
            loadManifest={loadManifest}
            manifestList={manifestList}
            setIsCreateManifest={setIsCreateManifest}
          />
        ) : null}
      </div>
      {importModal}
    </>
  );
}

const validateJson = (json, t) => {
  if (!_.has(json, ['attributes'])) {
    return {
      result: false,
      message: t('errormessages:importExportManifest.attributesMissing.0'),
    };
  }
  if (!_.isArray(json.attributes)) {
    return {
      result: false,
      message: t('errormessages:importExportManifest.attributesNotArray.0'),
    };
  }

  for (let i = 0; i < json.attributes.length; i++) {
    let res;
    const item = json.attributes[i];
    //check if property exist
    ['name', 'optional', 'value', 'type'].forEach((key) => {
      if (!item.hasOwnProperty(key)) {
        res = {
          result: false,
          message: `${key} ${t(
            'errormessages:importExportManifest.propertyMissing.0',
          )} ${i}${t('errormessages:importExportManifest.propertyMissing.0')}`,
        };
      }
    });
    if (res && res.result === false) {
      return res;
    }
    if (typeof item['name'] !== 'string') {
      return {
        result: false,
        message: `${t(
          'errormessages:importExportManifest.nameNotString.0',
        )} ${i}${t('errormessages:importExportManifest.nameNotString.1')}`,
      };
    }
    if (item['name'].length < 1 || item['name'].length > 32) {
      return {
        result: false,
        message: `${t(
          'errormessages:importExportManifest.nameLength.0',
        )} ${i}${t('errormessages:importExportManifest.nameLength.1')}`,
      };
    }
    if (!item['name'].match(/^[A-Za-z0-9]+$/)) {
      return {
        result: false,
        message: `${t(
          'errormessages:importExportManifest.nameFormat.0',
        )} ${i}${t('errormessages:importExportManifest.nameFormat.1')}`,
      };
    }
    if (typeof item['optional'] !== 'boolean') {
      return {
        result: false,
        message: `${t(
          'errormessages:importExportManifest.optionalNotBoolean.0',
        )} ${i}${t('errormessages:importExportManifest.optionalNotBoolean.1')}`,
      };
    }
    if (item['type'] !== 'multiple_choice' && item['type'] !== 'text') {
      return {
        result: false,
        message: `${t(
          'errormessages:importExportManifest.typeFormat.0',
        )} ${i}${t('errormessages:importExportManifest.typeFormat.1')}`,
      };
    }
    if (item['type'] === 'text' && item['value'] !== null) {
      return {
        result: false,
        message: `${t(
          'errormessages:importExportManifest.valueNullText.0',
        )} ${i}${t('errormessages:importExportManifest.valueNullText.1')}`,
      };
    }
    if (item['type'] === 'multiple_choice') {
      const value = item['value'];
      if (typeof value !== 'string') {
        return {
          result: false,
          message: `${t(
            'errormessages:importExportManifest.valueString.0',
          )} ${i}${t('errormessages:importExportManifest.valueString.1')}`,
        };
      }
      const valueArr = value.split(',');
      for (let j = 0; j < valueArr.length; j++) {
        if (valueArr[j].length < 1 || valueArr[j].length > 32) {
          return {
            result: false,
            message: `${t(
              'errormessages:importExportManifest.choiceLength.0',
            )} ${i}${t('errormessages:importExportManifest.choiceLength.1')}`,
          };
        }
        if (!valueArr[j].match(/^[A-Za-z0-9-_!%&/()=?*+#.;]+$/)) {
          return {
            result: false,
            message: `${t(
              'errormessages:importExportManifest.choiceFormat.0',
            )} ${i}${t('errormessages:importExportManifest.choiceFormat.1')}`,
          };
        }
      }
    }
  }

  const names = json.attributes.map((item) => item.name);
  if (new Set(names).size !== names.length) {
    return {
      result: false,
      message: `${t('errormessages:importExportManifest.uniqueName.0')}`,
    };
  }
  return { result: true, message: '' };
};

export default FileManifest;
