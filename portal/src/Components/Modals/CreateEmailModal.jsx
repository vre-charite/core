import React, { useState } from 'react';
import {
  Modal,
  Button,
  Form,
  Input,
  Result,
  Select,
  Spin,
} from 'antd';
import { CheckCircleFilled, CloseOutlined } from '@ant-design/icons';
import { sendEmailToAll, getPortalUsers, sendEmails } from '../../APIs';
import { trimString } from '../../Utility';
import _ from 'lodash';
const { Option } = Select;
let lastFetchId = 0;
function CreateEmailModal({ visible, setOpenModal, setCloseModal }) {
  const { TextArea } = Input;
  const [sentEmail, setSentEmail] = useState(false);
  const [sentBtnLoading, setSentBtnLoading] = useState(false);
  const [form] = Form.useForm();
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [isFetching, setIsFetching] = useState(false);
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
    const receivers = values['to'];
    if (!!_.find(receivers, (receiver) => receiver.value === 'All Users')) {
      sendEmailToAll(values.Subject, values.Content);
    } else {
      sendEmails(
        values.Subject,
        values.Content,
        values.to.map((item) => item.value),
      );
    }
  }
  function cancel() {
    setSentBtnLoading(false);
    setCloseModal();
    setSelectedUsers([]);
    setTimeout(() => {
      setSentEmail(false);
      form.resetFields();
    }, 500);
  }
  const fetchUser = (value) => {
    lastFetchId += 1;
    const fetchId = lastFetchId;
    setUsers([]);
    setIsFetching(true);
    getPortalUsers({ name: value, orderBy: 'name', orderType: 'asc' }).then(
      (res) => {
        if (fetchId !== lastFetchId) {
          return;
        }
        const users = res.data.result.map((item) => ({
          name: item.name,
          email: item.email,
        }));
        setUsers(users);
        setIsFetching(false);
      },
    );
  };
  const handleChange = (value) => {
    setSelectedUsers(value);
  };

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
        {/*         <div
          style={{
            width: 100,
            height: 1,
            border: 0,
            background: 'linear-gradient(to right, #1890ff , white)',
          }}
        ></div> */}
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
            <Form.Item
              rules={[{ required: true, message: 'Receivers is required' }]}
              name="to"
              label="To"
            >
              {/*  <Input placeholder="all users" disabled /> */}
              <Select
                allowClear
                mode="multiple"
                labelInValue
                placeholder="Search Usernames"
                notFoundContent={isFetching ? <Spin size="small" /> : null}
                filterOption={false}
                onSearch={fetchUser}
                onChange={handleChange}
                style={{ width: '100%' }}
                showSearch
                value={selectedUsers}
                defaultActiveFirstOption={false}
                showArrow={false}
                optionLabelProp="label"
              >
                <Option
                  disabled={
                    selectedUsers.length > 0 &&
                    !selectedUsers.find((item) => item.value === 'All Users')
                  }
                  label={<b>All Users</b>}
                  value={'All Users'}
                >
                  <b>All Users</b>
                </Option>
                {selectedUsers.map((item) => item.value).includes('All Users')
                  ? []
                  : users.map((item) => (
                      <Option
                        label={item.name}
                        key={item.name}
                        value={item.email}
                      >
                        {item.name}
                      </Option>
                    ))}
              </Select>
            </Form.Item>
            <Form.Item
              name="Subject"
              label={`Subject (between ${SUBJECT_LIMIT_MIN}-${SUBJECT_LIMIT_MAX} letters)`}
              rules={[
                {
                  required: true,
                  validator: (rule, value) => {
                    if (value === undefined) {
                      return Promise.reject(`"Subject" is required`);
                    }
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
                {
                  required: true,
                  validator: (rule, value) => {
                    if (value === undefined) {
                      return Promise.reject(`"Content" is required`);
                    }
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
