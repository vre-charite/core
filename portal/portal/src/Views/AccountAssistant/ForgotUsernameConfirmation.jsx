import React from 'react';
import { Link } from 'react-router-dom';
import { Card, Button, Layout, Result } from 'antd';

import styles from './index.module.scss';
import { BRANDING_PREFIX } from '../../config';
const { Content } = Layout;

function ActivateUser(props) {
  return (
    <Content className={'content'}>
      <div className={styles.container}>
        <Card>
          <Result
            status="success"
            title="Your request has been sent!"
            subTitle={
              <>
                An email with your username has been sent to your mailbox.{' '}
                <br />
                You can use this username to reset your password or login
                directly.
              </>
            }
            extra={[
              <Button type="primary" key="home">
                <a href={BRANDING_PREFIX}>Back to Home Page</a>
              </Button>,
            ]}
          />
        </Card>
      </div>
    </Content>
  );
}

export default ActivateUser;
