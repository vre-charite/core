import React, { Component } from "react";
import { Layout } from "antd";
import { RightOutlined, LeftOutlined } from "@ant-design/icons";
import AppHeader from "./Header";
import LeftSider from "./LeftSider";
import RightSlider from "./RightSlider";

import styles from "./index.module.scss";

const { Content } = Layout;

export default class BasicLayout extends Component {
  constructor(props) {
    super(props);
    this.state = {
      collapsed: this.props.collapsed,
    };
  }

  toggle = () => {
    this.setState({
      collapsed: !this.state.collapsed,
    });
  };

  render() {
    const { collapsed } = this.state;
    const { leftContent, rightContent, leftTitle } = this.props;

    return (
      <>
        <Layout>
          <AppHeader />
          <Content>
            <Layout>
              <LeftSider collapsed={collapsed} title={leftTitle}>
                {leftContent}
              </LeftSider>
              <Content
                className={collapsed ? styles.content : styles.contentOpen}
              >
                {React.createElement(
                  this.state.collapsed ? RightOutlined : LeftOutlined,
                  {
                    className: "trigger " + styles.toggle,
                    onClick: this.toggle,
                  },
                )}
                {this.props.children}
              </Content>
              <RightSlider>{rightContent}</RightSlider>
            </Layout>
          </Content>
        </Layout>
      </>
    );
  }
}
