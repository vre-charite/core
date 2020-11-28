import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Input, Result } from 'antd';
import { CheckCircleFilled, CloseOutlined } from '@ant-design/icons';
import { sendEmailToAll } from '../../APIs';
import { trimString } from '../../Utility';

function CreateEmailModal({ visible, setVisble }) {
  const { TextArea } = Input;
  const [sentEmail, setSentEmail] = useState(false);
  const [sentBtnLoading, setSentBtnLoading] = useState(false);
  const [form] = Form.useForm();
  const SUBJECT_LIMIT_MIN = 2;
  const SUBJECT_LIMIT_MAX = 200;
  const CONTENT_LIMIT_MIN = 10;
  const CONTENT_LIMIT_MAX = 1000;
  async function send(values) {
    if (!values.Subject || !values.Content) {
      setSentBtnLoading(false);
      return;
    }
    setTimeout(() => {
      setSentBtnLoading(false);
      setSentEmail(true);
      setTimeout(() => {
        cancel();
      }, 2000);
    }, 1000);
    sendEmailToAll(values.Subject, values.Content);
    // const res = await ;
    // if (res.status === 200 && res.data.code === 200) {

    // }
  }
  function cancel() {
    setSentBtnLoading(false);
    setVisble(false);
    setTimeout(() => {
      setSentEmail(false);
      form.resetFields();
    }, 500);
  }
  return (
    <Modal
      visible={visible}
      width={462}
      centered
      cancelButtonProps={{ style: { display: 'none' } }}
      closeIcon={<></>}
      okButtonProps={{ style: { display: 'none' } }}
      footer={null}
    >
      <div
        style={{
          marginLeft: 33,
          marginRight: 33,
          marginTop: 20,
          position: 'relative',
          zIndex: 100,
        }}
      >
        <CloseOutlined
          onClick={cancel}
          style={{
            position: 'absolute',
            right: -20,
            top: -20,
            fontSize: '20px',
          }}
        />
        <h2
          style={{
            fontSize: 24,
            fontWeight: 'bold',
            color: 'rgba(0,0,0,0.65)',
            marginBottom: 0,
            height: 35,
          }}
        >
          EMAIL
        </h2>
        <div
          style={{
            width: 100,
            height: 1,
            border: 0,
            background: 'linear-gradient(to right, #1890ff , white)',
          }}
        ></div>
        <h4
          style={{
            fontSize: 12,
            fontWeight: 'bold',
            color: 'rgba(0,0,0,0.25)',
            marginBottom: 20,
            marginTop: 5,
          }}
        >
          Deliver message to platform users
        </h4>
        {sentEmail ? (
          <Result
            icon={<CheckCircleFilled style={{ color: '#53c41a' }} />}
            title="email has been sent!"
            extra={null}
          />
        ) : (
          <Form
            layout="vertical"
            form={form}
            onFinish={send}
            onFinishFailed={() => setSentBtnLoading(false)}
          >
            <Form.Item name="to" label="To">
              <Input placeholder="all users" disabled />
            </Form.Item>
            <Form.Item
              name="Subject"
              label={`Subject (between ${SUBJECT_LIMIT_MIN}-${SUBJECT_LIMIT_MAX} letters)`}
              rules={[
                { required: true, message: '"Subject" is required' },
                {
                  validator: (rule, value) => {
                    const isLengthValid =
                      value.length >= SUBJECT_LIMIT_MIN &&
                      value.length <= SUBJECT_LIMIT_MAX &&
                      trimString(value) &&
                      trimString(value).length >= SUBJECT_LIMIT_MIN;
                    return isLengthValid
                      ? Promise.resolve()
                      : Promise.reject(
                          `Subject should be within ${SUBJECT_LIMIT_MIN}-${SUBJECT_LIMIT_MAX} letters`,
                        );
                  },
                },
              ]}
            >
              <Input placeholder="Please enter subject here" />
            </Form.Item>
            <Form.Item
              name="Content"
              label={`Content (between ${CONTENT_LIMIT_MIN}-${CONTENT_LIMIT_MAX} letters)`}
              rules={[
                { required: true, message: '"Content" is required' },
                {
                  validator: (rule, value) => {
                    const isLengthValid =
                      value.length >= CONTENT_LIMIT_MIN &&
                      value.length <= CONTENT_LIMIT_MAX &&
                      trimString(value) &&
                      trimString(value).length >= CONTENT_LIMIT_MIN;
                    return isLengthValid
                      ? Promise.resolve()
                      : Promise.reject(
                          `Content should be within ${CONTENT_LIMIT_MIN}-${CONTENT_LIMIT_MAX} letters`,
                        );
                  },
                },
              ]}
            >
              <TextArea
                placeholder="Please enter content here"
                autoSize={{ minRows: 5, maxRows: 5 }}
              />
            </Form.Item>
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={sentBtnLoading}
                onClick={() => setSentBtnLoading(true)}
              >
                Send
              </Button>
            </Form.Item>
          </Form>
        )}
      </div>
    </Modal>
  );
}
export default CreateEmailModal;
