import React from 'react';
import { Link, withRouter } from 'react-router-dom';
import { Card, Button, Layout, Result } from 'antd';
import styles from './index.module.scss';
import { BRANDING_PREFIX } from '../../config';

const { Content } = Layout;

function ActivateUser(props) {
  const { email } = props.location.state;
  return (
    <Content className={'content'}>
      <div className={styles.container}>
        <Card>
          <Result
            status="success"
            title="Your request has been sent!"
            subTitle={
              <>
                An email has been sent to the mailbox {email}. <br />
                Please follow the instructions in the email to finish the
                password reset process.
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

export default withRouter(ActivateUser);
