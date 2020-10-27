import React from 'react';
import { Link, withRouter } from 'react-router-dom';
import { Card, Button, Layout, Result } from 'antd';

import styles from './index.module.scss';

const { Content } = Layout;

function ActivateUser(props) {
  const { email } = props.location.state;
  return (
    <Content className={'content'}>
      <div className={styles.container}>
        <Card>
          <Result
            status="success"
            title="Your request is sent!"
            subTitle={
              <>
                An email has been sent to the mailbox {email}. <br />
                Please follow the instructions in the email to finish the
                password reset process.
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

export default withRouter(ActivateUser);
