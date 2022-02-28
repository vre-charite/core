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
