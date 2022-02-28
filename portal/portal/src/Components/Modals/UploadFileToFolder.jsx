import React, { useState, useContext } from 'react';
import { Modal, Button, Form, Input, Select, Upload, Tooltip } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { withRouter } from 'react-router-dom';
import { connect, useSelector } from 'react-redux';
import {
  appendUploadListCreator,
  updateUploadItemCreator,
  setNewUploadIndicator,
} from '../../Redux/actions';
import _ from 'lodash';
import { uploadStarter, useCurrentProject } from '../../Utility';
import { UploadQueueContext } from '../../Context';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { dcmProjectCode, DcmSpaceID } from '../../config';

const { Option } = Select;

const UploadFileToFolder = ({
  isShown: visible,
  cancel,
  datasetList,
  datasetId,
  containersPermission,
}) => {
  const [form] = Form.useForm();
  const [isLoading, setIsloading] = useState(false);
  const [cancelTokens, setCancelTokens] = useState([]);
  const { username } = useSelector((state) => state);
  const q = useContext(UploadQueueContext);
  const stopLoading = () => {
    setIsloading(false);
  };

  const [currentDataset] = useCurrentProject();

  const addCancelToken = (source) => {
    const newCancelTokens = cancelTokens.concat([source]);
    setCancelTokens(newCancelTokens);
  };

  const handleOk = () => {
    form
      .validateFields()
      .then((values) => {
        setIsloading(true);
        // const subPath = path && path[0] === "/" ? path.substring(1) : "";
        const data = Object.assign({}, values, {
          name: values.file.file.name,
          file_type: values.file.file.type,
          uploader: username,
          projectName: currentDataset.name,
          projectCode: currentDataset.code,
        });
        const subPath = '';
        uploadStarter(data, q);
        form.resetFields();
        cancel();
      })
      .catch((info) => {
        setIsloading(false);
      });
  };

  const props = {
    beforeUpload(file) {
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
        maskClosable={false}
        closable={false}
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
                  <Option value={parseInt(item.id)}>{item.name}</Option>
                ))}
            </Select>
          </Form.Item>
          {currentDataset && currentDataset.code === dcmProjectCode ? (
            <>
              <Form.Item
                label={
                  <span>
                    {DcmSpaceID}&nbsp;
                    <Tooltip
                      title={`The format of ${DcmSpaceID} should follow: ABC-1234`}
                    >
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
                      message: `Please input your ${DcmSpaceID}`,
                    },
                    {
                      pattern: new RegExp(/^([A-Z]{3})-([0-9]{4})$/g), // Format BXT-1234
                      message: `Please input correct ${DcmSpaceID}`,
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
                label={`Confirm ${DcmSpaceID}`}
                dependencies={['gid']}
                hasFeedback
                rules={[
                  {
                    required: true,
                    message: `Please confirm your ${DcmSpaceID}!`,
                  },
                  ({ getFieldValue }) => ({
                    validator(rule, value) {
                      if (!value || getFieldValue('gid') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(
                        `The two ${DcmSpaceID} that you entered do not match!`,
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
            label="Files"
          >
            <Upload multiple {...props}>
              <Button>
                <UploadOutlined /> Select Files
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
      const { datasetList, tags, containersPermission } = state;
      return { datasetList, tags, containersPermission };
    },
    { appendUploadListCreator, setNewUploadIndicator, updateUploadItemCreator },
  )(UploadFileToFolder),
);
