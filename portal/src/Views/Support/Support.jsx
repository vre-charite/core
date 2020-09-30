import React from 'react';
import { Card, Button, Typography, Collapse } from 'antd';
import { StandardLayout } from '../../Components/Layout';
import styles from './index.module.scss';

const { Title } = Typography;
const { Panel } = Collapse;

function Support(props) {
  const config = {
    observationVars: [],
    initFunc: () => {},
  };
  function callback(key) {
    console.log(key);
  }

  return (
    <StandardLayout {...config}>
      <div className={styles.wrapper}>
        <Title level={3}>VRE Support</Title>
        <Card title="VRE guides" style={{ marginBottom: '10px' }}>
          <p>
            Check this usage guide PDF to see how you can manage project and
            team with VRE platform.{' '}
          </p>
          <Button type="primary">
            <a href="/vre/files/GUIDE.pdf" download target="_self">
              {' '}
              Download Guides
            </a>
          </Button>
        </Card>
        <Card
          title="Frequently asked questions"
          style={{ marginBottom: '10px' }}
        >
          <Collapse defaultActiveKey={['1', '2', '3']} onChange={callback}>
            <Panel header="How to get access to the VRE platform?" key="1">
              <p>
                A user will get access to VRE platform by invitation. A user
                will gain access once been invited into a project by site admin
                or program admin and finishes the registartion process.
              </p>
              <p>
                For more information, please refer to{' '}
                <a href="#3">How to invite a user into a project?</a>
              </p>
            </Panel>
            <Panel header="How to get access to a project?" key="2">
              <p>
                A user can get access to a project by invitation from the admin
                of the project.
              </p>
              <p>
                {' '}
                Once logging in, a user will see the project list of projects
                that they are a memeber of, and the projects that’s visible too
                all the platform users. A user can view the project content and
                upload files to the project if he/she is a memeber of that
                project.{' '}
              </p>
              <p>
                If you are a project admin and would like to invite a user to
                your project, pleaser refer to{' '}
                <a href="#3">How to invite a user into a project?</a>
              </p>
            </Panel>
            <Panel header="How to invite a user into a project?" key="3" id="3">
              <p>
                As a project admin, you can add a user in the “teams” page of a
                project.
              </p>
              <ol>
                <li>
                  Go to teams page by click on the “Teams” icon on the right of
                  the project details page.{' '}
                </li>
                <li>Click on “Add User” button to add a user.</li>

                <li>
                  You will fill in the email of the user you would like to
                  invite in a popup modal, and select what role you would like
                  to assign to the user. Click “OK” to submit.{' '}
                </li>
                <li>
                  If the user already registered with this email on the
                  platform, you will see a prompt noting this, and the user will
                  get an email notification that he/she is added to the
                  platform.{' '}
                </li>
                <li>
                  If the user’s email is not regitered with VRE, the user will
                  get an email notification that guides he/she to finish the
                  registration process. After the registration, the user should
                  be able to log in with the credential.{' '}
                </li>
              </ol>
              <p>
                For more details and screenshots, please refer to the VRE Guides
                PDF.
              </p>
            </Panel>
          </Collapse>
        </Card>
        <Card title="Get in touch" style={{ marginBottom: '10px' }}>
          <p>
            If you cannot find an answer from the guides and FAQs, or need
            technical suport, let us know through email:{' '}
          </p>
          <Button type="primary">
            <a href="mailto:vre-support@charite.de?subject=[VRE Support]">
              Contact Us
            </a>
          </Button>
        </Card>
      </div>
    </StandardLayout>
  );
}

export default Support;
