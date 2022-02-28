import React, { Component } from "react";
import { Layout } from "antd";
import styles from "./index.module.scss";

const { Sider } = Layout;

export default class LeftSider extends Component {
  render() {
    return (
      <Sider
        collapsed={true}
        reverseArrow={true}
        trigger={null}
        className={styles.left_sider}
      >
        {this.props.children}
      </Sider>
    );
  }
}
