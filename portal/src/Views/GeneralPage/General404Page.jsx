import React from 'react';
import { Result, Button, Layout } from 'antd';
import { withRouter } from 'react-router-dom';
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
          <a href="/vre">
            <Button type="primary">Back Home</Button>
          </a>
        }
      />
    </Content>
  );
}

export default withRouter(General404Page);