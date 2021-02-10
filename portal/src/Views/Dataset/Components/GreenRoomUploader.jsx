import React, { useState, useContext, useEffect } from 'react';
import {
  Modal,
  Button,
  Form,
  Input,
  Select,
  Upload,
  Spin,
  message,
} from 'antd';
import { UploadOutlined } from '@ant-design/icons';
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
    if (selManifest) {
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
        const data = Object.assign({}, values, {
          name: values.file.file.name,
          file_type: values.file.file.type,
          uploader: username,
          projectName: currentDataset.name,
          projectCode: currentDataset.code,
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
        cancel();
        setIsloading(false);
      })
      .catch((info) => {
        setIsloading(false);
      });
  };

  const props = {
    beforeUpload() {
      return false;
    },
  };

  // let lastFetchId = 0;
  // const fetchTags = (value) => {
  //   value = value.toLowerCase();
  //   lastFetchId += 1;
  //   const fetchId = lastFetchId;
  //   setData([]);
  //   setFetching(true);
  //   listProjectTagsAPI(datasetId, true, value, 3).then((res) => {
  //     if (fetchId !== lastFetchId) {
  //       // for fetch callback order
  //       return;
  //     }
  //     const data = res.data.result.map((i) => ({
  //       text: i.name,
  //       value: i.name,
  //     }));
  //     setData(data);
  //     setFetching(false);
  //   });
  // };

  // const handleChange = (value) => {
  //   if (value.length !== 0) {
  //     value = value.map((i) => i.toLowerCase());
  //     let newTag = value.pop();
  //     let index = value.indexOf(newTag);
  //     if (index > -1) {
  //       value.splice(index, 1);
  //     } else {
  //       value.push(newTag);
  //     }
  //   }
  //   setValue(value);
  //   setData([]);
  //   setFetching(false);
  //   form.setFieldsValue({ tags: value });
  // };

  // function tagRender(props) {
  //   const { label, closable, onClose } = props;

  //   return (
  //     <Tag
  //       color="blue"
  //       closable={closable}
  //       onClose={onClose}
  //       style={{ marginRight: 3, display: 'inline-block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 465 }}
  //     >
  //       <span
  //         style={{ position: 'relative', display: 'flex', maxWidth: '95%', padding: '0px 4px 0px 8px' }}
  //       >
  //         {label.toLowerCase()}
  //       </span>
  //     </Tag>
  //   );
  // }

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
        footer={[
          <Button
            key="back"
            onClick={() => {
              cancel();
              setSelManifest(null);
              form.resetFields();
            }}
          >
            Close
          </Button>,
          <Button
            id="file_upload_submit_btn"
            key="submit"
            type="primary"
            loading={isLoading}
            onClick={handleOk}
          >
            Submit
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
              mode="tags"
              // tagRender={tagRender}
              value={value}
              notFoundContent={fetching ? <Spin size="small" /> : null}
              // onSearch={fetchTags}
              // onChange={handleChange}
              getPopupContainer={(triggerNode) => triggerNode.parentNode}
              style={{ width: '100%' }}
              rendervalue={(selected) => selected.map((el) => el.toLowerCase())}
              placeholder="Add tags"
            >
              {data.map((d) => (
                <Option key={d.value}>{d.text.toLowerCase()}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            rules={[
              // {
              //   required: true,
              //   message: t('formErrorMessages:project.upload.file.empty'),
              // },
              ({ getFieldValue }) => ({
                validator(rule, value) {
                  const fileList = value && value.fileList;
                  if (!fileList || (fileList && fileList.length === 0)) {
                    return Promise.reject(
                      t('formErrorMessages:project.upload.file.empty'),
                    );
                  } else if (
                    fileList &&
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
            label="Upload file"
          >
            <Upload multiple {...props}>
              <Button id="form_in_modal_select_file">
                <UploadOutlined />
                Select Files
              </Button>
            </Upload>
          </Form.Item>
        </Form>
        {manifestList && manifestList.length ? (
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
