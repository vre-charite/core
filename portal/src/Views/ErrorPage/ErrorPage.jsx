import React, { useState, useEffect } from "react";
import { StandardLayout } from "../../Components/Layout";
import { errorPageRoutes as routes } from "../../Routes/index";
import { withRouter, Switch, Route, Redirect } from "react-router-dom";
import { getUsersOnDatasetAPI } from "../../APIs";
import { objectKeysToCamelCase } from "../../Utility";
import { connect } from "react-redux";
import _ from "lodash";
function ErrorPage(props) {
  const {
    match: { path, params },
    containersPermission,
  } = props;
  const [userListOnDataset, setUserListOnDataset] = useState(null);
  const config = {
    observationVars: [],
    initFunc: () => {},
  };
  return (
    <StandardLayout {...config} >
      <Switch>
        {routes.map((item) => (
          <Route
            exact={item.exact || false}
            path={path + item.path}
            key={item.path}
            render={() => <item.component />}
          ></Route>
        ))}
      </Switch>
    </StandardLayout>
  );
}

export default withRouter(ErrorPage);
