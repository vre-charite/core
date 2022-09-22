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
import { Result, Button, Layout } from 'antd';
import { withRouter } from 'react-router-dom';
import { BRANDING_PREFIX } from '../../config';
const { Content } = Layout;
function General404Page(props) {
  return (
    <Content style={{ marginTop: 50 }}>
      <Result
        status="404"
        style={{ height: '93vh' }}
        title="404"
        subTitle="Sorry, the page you visited does not exist."
        extra={
          <a  href={BRANDING_PREFIX}>
            <Button type="primary">Back Home</Button>
          </a>
        }
      />
    </Content>
  );
}

export default withRouter(General404Page);
