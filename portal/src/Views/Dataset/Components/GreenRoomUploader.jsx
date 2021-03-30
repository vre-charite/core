import React, { useState, useContext, useEffect, useRef } from 'react';
import {
  Modal,
  Button,
  Form,
  Input,
  Select,
  Upload,
  Spin,
  message,
  Dropdown,
  Menu,
} from 'antd';
import {
  FolderOutlined,
  DownloadOutlined,
  FileImageOutlined,
  DownOutlined,
  CloudUploadOutlined,
} from '@ant-design/icons';
import { uploadStarter, useCurrentProject } from '../../../Utility';
import { withRouter } from 'react-router-dom';
import { connect, useSelector } from 'react-redux';
import {
  appendUploadListCreator,
  updateUploadItemCreator,
  setNewUploadIndicator,
} from '../../../Redux/actions';
import _ from 'lodash';
import { UploadQueueContext } from '../../../Context';
import { listProjectTagsAPI, getProjectManifestList } from '../../../APIs';
import { validateTag } from '../../../Utility';
import { useTranslation } from 'react-i18next';
import UploaderManifest from './UploaderManifest';
import { validateForm } from '../../../Components/Form/Manifest/FormValidate';
import styles from './index.module.scss';
import { UploadFolder } from '../../../Components/Input';
const { Option } = Select;

const GreenRoomUploader = ({
  isShown: visible,
  cancel,
  datasetId,
  fetch: fetchTree,
}) => {
  const [form] = Form.useForm();
  const [isLoading, setIsloading] = useState(false);
  const [data, setData] = useState([]);
  const [value, setValue] = useState([]);
  const [fetching, setFetching] = useState(false);
  const { t } = useTranslation(['tooltips', 'formErrorMessages']);
  const q = useContext(UploadQueueContext);
  const [currentDataset = {}] = useCurrentProject();
  const { username } = useSelector((state) => state);
  const project = useSelector((state) => state.project);
  const [manifestList, setManifestList] = useState([]);
  const [attrForm, setAttrForm] = useState({});
  const [selManifest, setSelManifest] = useState(null);
  const folderRef = useRef(null);
  const fileRef = useRef(null);
  const [isFiles, setIsFiles] = useState(false);
  const isGenerate = currentDataset?.code === 'generate';
  useEffect(() => {
    async function loadManifest() {
      const manifests = await getProjectManifestList(currentDataset.code);
      const rawManifests = manifests.data.result;
      setManifestList(rawManifests);
    }
    if (visible && currentDataset.code) {
      loadManifest();
    }
  }, [currentDataset.code, visible]);
  const containersPermission = useSelector(
    (state) => state.containersPermission,
  );

  const handleOk = () => {
    if (selManifest&&isFiles) {
      const { valid, err } = validateForm(attrForm, selManifest);
      if (!valid) {
        message.error(err);
        return;
      }
    }

    form
      .validateFields()
      .then((values) => {
        setIsloading(true);
        let jobType = values.file ? 'AS_FILE' : 'AS_FOLDER';
        const fileList = values.file
          ? values.file.fileList
          : values.folder.fileList;
        const data = Object.assign({}, values, {
          /*           name: values.file.file.name,
          file_type: values.file.file.type, */
          uploader: username,
          projectName: currentDataset.name,
          projectCode: currentDataset.code,
          fileList,
          jobType,
          manifest: selManifest
            ? {
                id: selManifest.id,
                attributes: attrForm,
              }
            : null,
        });
        uploadStarter(data, q);
        setSelManifest(null);
        form.resetFields();
        setIsFiles(false);
        cancel();
        setIsloading(false);
      })
      .catch((err) => {
        console.log(err);
        setIsloading(false);
      });
  };

  const props = {
    beforeUpload() {
      return false;
    },
  };

  const menu = (
    <Menu>
      <Menu.Item className={styles.uploadDropDown} key="1">
        <Button
          onClick={() => {
            fileRef.current.click();
          }}
        >
          <FileImageOutlined />
          Select Files
        </Button>
      </Menu.Item>
      <Menu.Item className={styles.uploadDropDown} key="2">
        <Button
          onClick={() => {
            folderRef.current.click();
          }}
          id="form_in_modal_select_file"
          disabled={isGenerate}
        >
          <FolderOutlined />
          Select Folder
        </Button>
      </Menu.Item>
    </Menu>
  );

  return (
    <div>
      <Modal
        visible={visible}
        title="Upload Files"
        onOk={handleOk}
        maskClosable={false}
        closable={false}
        onCancel={() => {
          cancel();
          setSelManifest(null);
          form.resetFields();
        }}
        className={styles.uploadModal}
        footer={[
          <Button
            className={styles.cancelButton}
            key="back"
            onClick={() => {
              cancel();
              setSelManifest(null);
              form.resetFields();
            }}
            type="link"
          >
            Cancel
          </Button>,
          <Button
            className={styles.uploadButton}
            id="file_upload_submit_btn"
            key="submit"
            type="primary"
            loading={isLoading}
            onClick={handleOk}
            icon={<CloudUploadOutlined />}
          >
            Upload
          </Button>,
        ]}
      >
        <Form
          form={form}
          layout="vertical"
          name="form_in_modal"
          initialValues={{
            modifier: 'public',
          }}
          className={styles.uploadFormItem}
        >
          <Form.Item
            name="dataset"
            label="Project"
            initialValue={datasetId && parseInt(datasetId)}
            rules={[
              {
                required: true,
                message: 'Please select a project',
              },
            ]}
          >
            <Select
              disabled
              onChange={(value) => {
                console.log(value);
              }}
              //disabled={datasetId !== undefined}
              style={{ width: '100%' }}
              className={styles.inputBorder}
            >
              {containersPermission &&
                containersPermission.map((item) => (
                  <Option key={item.id} value={parseInt(item.id)}>
                    {item.name}
                  </Option>
                ))}
            </Select>
          </Form.Item>
          {currentDataset && currentDataset.code === 'generate' ? (
            <>
              <Form.Item label="Generate ID" required>
                <Form.Item
                  name="gid"
                  style={{ marginBottom: '0px' }}
                  rules={[
                    {
                      required: true,
                      message: t('formErrorMessages:project.generate.id.empty'),
                    },
                    {
                      pattern: new RegExp(/^([A-Z]{3})-([0-9]{4})$/g), // Format BXT-1234
                      message: t('formErrorMessages:project.generate.id.valid'),
                    },
                  ]}
                  hasFeedback
                >
                  <Input
                    className={styles.inputBorder}
                    onCopy={(e) => {
                      e.preventDefault();
                    }}
                    onPaste={(e) => {
                      e.preventDefault();
                    }}
                    onCut={(e) => {
                      e.preventDefault();
                    }}
                  />
                </Form.Item>
                <small>{t('upload.generate_id')}</small>
              </Form.Item>

              <Form.Item
                name="gid_repeat"
                label="Confirm Generate ID"
                dependencies={['gid']}
                hasFeedback
                rules={[
                  {
                    required: true,
                    message: t(
                      'formErrorMessages:project.generate.confirmId.empty',
                    ),
                  },
                  ({ getFieldValue }) => ({
                    validator(rule, value) {
                      if (!value || getFieldValue('gid') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(
                        t('formErrorMessages:project.generate.confirmId.valid'),
                      );
                    },
                  }),
                ]}
              >
                <Input
                  className={styles.inputBorder}
                  onCopy={(e) => {
                    e.preventDefault();
                  }}
                  onPaste={(e) => {
                    e.preventDefault();
                  }}
                  onCut={(e) => {
                    e.preventDefault();
                  }}
                />
              </Form.Item>
            </>
          ) : null}

          <Form.Item label="Upload Files">
            <Dropdown overlay={menu}>
              <Button className={styles.uploadSelector}>
                <DownloadOutlined /> Select <DownOutlined />
              </Button>
            </Dropdown>
            <Form.Item
              noStyle
              rules={[
                ({ getFieldValue }) => ({
                  validator(rule, value) {
                    const fileList = value && value.fileList;
                    if (!fileList) {
                      return Promise.resolve();
                    }
                    if (!fileList.length) {
                      return Promise.resolve();
                    }
                    if (
                      fileList.length ===
                      _.uniqBy(fileList, (item) => item.name).length
                    ) {
                      return Promise.resolve();
                    } else {
                      return Promise.reject(
                        t('formErrorMessages:project.upload.file.valid'),
                      );
                    }
                  },
                }),
              ]}
              name="file"
            >
              <Upload
                onChange={(value) => {
                  form.resetFields(['folder']);
                  console.log(
                    value?.fileList?.length,
                    'value?.fileList?.length',
                  );
                  setIsFiles(Boolean(value?.fileList?.length));
                }}
                multiple
                {...props}
              >
                <Button ref={fileRef}></Button>
              </Upload>
            </Form.Item>

            <Form.Item
              noStyle
              name="folder"
              rules={[
                ({ getFieldValue }) => ({
                  validator(rule, value) {
                    const fileFormItem = getFieldValue('file');
                    const fileList = value && value.fileList;
                    if (!(fileFormItem?.fileList?.length || fileList?.length)) {
                      return Promise.reject(
                        t('formErrorMessages:project.upload.file.empty'),
                      );
                    } else {
                      return Promise.resolve();
                    }
                  },
                }),
              ]}
            >
              <UploadFolder
                onChange={(value) => {
                  form.resetFields(['file']);
                  if (value) {
                    setIsFiles(false);
                  }
                }}
                multiple
                {...props}
                directory
              >
                <Button style={{ display: 'none' }} ref={folderRef}></Button>
              </UploadFolder>
            </Form.Item>
          </Form.Item>
          {isFiles && (
            <Form.Item
              name="tags"
              label="File Tags"
              rules={[
                ({ getFieldValue }) => ({
                  validator(rule, value) {
                    if (!value) {
                      return Promise.resolve();
                    }
                    if (value.length > 10) {
                      return Promise.reject(
                        t('formErrorMessages:project.upload.tags.limit'),
                      );
                    }
                    const systemTags = project.manifest.tags;
                    let i;
                    for (i of value) {
                      if (systemTags.indexOf(i) !== -1) {
                        return Promise.reject(
                          t('formErrorMessages:project.upload.tags.systemtags'),
                        );
                      }
                      if (!validateTag(i)) {
                        return Promise.reject(
                          t('formErrorMessages:project.upload.tags.valid'),
                        );
                      }
                    }
                    value = value.map((i) => i.toLowerCase());

                    value = [...new Set(value)];

                    setValue(value);
                    setData([]);
                    setFetching(false);
                    form.setFieldsValue({ tags: value });

                    return Promise.resolve();
                  },
                }),
              ]}
            >
              <Select
                className={styles.inputBorder}
                mode="tags"
                // tagRender={tagRender}
                value={value}
                notFoundContent={fetching ? <Spin size="small" /> : null}
                // onSearch={fetchTags}
                // onChange={handleChange}
                getPopupContainer={(triggerNode) => triggerNode.parentNode}
                style={{ width: '100%' }}
                rendervalue={(selected) =>
                  selected.map((el) => el.toLowerCase())
                }
                placeholder="Add tags"
              >
                {data.map((d) => (
                  <Option key={d.value}>{d.text.toLowerCase()}</Option>
                ))}
              </Select>
            </Form.Item>
          )}
        </Form>
        {isFiles && manifestList && manifestList.length ? (
          <UploaderManifest
            selManifest={selManifest}
            setSelManifest={setSelManifest}
            attrForm={attrForm}
            setAttrForm={setAttrForm}
            manifestList={manifestList}
          />
        ) : null}
      </Modal>
    </div>
  );
};

export default withRouter(
  connect(
    (state) => {
      const { tags, containersPermission, uploadList } = state;
      return { tags, containersPermission, uploadList };
    },
    { appendUploadListCreator, updateUploadItemCreator, setNewUploadIndicator },
  )(GreenRoomUploader),
);
