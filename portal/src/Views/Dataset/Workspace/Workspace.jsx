import React, { Component } from "react";
import BasicLayout from "../../../Components/Layout/BasicLayout";
import LeftContent from "./LeftContent";
import ToolBar from "../Components/ToolBar";
import Guacamole from "guacamole-common-js";
import styles from "./index.module.scss";
import Fullscreen from "react-full-screen";
import { Select, Card, Layout, Typography, Row, Col } from "antd";
import { DownOutlined } from "@ant-design/icons";
import { RightOutlined, LeftOutlined } from "@ant-design/icons";
import LeftSider from "../../../Components/Layout/LeftSider";

const crypto = require("crypto");
const { Option } = Select;
const { Title } = Typography;
const { Content } = Layout;
class Workspace extends Component {
  constructor(props) {
    super(props);
    this.displayRef = React.createRef();
    this.guacaRef = React.createRef();
    this.state = {
      isFull: false,
      size: [1024, 768],
    };
  }

  generateUrl = (width = 1024, height = 768) => {
    const clientOptions = {
      cypher: "AES-256-CBC",
      key: "MySuperSecretKeyForParamsToken11",
    };

    const encrypt = (value) => {
      const iv = crypto.randomBytes(16);
      const cipher = crypto.createCipheriv(
        clientOptions.cypher,
        clientOptions.key,
        iv
      );

      let crypted = cipher.update(JSON.stringify(value), "utf8", "base64");
      crypted += cipher.final("base64");

      const data = {
        iv: iv.toString("base64"),
        value: crypted,
      };

      return new Buffer(JSON.stringify(data)).toString("base64");
    };

    const connection = {
      connection: {
        type: "rdp",
        settings: {
          hostname: "10.3.10.12",
          username: "guacadmin",
          password: "Trillian42!",
          "enable-drive": false,
          "create-drive-path": false,
          security: "any",
          "ignore-cert": true,
          "enable-wallpaper": true,
        },
      },
    };
    let token = encrypt(connection);
    //return `ws://localhost:8080/?token=${token}&width=${width}&height=${height}&dpi=1`;
    return `ws://10.3.9.240:8081/?token=${token}&width=${width}&height=${height}&dpi=1`;
  };

  parentOnClickHandler = () => {
    this.displayRef.current.focus();
  };

  componentDidMount() {
    this.setGuacamole();
  }

  goFull = () => {
    this.setState({ isFull: true });
  };

  sizeSelect = (value) => {
    this.setState(
      {
        size: value.split("*").map((item) => parseInt(item)),
      },
      this.setGuacamole
    );
  };

  setGuacamole = () => {
    this.guacaRef.current = new Guacamole.Client(
      new Guacamole.WebSocketTunnel(this.generateUrl(...this.state.size))
    );
    this.guacaRef.current.onerror = function (error) {
      alert(error);
    };
    this.guacaRef.current.connect();
    // Disconnect on close
    window.onunload = function () {
      this.guacaRef.current.disconnect();
    };
    this.displayRef.current.innerHTML = ``;
    this.displayRef.current.appendChild(
      this.guacaRef.current.getDisplay().getElement()
    );
    // Mouse
    var mouse = new Guacamole.Mouse(this.displayRef.current);
    mouse.onmousedown = mouse.onmouseup = mouse.onmousemove = (mouseState) => {
      this.guacaRef.current.sendMouseState(mouseState);
    };
    // Keyboard
    var keyboard = new Guacamole.Keyboard(this.displayRef.current);
    const fixKeys = (keysym) => {
      // 65508 - Right Ctrl
      // 65507 - Left Ctrl
      // somehow Right Ctrl is not sent, so send Left Ctrl instead
      if (keysym === 65508) return 65507;
      return keysym;
    };
    keyboard.onkeydown = (keysym) => {
      this.guacaRef.current.sendKeyEvent(1, fixKeys(keysym));
    };
    keyboard.onkeyup = (keysym) => {
      this.guacaRef.current.sendKeyEvent(0, fixKeys(keysym));
    };
  };
  toggle = () => {
    this.setState((preState) => ({
      collapsed: !preState.collapsed,
    }));
  };

  render() {
    const { collapsed } = this.state;
    return (
      <>
        <LeftSider collapsed={collapsed} title={"Workspace"}>
          <Row>
            <Col offset={2}>Size:</Col>
            <Col offset={2}>
              <Select
                defaultValue="1024*768"
                style={{ width: 120 }}
                onChange={this.sizeSelect}
              >
                <Option value="1024*768">1024*768</Option>
                <Option value="800*600">800*600</Option>
              </Select>
            </Col>
          </Row>
          <Row style={{marginTop:10}}>
            <Col offset={2}>Machine: </Col>
            <Col offset={2}>
              <Select
                defaultValue="Linux@10.2.3.123"
                style={{ width: 180 }}
                onChange={this.sizeSelect}
              >
                <Option value="Linux@10.2.3.123">Linux@10.2.3.123</Option>
                <Option disabled value="Windows@12.33.2.3">Windows@12.33.2.3</Option>
                <Option disabled value="Ubuntu@10.7.3.123">Ubuntu@10.7.3.123</Option>
              </Select>
            </Col>
          </Row>
        </LeftSider>
        <Content className={collapsed ? "content" : "contentOpen"}>
          {React.createElement(
            this.state.collapsed ? RightOutlined : LeftOutlined,
            {
              className: "toggle",
              onClick: this.toggle,
            }
          )}

          <Card style={{ marginBottom: "20px" }}>
            <Row>
              <Card
                style={{
                  margin: "40px",
                  height: "85%",
                  width: "90%",
                  cursor: "none",
                  minHeight: this.state.size[1],
                }}
                bodyStyle={{
                  height: "100%",
                }}
              >
                <Fullscreen
                  enabled={this.state.isFull}
                  onChange={(isFull) => this.setState({ isFull })}
                >
                  <div
                    ref={this.displayRef}
                    className={styles.guacaView}
                    style={{
                      width: this.state.size[0],
                      margin: "0 auto",
                    }}
                    onClick={this.parentOnClickHandler}
                    tabIndex="0"
                  ></div>
                </Fullscreen>
              </Card>
            </Row>
          </Card>
        </Content>
      </>
    );
  }
}

export default Workspace;
