import React from 'react';
import { Layout } from 'antd';

const { Sider } = Layout;

export default class RightSlider extends React.Component {
  render() {
    return (
      <Sider
        collapsed={true}
        reverseArrow={true}
        trigger={null}
        style={{ zIndex: '9', float: 'right', backgroundColor: '#003262' }}
      >
        {this.props.children}
      </Sider>
    );
  }
}
