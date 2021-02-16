import React from 'react';
import { Card, Button, Typography, Breadcrumb } from 'antd';
import { Link } from 'react-router-dom';
import styles from './index.module.scss';
import SupportCollapse from '../../Components/Tools/SupportCollapse';

const { Title } = Typography;

function SupportContent() {
  return (
    <>
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <Breadcrumb separator="">
            <Breadcrumb.Item className={styles.white}>
              <Link to="/support" className={styles.white}>
                Support
              </Link>
            </Breadcrumb.Item>
          </Breadcrumb>
          <Title level={2} className={styles.title}>
            Need help?
          </Title>
          <p>
            You can find necessary resources on how to use VRE platform on this
            page.{' '}
          </p>
        </div>
      </section>
      <div className={styles.wrapper}>
        <Card title="User Guide​" style={{ marginBottom: '10px' }}>
          <p>
            Download the User Guide (pdf) to learn more about the VRE platform
            services, tools and workflows.​{' '}
          </p>
          <Button type="primary">
            <a
              href="/vre/files/VRE User Manual Release 1.0.0 2021-02-12.pdf"
              download
              target="_self"
            >
              {' '}
              Download Guide
            </a>
          </Button>
        </Card>
        <Card
          title="Frequently asked questions"
          style={{ marginBottom: '10px' }}
        >
          <SupportCollapse />
        </Card>
        <Card title="Get in touch" style={{ marginBottom: '10px' }}>
          <p>
            Still need help? Contact the VRE Support Team for additional help
            with platform tools and services, to report a bug, or other general
            questions.​
          </p>
          <Button type="primary">
            {/* <a href="mailto:vre-support@charite.de?subject=[VRE Support]"> */}
            <Link to="/support/contact-us">Contact Us</Link>
            {/* </a> */}
          </Button>
        </Card>
      </div>
    </>
  );
}

export default SupportContent;
