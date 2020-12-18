import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useHistory, Link } from 'react-router-dom';
import {
  Upload,
  Button,
  Form,
  Input,
  Col,
  Row,
  Select,
  Typography,
  Result,
  message,
} from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import jwtDecode from 'jwt-decode';
import { tokenManager } from '../../Service/tokenManager';
import { contactUsApi } from '../../APIs';
import { namespace, ErrorMessager } from '../../ErrorMessages';
import { useTranslation } from 'react-i18next';
import { trimString } from '../../Utility';

const { Option } = Select;
const { TextArea } = Input;
const { Title, Paragraph } = Typography;

function ContactUsForm(props) {
  const [form] = Form.useForm();
  const { t, i18n } = useTranslation(['tooltips', 'formErrorMessages']);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const username = useSelector((state) => state.username);
  const email = useSelector((state) => state.email);
  let history = useHistory();
  function onFinish(values) {
    setLoading(true);
    if (attachments.length > 4) {
      message.error('Please do not attach more than 4 files');
      setLoading(false);
      return;
    }
    for (let file of attachments) {
      const isOversize = file.size / 1024 / 1024 > 2;
      if (isOversize) {
        message.error('File size must be smaller than 2MB');
        setLoading(false);
        return;
      }
    }
    values.attachments = attachments.map((v) => {
      return { name: v.name, data: v.base64 };
    });
    console.log(values);
    contactUsApi(values)
      .then((res) => {
        // history.push('/support/contact-confirmation');
        setLoading(false);
        setSuccess(true);
        // message.success(
        //   'Your request is sent! It will be reviewed by a member of the VRE support team and you will receive a reply shortly through the email address associated with your VRE user account.​',
        //   15,
        // );
      })
      .catch((err) => {
        const errorMessager = new ErrorMessager(
          namespace.contactUs.contactUsAPI,
        );
        errorMessager.triggerMsg(err.response?.status);
        setLoading(false);
      });
  }

  function handleChange(value) {
    console.log(`selected ${value}`);
  }
  function getEmail() {
    const accessToken = tokenManager.getCookie('access_token');

    if (accessToken) {
      const email = jwtDecode(accessToken).email;
      return email;
    } else return;
  }
  function resetSubmission() {
    setSuccess(false);
    setAttachments([]);
    form.resetFields();
  }
  return (
    <>
      {success ? (
        <Result
          id="contact-us"
          status="success"
          title="Your request is sent!"
          subTitle={
            <>
              <p>
                Thank you for contacting us.
                <br />
                Your request will be reviewed by a member of the VRE support
                team and you will receive a reply shortly through the email
                address associated with your VRE user account.​
              </p>
            </>
          }
          extra={[
            <Button type="primary" key="console" onClick={resetSubmission}>
              OK!
            </Button>,
          ]}
        />
      ) : (
        <>
          <Title level={4} id="contact-us">
            Still need help?
          </Title>
          <Paragraph>
            Contact the VRE Support Team for additional help with platform tools
            and services, to report a bug, or other general questions.​
          </Paragraph>
          <Form
            layout="vertical"
            form={form}
            onFinish={onFinish}
            initialValues={{
              category: 'General inquiry',
              email,
              name: username,
            }}
          >
            <Form.Item
              name="category"
              label="Please select a category for your request"
              rules={[
                {
                  required: true,
                  message: t('formErrorMessages:contactUs.category.empty'),
                },
              ]}
            >
              <Select onChange={handleChange}>
                <Option value="General inquiry">General inquiry</Option>
                <Option value="Platform technical support">
                  Platform technical support
                </Option>
                <Option value="Account support">Account support</Option>
                <Option value="Report a bug">Report a bug</Option>
                <Option value="other">Other</Option>
              </Select>
            </Form.Item>
            <Row gutter={24}>
              <Col span={12}>
                <Form.Item name="name" label="Your Username">
                  <Input placeholder="Your name" disabled />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="email" label="Contact Email">
                  <Input placeholder="Contact Email" disabled />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item
              name="title"
              label="Title (between 2-200 characters)"
              rules={[
                {
                  required: true,
                  message: t('formErrorMessages:contactUs.title.empty'),
                },
                {
                  validator: (rule, value) => {
                    if (!value)
                      return Promise.reject();
                    const isLengthValid =
                      value &&
                      trimString(value) &&
                      trimString(value).length >= 2 &&
                      trimString(value).length <= 200;
                    return isLengthValid
                      ? Promise.resolve()
                      : Promise.reject(
                          t('formErrorMessages:contactUs.title.valid'),
                        );
                  },
                },
              ]}
            >
              <Input placeholder="Title" />
            </Form.Item>
            <Form.Item
              name="description"
              label="Description of your request (between 10-1000 characters)"
              rules={[
                {
                  required: true,
                  message: t('formErrorMessages:contactUs.description.empty'),
                },
                {
                  validator: (rule, value) => {
                    if (!value)
                      return Promise.reject();
                    const isLengthValid =
                      value &&
                      trimString(value) &&
                      trimString(value).length >= 10 &&
                      trimString(value).length <= 1000;
                    return isLengthValid
                      ? Promise.resolve()
                      : Promise.reject(
                          t('formErrorMessages:contactUs.description.valid'),
                        );
                  },
                },
              ]}
            >
              <TextArea placeholder="Description" />
            </Form.Item>
            <Form.Item name="attachments">
              <Upload
                fileList={attachments}
                accept=".pdf,.jpg,.jpeg,.png,.gif"
                onRemove={(file) => {
                  const index = attachments
                    .map((a) => a.name)
                    .indexOf(file.name);
                  const newFileList = attachments.slice();
                  newFileList.splice(index, 1);
                  setAttachments(newFileList);
                }}
                beforeUpload={(file) => {
                  if (
                    file.type !== 'image/png' &&
                    file.type !== 'image/jpg' &&
                    file.type !== 'image/jpeg' &&
                    file.type !== 'image/gif' &&
                    file.type !== 'application/pdf'
                  ) {
                    message.error(`File format is not accepted`);
                    return;
                  }
                  const reader = new FileReader();
                  reader.readAsDataURL(file);
                  reader.onload = (e) => {
                    if (e && e.target && e.target.result) {
                      file.base64 = e.target.result;
                      setAttachments([...attachments, file]);
                    }
                  };
                  return false;
                }}
              >
                <Button icon={<UploadOutlined />}>Upload Attachment</Button>
              </Upload>
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading}>
                Submit
              </Button>
            </Form.Item>
          </Form>
        </>
      )}
    </>
  );
}

export default ContactUsForm;
