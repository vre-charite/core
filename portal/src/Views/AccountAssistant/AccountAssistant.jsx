import React from 'react';
import { Layout } from 'antd';
import { StandardLayout } from '../../Components/Layout';
import { accountAssistant as routes } from '../../Routes/index';
import { Switch, Route, useRouteMatch } from 'react-router-dom';

function Support(props) {
  const config = {
    observationVars: [],
    initFunc: () => {},
  };

  const match = useRouteMatch();
  return (
    <Layout style={{ minHeight: '100vh' }}>
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
    </Layout>
  );
}

export default Support;
