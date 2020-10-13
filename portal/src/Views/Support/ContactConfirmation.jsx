import React from 'react';
import { Link } from 'react-router-dom';
import { Card, Button, Result } from 'antd';
import styles from './index.module.scss';

function ContactUs() {
  return (
    <div className={styles.confirmationWrapper}>
      <Card title="Contact Us" style={{ marginBottom: '10px' }}>
        <Result
          status="success"
          title="Your request is sent!"
          subTitle={
            <>
              <p>
                Thank you for contacting us.
                <br />
                Your request will be reviewed by a member of the VRE support
                team and you will receive a reply shortly through the email
                address associated with your VRE user account.​
              </p>
            </>
          }
          extra={[
            <Button type="primary" key="console">
              <Link to="/support">Back to support Page</Link>
            </Button>,
          ]}
        />
      </Card>
    </div>
  );
}

export default ContactUs;
