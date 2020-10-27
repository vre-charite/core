import React, { useState, useContext } from 'react';
import { Modal, Button, Form, Input, Select, Upload, Tag, Spin } from 'antd';
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
import { listProjectTagsAPI } from '../../../APIs';
import { validateTag } from '../../../Utility';
const { Option } = Select;

const GreenRoomUploader = ({
  isShown: visible,
  cancel,
  datasetList,
  datasetId,
  fetch: fetchTree,
}) => {
  const [form] = Form.useForm();
  const [isLoading, setIsloading] = useState(false);
  const [tags, setTags] = useState([]);
  const [data, setData] = useState([]);
  const [value, setValue] = useState([]);
  const [fetching, setFetching] = useState(false);

  const q = useContext(UploadQueueContext);
  const [currentDataset] = useCurrentProject();
  const { username } = useSelector((state) => state);
  const handleOk = () => {
    form
      .validateFields()
      .then((values) => {
        console.log('handleOk -> values', values);
        setIsloading(true);
        const data = Object.assign({}, values, {
          name: values.file.file.name,
          file_type: values.file.file.type,
          uploader: username,
          projectName: currentDataset.containerName,
          projectCode: currentDataset.code,
        });
        uploadStarter(data, q);
        form.resetFields();
        cancel();
        setIsloading(false);
      })
      .catch((info) => {
        console.log('Validate Failed:', info);
        setIsloading(false);
      });
  };

  const props = {
    beforeUpload() {
      return false;
    },
  };

  let lastFetchId = 0;
  const fetchTags = (value) => {
    value = value.toLowerCase();
    lastFetchId += 1;
    const fetchId = lastFetchId;
    setData([]);
    setFetching(true);
    listProjectTagsAPI(datasetId, true, value, 3).then((res) => {
      if (fetchId !== lastFetchId) {
        // for fetch callback order
        return;
      }
      const data = res.data.result.map((i) => ({
        text: i.name,
        value: i.name,
      }));
      setData(data);
      setFetching(false);
    });
  };

  const handleChange = (value) => {
    if (value.length !== 0) {
      value = value.map(i => i.toLowerCase())
      let newTag = value.pop()
      let index = value.indexOf(newTag)
      if (index > -1) {
        value.splice(index, 1)
      } else {
        value.push(newTag)
      }
    }
    setValue(value);
    setData([]);
    setFetching(false);
    form.setFieldsValue({ tags: value });
  };

  function tagRender(props) {
    const { label, closable, onClose } = props;


    return (
      <Tag
        color="blue"
        closable={closable}
        onClose={onClose}
        style={{ marginRight: 3 }}
      >
        {label.toLowerCase()}
      </Tag>
    );
  }

  return (
    <div>
      <Modal
        visible={visible}
        title="Upload Files"
        onOk={handleOk}
        onCancel={cancel}
        footer={[
          <Button key="back" onClick={cancel}>
            Close
          </Button>,
          <Button
            id='file_upload_submit_btn'
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
              {datasetList[0] &&
                datasetList[0].datasetList.map((item) => (
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
                      message: 'Please input your Generate ID',
                    },
                    {
                      pattern: new RegExp(/^([A-Z]{3})-([0-9]{4})$/g), // Format BXT-1234
                      message: 'Please input correct Generate ID',
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
                <small>
                  * The format of Generate ID should follow: ABC-1234
                </small>
              </Form.Item>

              <Form.Item
                name="gid_repeat"
                label="Confirm Generate ID"
                dependencies={['gid']}
                hasFeedback
                rules={[
                  {
                    required: true,
                    message: 'Please confirm your Generate ID!',
                  },
                  ({ getFieldValue }) => ({
                    validator(rule, value) {
                      if (!value || getFieldValue('gid') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(
                        'The two Generate ID that you entered do not match!',
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
                      'Up to 10 tags per file！',
                    );
                  }
                  let i;
                  for (i of value) {
                    if (!validateTag(i)) {
                      return Promise.reject(
                        'Tag should be 1-32 lowercase alphanumeric characters.',
                      );
                    }
                  }
                  return Promise.resolve();
                },
              }),
            ]}
          >
            <Select
              mode="tags"
              tagRender={tagRender}
              value={value}
              notFoundContent={fetching ? <Spin size="small" /> : null}
              onSearch={fetchTags}
              onChange={handleChange}
            >
              {data.map((d) => (
                <Option key={d.value}>{d.text.toLowerCase()}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            rules={[
              {
                required: true,
                message: 'please select files',
              },
              ({ getFieldValue }) => ({
                validator(rule, value) {
                  const { fileList } = value;
                  if (
                    fileList.length ===
                    _.uniqBy(fileList, (item) => item.name).length
                  ) {
                    return Promise.resolve();
                  } else {
                    return Promise.reject(
                      'File already selected for uploading. Please select a different file.',
                    );
                  }
                },
              }),
            ]}
            name="file"
            label="Upload file"
          >
            <Upload multiple {...props}>
              <Button id='form_in_modal_select_file'>
                <UploadOutlined />
                Select Files
              </Button>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default withRouter(
  connect(
    (state) => {
      const { datasetList, tags, containersPermission, uploadList } = state;
      return { datasetList, tags, containersPermission, uploadList };
    },
    { appendUploadListCreator, updateUploadItemCreator, setNewUploadIndicator },
  )(GreenRoomUploader),
);
