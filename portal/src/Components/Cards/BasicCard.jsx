import React, { Component } from "react";
import { Card, Button } from "antd";
import styles from "./index.module.scss";
import {
  FullscreenOutlined,
  DownloadOutlined,
  DragOutlined,
} from "@ant-design/icons";

export default class BasicCard extends Component {
  state = {
    export: false,
  };

  onExportClick = () => {
    this.setState({ export: !this.state.export });
  };

  onExpandClick = () => {
    const { handleExpand, content, title } = this.props;
    handleExpand(content("l", this.state.export, this.onExportClick), title);
  };

  render() {
    const { exportable, expandable, content, title, defaultSize } = this.props;

    return (
      <Card
        className={styles.basic}
        title={title}
        size="small"
        bordered="false"
        extra={
          <div>
            {expandable && (
              <Button type="link" onClick={this.onExpandClick}>
                <FullscreenOutlined style={{ position: "static" }} />
              </Button>
            )}
            {exportable && (
              <Button type="link" onClick={this.onExportClick}>
                <DownloadOutlined style={{ position: "static" }} />
              </Button>
            )}
            <Button
              type="link"
              className="dragarea"
              style={{ paddingRight: "0", paddingLeft: "0" }}
            >
              <DragOutlined style={{ position: "static", fontSize: "15px" }} />
            </Button>
          </div>
        }
      >
        {exportable
          ? content(defaultSize, this.state.export, this.onExportClick)
          : expandable
          ? content(defaultSize)
          : content}
      </Card>
    );
  }
}
