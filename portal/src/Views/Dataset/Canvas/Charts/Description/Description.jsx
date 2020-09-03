import React, { useState } from "react";
import { Typography } from "antd";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
const { Title } = Typography;
function Description(props) {
  const {
    containersPermission,
    match: {
      params: { datasetId },
    },
    content,
  } = props;
  const currentContainer =
    containersPermission &&
    containersPermission.find((ele) => {
      return parseInt(ele.container_id) === parseInt(datasetId);
    });
  return (
    <>
      <Title level={3}>
        {currentContainer ? (
          <>{currentContainer.container_name} </>
        ) : (
          "Not Available"
        )}
      </Title>
      <p>{content} </p>
    </>
  );
}

export default connect((state) => ({
  containersPermission: state.containersPermission,
}))(withRouter(Description));
