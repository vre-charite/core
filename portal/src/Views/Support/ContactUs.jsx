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
} from 'antd';
import styles from './index.module.scss';
import jwtDecode from 'jwt-decode';
import { useTranslation } from 'react-i18next';
import { tokenManager } from '../../Service/tokenManager';
import { contactUsApi } from '../../APIs';
import { namespace, ErrorMessager } from '../../ErrorMessages';
import { trimString } from '../../Utility';

const { Option } = Select;
const { TextArea } = Input;
const { Title } = Typography;

function ContactUs() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const username = useSelector((state) => state.username);
  const { t, i18n } = useTranslation(['tooltips', 'formErrorMessages']);
  let history = useHistory();

  function onFinish(values) {
    setLoading(true);
    contactUsApi(values)
      .then((res) => {
        history.push('/support/contact-confirmation');
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

  return (
    <>
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <Breadcrumb separator="">
            <Breadcrumb.Item className={styles.white}>
              <Link to="/support" className={styles.white}>
                Support
                <span style={{ color: '#cccccc', padding: '0 5px' }}> / </span>
              </Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item className={styles.white}>
              Contact Us
            </Breadcrumb.Item>
          </Breadcrumb>
          <Title level={2} className={styles.title}>
            Need help?
          </Title>
          <p>Fill in this form and send your request to us. </p>
        </div>
      </section>
      <div className={styles.contactWrapper}>
        <Card title="Contact Us" style={{ marginBottom: '10px' }}>
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
                  message: 'Please select a category',
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
                  message: 'Please provide a title',
                },
                {
                  validator:(rule,value)=>{
                    const isLengthValid= (trimString(value) && trimString(value).length >= 2 && trimString(value).length <= 200);
                    return isLengthValid ? Promise.resolve() : Promise.reject(t('formErrorMessages:contactUs.title.valid'));
                  }, // 2-100 letters
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
                  message: 'Please provide a description',
                },
                {
                  validator:(rule,value)=>{
                    const isLengthValid= (trimString(value) && trimString(value).length >= 10 && trimString(value).length <= 1000);
                    return isLengthValid ? Promise.resolve() : Promise.reject(t('formErrorMessages:contactUs.description.valid'));
                  }, // 10-1000 letters
                },
              ]}
            >
              <TextArea placeholder="Description" />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading}>
                Submit
              </Button>
              <Button style={{ float: 'right' }}>
                <Link to="/support">Cancel</Link>
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </>
  );
}

export default ContactUs;
