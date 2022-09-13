// Copyright 2022 Indoc Research
// 
// Licensed under the EUPL, Version 1.2 or – as soon they
// will be approved by the European Commission - subsequent
// versions of the EUPL (the "Licence");
// You may not use this work except in compliance with the
// Licence.
// You may obtain a copy of the Licence at:
// 
// https://joinup.ec.europa.eu/collection/eupl/eupl-text-eupl-12
// 
// Unless required by applicable law or agreed to in
// writing, software distributed under the Licence is
// distributed on an "AS IS" basis,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
// express or implied.
// See the Licence for the specific language governing
// permissions and limitations under the Licence.
// 

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
