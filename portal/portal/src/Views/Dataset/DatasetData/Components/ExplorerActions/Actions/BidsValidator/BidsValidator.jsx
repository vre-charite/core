import React, { useState, useEffect } from 'react';
import {
  Card,
  Divider,
  Button,
  Popover,
  Collapse,
  message,
  Row,
  Col,
} from 'antd';
import moment from 'moment';
import {
  CloseCircleFilled,
  WarningFilled,
  WarningOutlined,
  CheckCircleTwoTone,
  CloseOutlined,
} from '@ant-design/icons';
import { io } from 'socket.io-client';
import { useSelector, useDispatch } from 'react-redux';
import ValidateButton from './ValidateButton';
import { datasetInfoCreators } from '../../../../../../../Redux/actions';
import { preValidateBids } from '../../../../../../../APIs';
import { getFileSize } from '../../../../../../../Utility';
import {
  DOMAIN_DEV,
  DOMAIN_PROD,
  DOMAIN_STAGING,
} from '../../../../../../../config';

const { Panel } = Collapse;

export default function BidsValidator(props) {
  const dispatch = useDispatch();

  const basicInfo = useSelector((state) => state.datasetInfo.basicInfo);

  const [visible, setVisible] = useState(false);

  let socketIoUrl = '';
  switch (process.env['REACT_APP_ENV']) {
    case 'dev':
      socketIoUrl = 'ws://' + DOMAIN_DEV;
      break;
    case 'staging':
      socketIoUrl = 'wss://' + DOMAIN_STAGING;
      break;
    case 'production':
      socketIoUrl = 'wss://' + DOMAIN_PROD;
      break;
    default:
      socketIoUrl = 'ws://' + DOMAIN_DEV;
      break;
  }

  useEffect(() => {
    const socket = io(`${socketIoUrl}/${basicInfo.geid}`);
    socket.on('BIDS_VALIDATE_NOTIFICATION', (data) => {
      console.log(data);
      if (data.payload.dataset === basicInfo.geid) {
        if (data.payload.status === 'success') {
          basicInfo['bidsResult'] = data.payload.payload;
          basicInfo['bidsLoading'] = false;
          basicInfo['bidsUpdatedTime'] = new Date(
            data.payload.update_timestamp * 1000,
          ).toUTCString();
          dispatch(datasetInfoCreators.setBasicInfo(basicInfo));
        } else {
          basicInfo['bidsLoading'] = false;
          dispatch(datasetInfoCreators.setBasicInfo(basicInfo));
          message.error(data.payload.error_msg);
        }
      }
    });
  }, []);
  const issues = basicInfo.bidsResult && basicInfo.bidsResult.issues;
  const warnings = issues && issues.warnings;
  const errors = issues && issues.errors;
  const summary = basicInfo.bidsResult && basicInfo.bidsResult.summary;

  const closeMessagePanel = () => {
    setVisible(false);
  };

  let summaryInfo = null;

  if (summary) {
    const tasks = summary.tasks;
    const taskItems = tasks.map((item) => <li>{item}</li>);
    const modalities = summary.modalities;
    const modalityItems = modalities.map((item) => <li>{item}</li>);

    summaryInfo = (
      <div style={{ width: '100%', margin: 'auto' }}>
        <Row gutter={[16, 24]}>
          <Col span={6}>
            <b style={{ marginLeft: 10 }}>Summary</b>
            <ul style={{ listStyleType: 'square' }}>
              <li>
                {summary.totalFiles} Files, {getFileSize(summary.size)}{' '}
              </li>
              <li>
                {summary.subjects.length > 0
                  ? `${summary.subjects.length} - Subjects`
                  : '1 - Subject'}
              </li>
              <li>
                {summary.sessions.length > 0
                  ? `${summary.sessions.length} - Session`
                  : '1 - Session'}
              </li>
            </ul>
          </Col>
          <Col span={10}>
            <b>Available Tasks</b>
            <ul style={{ listStyleType: 'square' }}>{taskItems}</ul>
          </Col>
          <Col span={8}>
            <b>Available Modalities</b>
            <ul style={{ listStyleType: 'square' }}>{modalityItems}</ul>
          </Col>
        </Row>
      </div>
    );
  }

  let summaryMessage = (
    <div>
      <span style={{ marginLeft: 20 }}>
        {' '}
        Validation in progress, this might take few minutes.
      </span>
    </div>
  );

  if (warnings && errors && errors.length === 0 && errors.length === 0) {
    summaryMessage = (
      <div>
        <div style={{ margin: '-10px 20px 0px 20px' }}>
          <CheckCircleTwoTone twoToneColor="#52c41a" />
          <span style={{ color: 'green', marginLeft: 5 }}>Validated</span>
        </div>
        <Divider style={{ marginTop: 10, marginBottom: 10 }} />
        <span style={{ marginLeft: 20 }}> No issues found.</span>
      </div>
    );
  }

  if (warnings && warnings.length) {
    summaryMessage = (
      <div>
        <div style={{ margin: '-10px 20px 0px 20px' }}>
          <CheckCircleTwoTone twoToneColor="#52c41a" />
          <span style={{ color: 'green', marginLeft: 5 }}>Validated</span>
          <WarningOutlined style={{ color: 'orange', marginLeft: 20 }} />
          <span style={{ color: 'orange', marginLeft: 5 }}>
            {warnings.length} Warnings
          </span>
        </div>
        <Divider style={{ marginTop: 10, marginBottom: 10 }} />
        {summaryInfo}
        {summaryInfo && <Divider style={{ margin: '10px 0' }} />}
        <b style={{ marginLeft: 20, display: 'block', fontSize: 15 }}>
          {' '}
          We found {warnings.length} Warnings in your dataset.{' '}
        </b>
        <span style={{ marginLeft: 20, display: 'block' }}>
          You are not required to fix warnings, but doing so will make your
          dataset more BIDS compliant.
        </span>
        <span style={{ marginLeft: 20, display: 'block' }}>
          Last verified time:{' '}
          {moment(basicInfo.bidsUpdatedTime).format('YYYY-MM-DD HH:mm')}
        </span>
      </div>
    );
  }

  if (errors && errors.length) {
    summaryMessage = (
      <div>
        <div style={{ margin: '-10px 20px 0px 20px' }}>
          <CloseCircleFilled style={{ color: 'red' }} />
          <span style={{ color: 'red', marginLeft: 5 }}>Not Validated</span>
          <WarningFilled style={{ color: 'red', marginLeft: 20 }} />
          <span style={{ color: 'red', marginLeft: 5 }}>
            {errors.length} Errors
          </span>
        </div>
        <Divider style={{ marginTop: 10, marginBottom: 10 }} />
        {summaryInfo}
        {summaryInfo && <Divider style={{ marginTop: 10, marginBottom: 10 }} />}
        <b
          style={{
            marginLeft: 20,
            display: 'block',
            fontSize: 15,
            mariginTop: 10,
          }}
        >
          {' '}
          We found {errors.length} Errors in your dataset.
        </b>
        <span style={{ marginLeft: 20, display: 'block' }}>
          Last validated time:{' '}
          {moment(basicInfo.bidsUpdatedTime).format('YYYY-MM-DD HH:mm')}
        </span>
      </div>
    );
  }

  let warningsPanel = null;
  if (warnings && warnings.length) {
    let count = 0;
    const warningDetails = [];

    warnings.forEach((warning, index) => {
      count += warning.files.length;

      const filesPanel = [];

      warning.files.forEach((file, index) => {
        if (file.file) {
          filesPanel.push(
            <p>
              <p>
                <b style={{ fontSize: 15 }}>{file.file.name}</b>
                {file.file.stats && (
                  <span style={{ float: 'right' }}>
                    {getFileSize(file.file.stats.size)}
                  </span>
                )}
              </p>
              <p>
                <b>Location:</b>
                <p>{file.file.relativePath}</p>
              </p>
              <p>
                <b>Reason:</b>
                <p>{file.reason}</p>
              </p>
            </p>,
          );
          if (index < warning.files.length - 1) filesPanel.push(<Divider />);
        } else {
          filesPanel.push(
            <p>
              <p>
                <b style={{ fontSize: 15 }}>{file.key}</b>
              </p>

              <p>
                <b>Reason:</b>
                <p>{file.reason}</p>
              </p>
            </p>,
          );
          if (index < warning.files.length - 1) filesPanel.push(<Divider />);
        }
      });

      warningDetails.push(
        <Panel
          showArrow={false}
          header={
            <b>
              [Code {warning.code}] {warning.key}
            </b>
          }
          extra={`${warning.files.length} ${
            warning.files.length > 1 ? 'files' : 'file'
          }`}
        >
          {filesPanel}
        </Panel>,
      );
    });

    warningsPanel = (
      <Panel
        header={
          <span style={{ color: '#8B6C25' }}>
            view {warnings.length} warnings in {count} files
          </span>
        }
        showArrow={false}
        style={{ backgroundColor: '#FFF1C8' }}
      >
        <Collapse style={{ width: '100%' }}>{warningDetails}</Collapse>
      </Panel>
    );
  }

  let errorsPanel = null;
  if (errors && errors.length) {
    let count = 0;
    const errorsDetails = [];

    errors.forEach((error, index) => {
      count += error.files.length;

      const filesPanel = [];

      error.files.forEach((file, index) => {
        if (file.file) {
          filesPanel.push(
            <p>
              <p>
                <b style={{ fontSize: 15 }}>{file.file.name}</b>
                {file.file.stats && (
                  <span style={{ float: 'right' }}>
                    {getFileSize(file.file.stats.size)}
                  </span>
                )}
              </p>
              <p>
                <b>Location:</b>
                <p>{file.file.relativePath}</p>
              </p>
              <p>
                <b>Reason:</b>
                <p>{file.reason}</p>
              </p>
            </p>,
          );
          if (index < error.files.length - 1) filesPanel.push(<Divider />);
        } else {
          filesPanel.push(
            <p>
              <p>
                <b style={{ fontSize: 15 }}>{file.key}</b>
              </p>

              <p>
                <b>Reason:</b>
                <p>{file.reason}</p>
              </p>
            </p>,
          );
          if (index < error.files.length - 1) filesPanel.push(<Divider />);
        }
      });

      errorsDetails.push(
        <Panel
          showArrow={false}
          header={
            <b>
              [Code {error.code}] {error.key}
            </b>
          }
          extra={`${error.files.length} ${
            error.files.length > 1 ? 'files' : 'file'
          }`}
        >
          {filesPanel}
        </Panel>,
      );
    });

    errorsPanel = (
      <Panel
        header={
          <span style={{ color: '#681A20' }}>
            view {errors.length} errors in {count} files
          </span>
        }
        showArrow={false}
        style={{ backgroundColor: '#F8D1D5' }}
      >
        <Collapse style={{ width: '100%' }}>{errorsDetails}</Collapse>
      </Panel>
    );
  }

  const BidsMessage = (
    <div style={{ width: 800, height: 600, overflowY: 'auto' }}>
      <div style={{ margin: '5px 20px 0px 20px' }}>
        <h4>Bids Validation</h4>
        <CloseOutlined
          style={{ float: 'right', marginTop: -25 }}
          onClick={() => closeMessagePanel()}
        />
      </div>

      <Divider style={{ marginTop: 0, marginBottom: 20 }} />

      {summaryMessage}

      <Collapse style={{ marginTop: 10, width: '100%' }}>
        {warnings && warnings.length && warningsPanel}
        {errors && errors.length && errorsPanel}
      </Collapse>
    </div>
  );

  const icons = [];

  if (errors && errors.length > 0) {
    icons.push(
      <CloseCircleFilled
        style={{ marginRight: 10, fontSize: 18, color: 'red' }}
      />,
    );
    icons.push(
      <WarningFilled style={{ marginRight: 10, fontSize: 18, color: 'red' }} />,
    );
  } else {
    basicInfo.bidsResult &&
      icons.push(
        <CheckCircleTwoTone
          twoToneColor="#52c41a"
          style={{ marginRight: 10, fontSize: 18 }}
        />,
      );
  }

  if (warnings && warnings.length > 0) {
    icons.push(
      <WarningOutlined
        style={{ marginRight: 10, fontSize: 18, color: 'orange' }}
      />,
    );
  }

  return (
    <div style={{ float: 'right' }}>
      <Popover
        trigger="click"
        placement="rightBottom"
        content={BidsMessage}
        visible={visible}
        onClick={() => setVisible(!visible)}
      >
        {icons}
      </Popover>
      <ValidateButton />
    </div>
  );
}
