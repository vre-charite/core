import React from 'react';
import { Result, Button, Layout } from 'antd';
import { withRouter } from 'react-router-dom';
const { Content } = Layout;
function Error404(props) {
  return (
    <Content>
      <Result
        status="404"
        style={{ height: '93vh' }}
        title="404"
        subTitle="Sorry, the page you visited does not exist."
        extra={
          <Button
            onClick={() => {
              props.history.push('/landing');
            }}
            type="primary"
          >
            Back Home
          </Button>
        }
      />
    </Content>
  );
}

export default withRouter(Error404);
