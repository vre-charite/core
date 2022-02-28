import React, { useEffect, useState } from 'react';
import {
  CloseOutlined,
  FullscreenOutlined,
  PauseOutlined,
} from '@ant-design/icons';
import { Button, Collapse, Typography, Modal } from 'antd';
import UserDetails from './UserDetails';
import UserProjectsTable from './UserProjectsTable';
import { getUserProjectListAPI } from '../../../../APIs';
import styles from '../index.module.scss';

const { Panel } = Collapse;
const { Title } = Typography;

function ScalableDetails(props) {
  const { close, width, record } = props;
  const [projectList, setProjectList] = useState(null);
  const [modalContent, setModalContent] = useState(null);
  const [modalTitle, setModalTitle] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    getUserProjectListAPI(record.name).then((res) => {
      const projectList = res.data.result;
      setProjectList(projectList);
    });
  }, [record.name]);

  function onCancel() {
    setVisible(false);
  }

  function openModal(element, title) {
    setVisible(true);
    setModalContent(element);
    setModalTitle(title);
  }
  
  return (
    <div
      style={{
        width: width,
        position: 'relative',
        minWidth: '180px',
        maxWidth: '700px',
      }}
    >
      <Button
        onMouseDown={props.mouseDown}
        type="link"
        style={{
          position: 'absolute',
          top: '50%',
          left: `-31px`,
          transform: 'translateY(-50%)',
          transition: 'none',
          cursor: 'ew-resize',
        }}
      >
        <PauseOutlined />
      </Button>
      <div style={{ position: 'relative' }}>
        <CloseOutlined
          onClick={close}
          style={{
            zIndex: '99',
            float: 'right',
            marginTop: '11px',
            marginRight: '15px',
            fontSize: '18px'
          }}
        />
        <Title level={4} style={{ lineHeight: '1.9' }}>
          Profile
        </Title>
      </div>
      <Collapse defaultActiveKey={['1', '2']}>
        <Panel
          header="User Details"
          key="1"
          extra={
            <Button
              type="link"
              onClick={(event) => {
                // If you don't want click extra trigger collapse, you can prevent this:
                openModal(<UserDetails record={record} />, 'User Details');
                event.stopPropagation();
              }}
              style={{ padding: 0, height: 'auto' }}
            >
              <FullscreenOutlined />
            </Button>
          }
        >
          <UserDetails record={record} />
        </Panel>
        <Panel
          className={styles.tablePanel}
          header="Projects"
          key="2"
          extra={
            <Button
              type="link"
              onClick={(event) => {
                // If you don't want click extra trigger collapse, you can prevent this:
                openModal(
                  <UserProjectsTable dataSource={projectList} />,
                  'Projects',
                );
                event.stopPropagation();
              }}
              style={{ padding: 0, height: 'auto' }}
            >
              <FullscreenOutlined />
            </Button>
          }
          style={{ position: 'relative' }}
        >
          {/* User Projects Table needs to know current user role! Because platform admin role needs to be passed in from here */}
          <UserProjectsTable
            dataSource={projectList}
            platformRole={record.role}
          />
        </Panel>
      </Collapse>
      <Modal
        visible={visible}
        onCancel={onCancel}
        title={modalTitle}
        width={800}
        footer={[
          <Button key="back" onClick={onCancel}>
            OK
          </Button>,
        ]}
      >
        {modalContent}
      </Modal>
    </div>
  );
}

export default ScalableDetails;
