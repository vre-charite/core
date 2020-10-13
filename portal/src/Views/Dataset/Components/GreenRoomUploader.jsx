import React, { useState, useContext } from 'react';
import {
  Modal,
  Button,
  Form,
  Input,
  Select,
  Upload,
} from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { uploadStarter,useCurrentProject } from '../../../Utility';
import { withRouter } from 'react-router-dom';
import { connect ,useSelector} from 'react-redux';
import {
  appendUploadListCreator,
  updateUploadItemCreator,
  setNewUploadIndicator,
} from '../../../Redux/actions';
import _ from 'lodash';
import { UploadQueueContext } from '../../../Context';
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
  const q = useContext(UploadQueueContext);
  const [currentDataset] = useCurrentProject();
  const {username} = useSelector(state=>state);
  const handleOk = () => {
    form
      .validateFields()
      .then((values) => {
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
