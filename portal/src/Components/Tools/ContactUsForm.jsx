import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useHistory, Link } from 'react-router-dom';
import {
  Card,
  Button,
  Form,
  Input,
  Col,
  Row,
  Select,
  Typography,
  Breadcrumb,
  message,
  Result,
} from 'antd';
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
  const username = useSelector((state) => state.username);
  let history = useHistory();
  function onFinish(values) {
    setLoading(true);
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
              email: getEmail(),
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
                  // pattern: new RegExp(/^(?=.{2,200}$).*/g), // 2-100 letters
                  // message: t('formErrorMessages:contactUs.title.valid'),
                  validator:(rule,value)=>{
                    const isLengthValid= (trimString(value) && trimString(value).length >= 2 && trimString(value).length <= 200);
                    return isLengthValid ? Promise.resolve() : Promise.reject(t('formErrorMessages:contactUs.title.valid'));
                  }
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
                  //pattern: new RegExp(/^(?=.{10,1000}$).*/g), // 10-1000 letters
                  message: t('formErrorMessages:contactUs.description.valid'),
                  validator:(rule,value)=>{
                    console.log(trimString(value) && trimString(value).length)
                    const isLengthValid= (trimString(value) && trimString(value).length >= 10 && trimString(value).length <= 1000);
                    return isLengthValid ? Promise.resolve() : Promise.reject(t('formErrorMessages:contactUs.description.valid'));
                  }
                },
              ]}
            >
              <TextArea placeholder="Description" />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading}>
                Submit
              </Button>
              {/* <Button style={{ float: 'right' }}>
                <Link to="/support">Cancel</Link>
              </Button> */}
            </Form.Item>
          </Form>
        </>
      )}
    </>
  );
}

export default ContactUsForm;
