import React from 'react';
import { Link } from 'react-router-dom';
import { Card, Button, Layout, Result } from 'antd';

import styles from './index.module.scss';

const { Content } = Layout;

function ActivateUser(props) {
  return (
    <Content className={'content'}>
      <div className={styles.container}>
        <Card>
          <Result
            status="success"
            title="Your request is sent!"
            subTitle={
              <>
                An email with your username has been sent to your mailbox.{' '}
                <br />
                You can use this username to find your password or login
                directly.
              </>
            }
            extra={[
              <Button type="primary" key="home">
                <Link to="/">Back to home page</Link>
              </Button>,
            ]}
          />
        </Card>
      </div>
    </Content>
  );
}

export default ActivateUser;