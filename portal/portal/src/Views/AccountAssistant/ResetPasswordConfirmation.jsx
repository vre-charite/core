import React from 'react';
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
            title="Your password is updated successfully!"
            subTitle={<>You can now login with the new password.</>}
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
