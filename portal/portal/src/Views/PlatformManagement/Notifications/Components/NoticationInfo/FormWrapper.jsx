import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Input,
  InputNumber,
  DatePicker,
  Form,
  Select,
  Button,
  message,
} from 'antd';
import { notificationActions } from '../../../../../Redux/actions';
import { CheckOutlined, SyncOutlined } from '@ant-design/icons';
import moment from 'moment-timezone';
import styles from './index.module.scss';
import i18n from '../../../../../i18n';
import {
  createNotification,
  updateNotification,
} from '../../../../../APIs/notifications';
import NotificationPreview from './NotificationPreview';
import { curTimeZoneAbbr } from '../../../../../Utility/timeCovert';
import { v4 as uuidv4 } from 'uuid';
const { Option } = Select;
const { TextArea } = Input;

const FormWrapper = (props) => {
  const defaultMsgTxt =
    'The platform will be temporarily unavailable due to upcoming scheduled maintenance. Please save your work and avoid usage during this time.';
  const [messageInput, setMessageInput] = useState(defaultMsgTxt);
  const [loading, setLoading] = useState(false);

  const { activeNotification, updateNotificationTimes, edit } = useSelector(
    (state) => state.notifications,
  );
  const [previewData, setPreviewData] = useState(null);
  const dispatch = useDispatch();
  const dateFormat = 'YYYY-MM-DD HH:mm:ss';
  useEffect(() => {
    if (activeNotification && activeNotification.message) {
      setMessageInput(activeNotification.message);
      setPreviewData(activeNotification);
    } else {
      const updatedData = {
        id: uuidv4(),
        type: 'maintenance',
        message: defaultMsgTxt,
        detail: {
          duration: null,
          durationUnit: null,
          maintenanceDate: moment().utc().format('YYYY-MM-DDTHH:mm:ss'),
        },
      };
      setPreviewData(updatedData);
    }
  }, []);

  const handleOnChange = (e) => {
    setMessageInput(e.target.value);
  };

  const notificationFormSubmit = async (values) => {
    const detail = {
      maintenance_date: values.date,
      duration: parseInt(values.duration),
      duration_unit: values.unit,
    };
    if (!edit) {
      try {
        setLoading(true);
        const res = await createNotification(
          'maintenance',
          values.message,
          detail,
        );
        if (res.data && res.data.result && res.data.result.result) {
          dispatch(
            notificationActions.setUpdateNotificationTimes(
              updateNotificationTimes + 1,
            ),
          );
          dispatch(
            notificationActions.setActiveNotification(res.data.result.result),
          );
          dispatch(notificationActions.setCreateNewNotificationStatus(false));
        }
        setLoading(false);
      } catch (e) {
        message.error(i18n.t('errormessages:createNotification.default.0'));
        setLoading(false);
      }
    } else {
      try {
        setLoading(true);
        const res = await updateNotification(
          activeNotification.id,
          'maintenance',
          values.message,
          detail,
        );
        console.log(i18n.t('errormessages:updateNotification.default.0'));
        if (res.data && res.data.result && res.data.result.result) {
          dispatch(
            notificationActions.setActiveNotification(res.data.result.result),
          );
          dispatch(
            notificationActions.setUpdateNotificationTimes(
              updateNotificationTimes + 1,
            ),
          );
          dispatch(notificationActions.setEditNotification(false));
        }
        setLoading(false);
      } catch (e) {
        message.error(i18n.t('errormessages:updateNotification.default.0'));
        setLoading(false);
      }
    }
  };
  const formValuesChange = function (changedValues, allValues) {
    const updatedData = {
      id: uuidv4(),
      type: 'maintenance',
      message: allValues['message'],
      detail: {
        duration: allValues['duration'],
        durationUnit: allValues['unit'],
        maintenanceDate: allValues['date']
          ? moment(allValues['date']).utc().format('YYYY-MM-DDTHH:mm:ss')
          : moment().utc().format('YYYY-MM-DDTHH:mm:ss'),
      },
    };
    setPreviewData(updatedData);
  };

  return (
    <>
      <Form
        onFinish={notificationFormSubmit}
        initialValues={
          edit
            ? {
                message: activeNotification.message,
                date: moment(
                  activeNotification.detail.maintenanceDate + '.00Z',
                ),
                duration: activeNotification.detail.duration,
                unit: activeNotification.detail.durationUnit,
              }
            : {
                message: defaultMsgTxt,
                date: moment(),
              }
        }
        onValuesChange={formValuesChange}
      >
        <div className={styles.input1}>
          <p>Message</p>
          <Form.Item
            name="message"
            rules={[
              {
                required: true,
                message: 'Please input the message!',
              },
            ]}
          >
            <TextArea
              maxLength={250}
              rows={2}
              onChange={handleOnChange}
              onKeyPress={(e) => {
                if (e.key === 'Enter') e.preventDefault();
              }}
            />
          </Form.Item>
          {<p>{messageInput.length > 0 ? messageInput.length : 0} / 250</p>}
        </div>
        <div className={styles.input2}>
          <div className={styles['input2__part-one']}>
            <p className={styles['input2__part-one__message-one']}>
              Maintenance Date and Time
            </p>
            <div className={styles['input2__part-one__date-picker']}>
              <Form.Item
                name="date"
                rules={[
                  {
                    required: true,
                    message: 'Please select a date and time!',
                  },
                ]}
              >
                <DatePicker
                  showTime
                  format={dateFormat}
                  disabledDate={(current) => {
                    return current && current.valueOf() < Date.now();
                  }}
                />
              </Form.Item>
            </div>
            <p className={styles['input2__message-two']}>{curTimeZoneAbbr()}</p>
          </div>
          <div className={styles['input2__part-two']}>
            <p className={styles['input2__part-two__message-three']}>
              Estimated Duration
            </p>
            <div className={styles['input2__part-two__input']}>
              <Form.Item
                name="duration"
                rules={[
                  {
                    required: true,
                    message: 'Please input the duration!',
                  },
                ]}
              >
                <InputNumber max={1000} min={1} />
              </Form.Item>
            </div>
            <div className={styles['input2__part-two__select']}>
              <Form.Item
                name="unit"
                rules={[
                  {
                    required: true,
                    message: 'Please select a unit!',
                  },
                ]}
              >
                <Select>
                  <Option value="d">Days</Option>
                  <Option value="h">Hours</Option>
                  <Option value="m">Minutes</Option>
                </Select>
              </Form.Item>
            </div>
          </div>
          {edit ? (
            <div className={styles['edit-cancel']}>
              <Button
                className={styles['edit-cancel__cancel-button']}
                type="link"
                onClick={() =>
                  dispatch(notificationActions.setEditNotification(false))
                }
              >
                Cancel Edit
              </Button>
              <Form.Item>
                <Button
                  className={styles['edit-cancel__update-button']}
                  icon={<SyncOutlined />}
                  loading={loading}
                  type="primary"
                  htmlType="submit"
                >
                  <span>Update</span>
                </Button>
              </Form.Item>
            </div>
          ) : (
            <div className={styles['publish-btn']}>
              <Form.Item>
                <Button
                  icon={<CheckOutlined />}
                  type="primary"
                  loading={loading}
                  htmlType="submit"
                >
                  <span>Publish Now</span>
                </Button>
              </Form.Item>
            </div>
          )}
        </div>
      </Form>
      <div className={styles['editor-preview-wrapper']}>
        <NotificationPreview data={previewData} />
      </div>
    </>
  );
};

export default FormWrapper;
