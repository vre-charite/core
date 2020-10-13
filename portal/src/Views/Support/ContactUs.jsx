import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { Card, Button, Form, Input, Col, Row, Select } from 'antd';
import styles from './index.module.scss';
import jwtDecode from 'jwt-decode';
import { tokenManager } from '../../Service/tokenManager';
import { contactUsApi } from '../../APIs';
import { namespace, ErrorMessager } from '../../ErrorMessages';
const { Option } = Select;
const { TextArea } = Input;

function ContactUs() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const username = useSelector((state) => state.username);
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
              <Form.Item name="name" label="Your Userame">
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
                message: 'Please input description.',
              },
              {
                pattern: new RegExp(/^(?=.{2,200}$).*/g), // 2-100 letters
                message: 'Title should be 2-200 characters',
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
                message: 'Please input description.',
              },
              {
                pattern: new RegExp(/^(?=.{10,1000}$).*/g), // 10-1000 letters
                message: 'Description should be 10-500 characters',
              },
            ]}
          >
            <TextArea placeholder="Description" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              Submit
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}

export default ContactUs;
