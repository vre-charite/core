import React, { useState, useContext } from 'react';
import {
  Modal,
  Button,
  Form,
  Input,
  Select,
  Upload,
  message,
  Progress,
  Tooltip,
} from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { InboxOutlined } from '@ant-design/icons';
import { uploadStarter } from '../../../Utility';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { useCookies } from 'react-cookie';
import {
  appendUploadListCreator,
  updateUploadItemCreator,
  setNewUploadIndicator,
} from '../../../Redux/actions';
import _ from 'lodash';
import { UploadQueueContext } from '../../../Context';
import { QuestionCircleOutlined } from '@ant-design/icons';
const { Option } = Select;
const { Dragger } = Upload;

const GreenRoomUploader = ({
  isShown: visible,
  cancel,
  datasetList,
  match,
  datasetId,
  selectedPane,
  fetch: fetchTree,
  appendUploadListCreator,
  updateUploadItemCreator,
  setNewUploadIndicator,
  containersPermission,
  uploadList,
}) => {
  const [form] = Form.useForm();
  const [isLoading, setIsloading] = useState(false);
  const [cancelTokens, setCancelTokens] = useState([]);
  const [cookies, setCookie] = useCookies(['username']);
  const [folderPath, setFolderPath] = useState('');
  const q = useContext(UploadQueueContext);
  const currentDatasetId = match.params.datasetId;
  const currentDataset = _.find(containersPermission, {
    container_id: Number(currentDatasetId),
  });
  const handleOk = () => {
    form
      .validateFields()
      .then((values) => {
        setIsloading(true);
        const data = Object.assign({}, values, {
          name: values.file.file.name,
          file_type: values.file.file.type,
          uploader: cookies.username,
          projectName: currentDataset.container_name,
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
          {/* <Form.Item
            rules={[
              {
                validator(rule, value) {
                  if (value && value !== currentDataset.container_name) {
                    return Promise.reject('The project name is not correct');
                  } else {
                    return Promise.resolve();
                  }
                },
              },
              {
                required: true,
                message: 'Please confirm the project name',
              },
            ]}
            name="confirmProject"
            label="Confirm Project"
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
              placeholder="Please input the project name"
            ></Input>
          </Form.Item> */}
          {currentDataset && currentDataset.container_name === 'GENERATE' ? (
            <>
              <Form.Item
                //label="Generate ID"
                label={
                  <span>
                    Generate ID&nbsp;
                    <Tooltip title="The format of Generate ID should follow: ABC-1234">
                      <QuestionCircleOutlined />
                    </Tooltip>
                  </span>
                }
                required
              >
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
              </Form.Item>

              <Form.Item
                name="gid_repeat"
                label="Comfirm Generate ID"
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
              <Button>
                <UploadOutlined />
                Select Files
              </Button>
            </Upload>
            {/*  <Dragger customRequest={()=>{}}>
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">Click or drag file to this area to upload</p>
              <p className="ant-upload-hint">
                Support for a single or bulk upload. Strictly prohibit from uploading company data or other
                band files
              </p>
            </Dragger> */}
          </Form.Item>
          {/*     <Form.Item name="tags" label={"tags"}>
            <Select mode="tags" style={{ width: "100%" }} placeholder="tags">
              {tags &&
                tags.map((item) => (
                  <Select.Option key={item}>{item}</Select.Option>
                ))}
            </Select>
          </Form.Item> */}
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
