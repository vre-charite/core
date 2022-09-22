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

const { createProxyMiddleware } = require('http-proxy-middleware');
const {
  DOMAIN_DEV,
  DOMAIN_STAGING,
  API_PATH,
  PROXY_ROUTE,
} = require('./config');

module.exports = function (app) {
  const configs = getConfig(process.env['REACT_APP_BASE_URL']);
  configs.forEach((config) => {
    app.use(config.route, createProxyMiddleware(config.options));
  });
};

function getConfig(environment) {
  //const isLocal = process.env["REACT_APP_BASE_URL"];
  switch (environment) {
    case 'local': {
      const routeBff = API_PATH;
      const optionsBff = {
        target: 'http://localhost:5000',
        pathRewrite: {
          [`^${API_PATH}/`]: '',
        },
      };
      const routeDownload = API_PATH + '/download';
      const optionsDownload = {
        target: 'http://' + DOMAIN_DEV,
      };
      const routeDataops = API_PATH + '/dataops';
      const optionsDataops = {
        target: 'http://' + DOMAIN_DEV,
      };
      const route = PROXY_ROUTE;
      const options = {
        target: 'http://' + DOMAIN_DEV,
      };
      return [
        { route: routeDataops, options: optionsDataops },
        { route: routeDownload, options: optionsDownload },
        { route: routeBff, options: optionsBff },
        { route, options },
      ];
    }
    case 'staging': {
      const route = PROXY_ROUTE;
      const options = {
        target: 'https://' + DOMAIN_STAGING,
        changeOrigin: true,
      };
      return [{ route, options }];
    }
    default: {
      const route = PROXY_ROUTE;
      const options = {
        target: 'http://' + DOMAIN_DEV,
      };
      return [{ route, options }];
    }
  }
}
