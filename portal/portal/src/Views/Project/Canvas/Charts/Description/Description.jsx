import React  from "react";
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
      return parseInt(ele.id) === parseInt(datasetId);
    });
  return (
    <>
      <Title level={3}>
        {currentContainer ? (
          <>{currentContainer.name} </>
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
