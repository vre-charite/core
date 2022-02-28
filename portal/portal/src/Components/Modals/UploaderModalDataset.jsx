import React, { useState } from 'react';
import { Modal, Button, Form, Input, Select, Upload } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { fileUpload } from '../../Utility';
import { withRouter } from 'react-router-dom';
import { connect, useSelector } from 'react-redux';
const { TextArea } = Input;
const { Option } = Select;

const children = [];
for (let i = 10; i < 36; i++) {
  children.push(<Option key={i.toString(36) + i}>{i.toString(36) + i}</Option>);
}

const UploaderModalDataset = ({
  isShown: visible,
  cancel,
  datasetList,
  match,
  datasetId,
}) => {
  const [form] = Form.useForm();
  const [isLoading, setIsloading] = useState(false);
  const [cancelTokens, setCancelTokens] = useState([]);
  const { username } = useSelector((state) => state);
  const stopLoading = () => {
    setIsloading(false);
  };

  const addCancelToken = (source) => {
    const newCancelTokens = cancelTokens.concat([source]);
    setCancelTokens(newCancelTokens);
  };

  const handleOk = () => {
    form
      .validateFields()
      .then((values) => {
        setIsloading(true);
        // const datasetId = values.dataset;
        const data = Object.assign({}, values, {
          name: values.file.file.name,
          file_type: values.file.file.type,
          uploader: username,
        });

        // form.resetFields();
        fileUpload(
          // values.uploaded_study,
          data,
          addCancelToken,
          //   this.addProgress,
          stopLoading,
        );

        cancel();
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
            initialValue={datasetId}
            rules={[
              {
                required: true,
                message: 'Please select a dataset',
              },
            ]}
          >
            <Select
              onChange={(value) => {}}
              disabled={datasetId !== undefined}
              style={{ width: '100%' }}
            >
              {datasetList[0] &&
                datasetList[0].datasetList.map((item) => (
                  <Option key={item.id} value={item.id}>
                    {item.name}
                  </Option>
                ))}
            </Select>
          </Form.Item>
          <Form.Item name="desc" label="File description">
            <TextArea />
          </Form.Item>
          <Form.Item name="file" label="Upload file">
            <Upload {...props}>
              <Button>
                <UploadOutlined /> Click to Upload
              </Button>
            </Upload>
          </Form.Item>
          {/* <Form.Item name="tags" label={"tags"}>
            <Select mode="tags" style={{ width: "100%" }} placeholder="tags">
              {tags &&
                tags.map((item) => (
                  <Select.Option key={item}>{item}</Select.Option>
                ))}
            </Select>
          </Form.Item> */}
          {/*  <FolderInput getFolderPath={(folder)=>{setFolderPath(folder)}} /> */}
          {/* <DynamicKeyValue /> */}
          {/* <FolderCascader /> */}
        </Form>
      </Modal>
    </div>
  );
};

export default withRouter(
  connect((state) => {
    const { datasetList, tags } = state;
    return { datasetList, tags };
  })(UploaderModalDataset),
);
