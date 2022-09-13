// Copyright 2022 Indoc Research
// 
// Licensed under the EUPL, Version 1.2 or – as soon they
// will be approved by the European Commission - subsequent
// versions of the EUPL (the "Licence");
// You may not use this work except in compliance with the
// Licence.
// You may obtain a copy of the Licence at:
// 
// https://joinup.ec.europa.eu/collection/eupl/eupl-text-eupl-12
// 
// Unless required by applicable law or agreed to in
// writing, software distributed under the Licence is
// distributed on an "AS IS" basis,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
// express or implied.
// See the Licence for the specific language governing
// permissions and limitations under the Licence.
// 

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
