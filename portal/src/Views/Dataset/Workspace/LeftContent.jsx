import React from "react";
import {
  Form,
} from "antd";

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
