import React, { useState } from "react";
import { Modal, Button, Form, Input, Select, Upload, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";
// import { uploadFileAPI } from "../../API";
import { DynamicKeyValue } from "../Form";
import { fileUpload } from "../../Utility";
import { connect ,useSelector} from "react-redux";
 

const { TextArea } = Input;
const { Option } = Select;

const children = [];
for (let i = 10; i < 36; i++) {
  children.push(<Option key={i.toString(36) + i}>{i.toString(36) + i}</Option>);
}

function handleChange(value) {
  console.log(`selected ${value}`);
}

const UploaderModal = ({ uploader: visible, cancel, datasetList }) => {
  const [form] = Form.useForm();
  const [isLoading, setIsloading] = useState(false);
  const [cancelTokens, setCancelTokens] = useState([]);
  const {username} = useSelector(state=>state);
  const stopLoading = () => {
    setIsloading(false);
  };

  const addCancelToken = source => {
    const newCancelTokens = cancelTokens.concat([source]);
    setCancelTokens(newCancelTokens);
  };

  const handleOk = () => {
    form
      .validateFields()
      .then(values => {
        setIsloading(true);
        const data = Object.assign({}, values, {
          name: values.file.file.name,
          file_type: values.file.file.type,

          //TODO: placeholder for user id
          uploader:  username
        });

        // form.resetFields();
        fileUpload(
          // values.uploaded_study,
          data,
          addCancelToken,
          //TODO: this.addProgress,
          stopLoading
        );

        // uploadFileAPI(datasetId, data).then(() => {
        //   message.success("File is uploaded successfully");
        //   setIsloading(false);
        //   cancel();
        // });
      })
      .catch(info => {
        setIsloading(false);
      });
  };

  const props = {
    beforeUpload() {
      return false;
    }
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
          </Button>
        ]}
      >
        <Form
          form={form}
          layout="vertical"
          name="form_in_modal"
          initialValues={{
            modifier: "public"
          }}
        >
          <Form.Item
            name="dataset"
            label="Dataset Name"
            rules={[
              {
                required: true,
                message: "Please select a dataset"
              }
            ]}
          >
            <Select
              onChange={value => {
                console.log(value);
              }}
              initialvalues={"1"}
              style={{ width: "100%" }}
            >
              {datasetList &&
                datasetList.map(item => (
                  <Option value={item.id}>{item.items.name}</Option>
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
          <Form.Item name="tags" label="Tags">
            <Select
              mode="tags"
              style={{ width: "100%" }}
              onChange={handleChange}
              tokenSeparators={[","]}
            >
              {children}
            </Select>
          </Form.Item>
          <DynamicKeyValue />
        </Form>
      </Modal>
    </div>
  );
};

export default connect(state => {
  const { datasetList } = state;
  return { datasetList };
})(UploaderModal);
