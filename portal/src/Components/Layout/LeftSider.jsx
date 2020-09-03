import React, { Component } from "react";
import { Layout } from "antd";
import styles from "./index.module.scss";

const { Sider } = Layout;

export default class QueryCard extends Component {
  render() {
    const { collapsed, title } = this.props;

    return (
      <Sider
        trigger={null}
        collapsed={collapsed}
        collapsedWidth="0"
        zeroWidthTriggerStyle={{
          backgroundColor: "white",
          right: "-23px",
        }}
        className={styles.sider}
        width={400}
        theme="light"
      >
        {title && <p className={styles["left-sider"]}>{title}</p>}

        {this.props.children}
      </Sider>
    );
  }
}
