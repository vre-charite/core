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

import React from 'react';
import { Layout } from 'antd';
import { accountAssistant as routes } from '../../Routes/index';
import { Switch, Route, useRouteMatch } from 'react-router-dom';

function Support(props) {

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
