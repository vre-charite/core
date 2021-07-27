import React from "react";
import {
  Button,
  Form,
  Select,
  Collapse,
  Checkbox,
  Upload,
  Cascader,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";

const { Option } = Select;
const { Panel } = Collapse;

function LeftContent(props) {
  function onFinish() {
    console.log("finish");
  }
  return (
    <>
      <Form
        name="Filter"
        onFinish={onFinish}
        style={{ padding: "0px 10px 50px" }}
        layout="vertical"
      >
        <div style={{ padding: "0px 10px" }}>YOLO</div>
      </Form>
    </>
  );
}

export default LeftContent;
