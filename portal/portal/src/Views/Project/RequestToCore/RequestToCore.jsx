import React, { useState, useEffect } from 'react';
import NewRequestList from './NewRequestsList/NewRequestsList';
import CompletedRequestsList from './CompletedRequestsList/CompletedRequestsList';
import {
  Card,
  Button,
  Layout,
  Modal,
  Input,
  Form,
  message,
  Tooltip,
} from 'antd';
import { SmileOutlined } from '@ant-design/icons';
import moment from 'moment-timezone';
import styles from './RequestToCore.module.scss';
import Request from './Request';
import {
  listAllCopyRequests,
  requestPendingFilesAPI,
  requestCompleteAPI,
} from '../../../APIs';
import { useCurrentProject } from '../../../Utility';
import { useSelector, useDispatch } from 'react-redux';
import { request2CoreActions } from '../../../Redux/actions';
import CanvasPageHeader from '../Canvas/PageHeader/CanvasPageHeader';
import i18n from '../../../i18n';
const { Content } = Layout;
const { TextArea } = Input;
const RequestToCore = (props) => {
  const { reqList, status, pageNo, activeReq } = useSelector(
    (state) => state.request2Core,
  );
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [completeModalVisible, setCompleteModalVisible] = useState(false);
  const [btnLoading, setBtnLoading] = useState(false);
  const [pendingFiles, setPendingFiles] = useState(0);
  const [reviewNotes, setReviewNotes] = useState('');
  const [currentDataset] = useCurrentProject();
  const projectGeid = currentDataset?.globalEntityId;
  const permission = currentDataset?.permission;
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  async function resetList() {
    const res = await listAllCopyRequests(projectGeid, status, 0, 10);
    if (res.data.result) {
      dispatch(request2CoreActions.setReqList(res.data.result));
      dispatch(
        request2CoreActions.setPagination({
          pageNo: 0,
          pageSize: 10,
          total: res.data.total,
        }),
      );
      if (res.data.result[0]) {
        dispatch(request2CoreActions.setActiveReq(res.data.result[0]));
        localStorage.setItem(
          'requestToCoreTimeRecord',
          res.data.result[0].submittedAt,
        );
      } else {
        dispatch(request2CoreActions.setActiveReq(null));
      }
    }
  }
  useEffect(() => {
    resetList();
  }, [status]);
  const handleRadioChange = (e) => {
    const value = e.currentTarget.getAttribute('data-value');
    dispatch(request2CoreActions.setStatus(value));
  };
  const radio = (
    <div className={styles.radio}>
      <div className={styles.radio_options}>
        <div
          data-value="pending"
          className={`${styles.requests} ${
            status === 'pending' && styles.radio_option_backgroundColor
          }`}
          onClick={handleRadioChange}
        >
          New
        </div>
        <div
          data-value="complete"
          className={`${styles.completed} ${
            status === 'complete' && styles.radio_option_backgroundColor
          }`}
          onClick={handleRadioChange}
        >
          Completed
        </div>
      </div>
    </div>
  );

  const listDisplay = () => {
    switch (status) {
      case 'pending':
        return <NewRequestList reqList={reqList} />;
      case 'complete':
        return <CompletedRequestsList reqList={reqList} />;
      default:
        return null;
    }
  };

  const handleOnChange = (e) => {
    setReviewNotes(e.target.value);
  };

  const handleMarkAsRequest = async () => {
    try {
      setBtnLoading(true);
      const res = await requestPendingFilesAPI(
        activeReq.projectGeid,
        activeReq.id,
      );
      if (res.data.result.pendingCount > 0) {
        setPendingFiles(res.data.result.pendingCount);
        setReviewModalVisible(true);
      } else {
        setCompleteModalVisible(true);
      }
      setBtnLoading(false);
    } catch (error) {
      message.error(`${i18n.t('errormessages:markAsComplete.default.0')}`, 3);
      setBtnLoading(false);
    }
  };

  const handleCompleteRequest = async () => {
    const data = {
      projectGeid: activeReq.projectGeid,
      requestId: activeReq.id,
      status: 'complete',
      reviewNotes: reviewNotes,
    };
    try {
      setBtnLoading(true);
      const res = await requestCompleteAPI(data);
      setBtnLoading(false);
      if (res.data.code === 200) {
        setCompleteModalVisible(false);
      }
      resetList();
      form.resetFields(['notes']);
      setReviewNotes('');
      message.success(`${i18n.t('success:completeRequest.default.0')}`);
    } catch (error) {
      message.error(`${i18n.t('errormessages:completeRequest.default.0')}`);
      setBtnLoading(false);
    }
  };

  const handleOnClose = () => {
    setCompleteModalVisible(false);
    setBtnLoading(false);
    form.resetFields(['notes']);
    setReviewNotes('');
  };

  return (
    <Content className={'content'}>
      <CanvasPageHeader />
      <div className={styles.request_to_core_content}>
        <Card title="Copy Data to Core Requests">
          <div className={styles.radio_section}>{radio}</div>
          <div className={styles.request_content}>
            <div className={styles.left_content}>{listDisplay()}</div>
            <div className={styles.right_content}>
              {activeReq ? (
                <>
                  <div className={styles.right_content_header}>
                    <div className={styles.header_left_part}>
                      <p>
                        <b>Request Notes:</b>{' '}
                        <span style={{ wordBreak: 'break-all' }}>
                          {activeReq.note}
                        </span>
                      </p>
                      <p>
                        <b>Source:</b> {`Green Room/` + activeReq.sourcePath}
                      </p>
                      <p>
                        <b>Destination:</b>{' '}
                        {`Core/` + activeReq.destinationPath}
                      </p>
                      {status === 'complete' ? (
                        <p>
                          <b>Review Note:</b>{' '}
                          <span style={{ wordBreak: 'break-all' }}>
                            {activeReq.reviewNotes}
                          </span>
                        </p>
                      ) : null}
                    </div>
                    {status === 'complete' ? (
                      <div className={styles.completed_on}>
                        <p>Completed On</p>
                        <h4>
                          {activeReq.completedAt
                            ? moment(activeReq.completedAt).format(
                                'YYYY-MM-DD HH:mm:ss',
                              )
                            : 'N/A'}
                        </h4>
                      </div>
                    ) : null}
                    {status === 'pending' &&
                    permission &&
                    permission === 'admin' ? (
                      <Button
                        style={{ marginRight: 50 }}
                        type="primary"
                        loading={btnLoading}
                        onClick={() => {
                          handleMarkAsRequest();
                        }}
                      >
                        Close Request {'&'} Notify User
                      </Button>
                    ) : null}
                  </div>
                  <Request />
                </>
              ) : null}
            </div>
          </div>
        </Card>
      </div>
      <Modal
        title="Confirmation"
        width={412}
        visible={reviewModalVisible}
        centered={true}
        wrapClassName="global-modal-wrapper"
        onOk={() => {
          setReviewModalVisible(false);
        }}
        cancelButtonProps={{ style: { display: 'none' } }}
        onCancel={() => {
          setReviewModalVisible(false);
          setBtnLoading(false);
        }}
      >
        <p style={{ textAlign: 'center', margin: 0 }}>
          <b>{`${pendingFiles} file/files`}</b> are still under review.
          <br /> Please continue to review
        </p>
      </Modal>
      <Modal
        title={`Close Request & Notify User`}
        width={524}
        centered={true}
        visible={completeModalVisible}
        confirmLoading={btnLoading}
        wrapClassName="global-modal-wrapper"
        onOk={() => {
          handleCompleteRequest();
        }}
        cancelButtonProps={{ style: { display: 'none' } }}
        onCancel={() => handleOnClose()}
        okText="Confirm"
      >
        {activeReq ? (
          <div className={styles.complete_modal_content}>
            <p style={{ marginBottom: '20px' }}>
              You are about to close the request
              <br />{' '}
              <b style={{ marginLeft: '10px' }}>
                {activeReq.submittedBy.length > 20 ? (
                  <Tooltip
                    title={activeReq.submittedBy}
                  >{`${activeReq.submittedBy.slice(0, 20)}...`}</Tooltip>
                ) : (
                  activeReq.submittedBy
                )}
              </b>{' '}
              / {moment(activeReq.submittedAt).format('YYYY-MM-DD HH:mm:ss')}
            </p>
            <p className={styles.complete_note}>
              1. Please ensure you have assigned an approval/denial status for
              all the files in this request.
            </p>
            <p className={styles.complete_note}>
              2. Add Review notes to the requester (optional).
            </p>
            <p className={styles.complete_note}>
              3. Click Confirm to close the request and notify the requester by
              email.
            </p>
            <div className={styles.review_note_section}>
              <p>Review notes</p>
              <Form form={form}>
                <Form.Item name="notes">
                  <TextArea maxLength={250} onChange={handleOnChange} />
                </Form.Item>
              </Form>
              <span className={styles.review_note}>{`${
                reviewNotes.length ? reviewNotes.length : 0
              }/250`}</span>
            </div>
          </div>
        ) : null}
      </Modal>
    </Content>
  );
};

export default RequestToCore;
