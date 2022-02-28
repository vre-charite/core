import React, { useState } from 'react';
import { useSelector } from 'react-redux';
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
import { contactUsApi } from '../../APIs';
import { namespace, ErrorMessager } from '../../ErrorMessages';
import { useTranslation } from 'react-i18next';
import { trimString } from '../../Utility';
import i18n from '../../i18n';
import { PLATFORM } from '../../config';
const { Option } = Select;
const { TextArea } = Input;
const { Title, Paragraph } = Typography;

function ContactUsForm(props) {
  const [form] = Form.useForm();
  const { t } = useTranslation(['tooltips', 'formErrorMessages', 'success']);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const username = useSelector((state) => state.username);
  const email = useSelector((state) => state.email);
  function onFinish(values) {
    setLoading(true);
    if (attachments.length > 4) {
      message.error(
        `${i18n.t('formErrorMessages:contactUs.attachment.number')}`,
      );
      setLoading(false);
      return;
    }
    for (let file of attachments) {
      const isOversize = file.size / 1024 / 1024 > 2;
      if (isOversize) {
        message.error(
          `${i18n.t('formErrorMessages:contactUs.attachment.size')}`,
        );
        setLoading(false);
        return;
      }
    }
    values.attachments = attachments.map((v) => {
      return { name: v.name, data: v.base64 };
    });
    contactUsApi(values)
      .then((res) => {
        // history.push('/support/contact-confirmation');
        setLoading(false);
        setSuccess(true);
      })
      .catch((err) => {
        const errorMessager = new ErrorMessager(
          namespace.contactUs.contactUsAPI,
        );
        errorMessager.triggerMsg(err.response?.status);
        setLoading(false);
      });
  }

  function handleChange(value) {}
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
                {i18n.t('success:contactUs.text.0')}
                <br />
                {i18n.t('success:contactUs.text.1', { PLATFORM: PLATFORM })}
              </p>
            </>
          }
          extra={[
            <Button type="primary" key="console" onClick={resetSubmission}>
              {i18n.t('success:contactUs.button')}
            </Button>,
          ]}
        />
      ) : (
        <>
          <Title level={4} id="contact-us">
            Still need help?
          </Title>
          <Paragraph>
            Contact the {PLATFORM} Support Team for additional help with
            platform tools and services, to report a bug, or other general
            questions.​
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
                    if (!value) return Promise.reject();
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
                    if (!value) return Promise.reject();
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
                    message.error(
                      `${i18n.t(
                        'formErrorMessages:contactUs.attachment.format',
                      )}`,
                    );
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
