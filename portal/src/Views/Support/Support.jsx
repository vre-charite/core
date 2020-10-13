import React from 'react';
import { StandardLayout } from '../../Components/Layout';
import { contactUsRoutes as routes } from '../../Routes/index';
import { Switch, Route, useRouteMatch } from 'react-router-dom';

function Support(props) {
  const config = {
    observationVars: [],
    initFunc: () => {},
  };

  const match = useRouteMatch();

  return (
    <StandardLayout {...config}>
      <Switch>
        {routes.map((item) => (
          <Route
            exact={item.exact || false}
            path={match.url + item.path}
            key={item.path}
            render={(props) => <item.component />}
          ></Route>
        ))}
      </Switch>
    </StandardLayout>
  );
}

export default Support;
