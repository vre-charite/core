const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
  const configs = getConfig(process.env["REACT_APP_BASE_URL"]);
  configs.forEach(config => {
    app.use(
      config.route,
      createProxyMiddleware(config.options)
    );
  })

};

function getConfig(environment) {
  //const isLocal = process.env["REACT_APP_BASE_URL"];
  switch (environment) {
    case 'local': {
      const routeBff = '/vre/api/vre/portal';
      const optionsBff = {
        target: 'http://localhost:5000', pathRewrite: {
          '^/vre/api/vre/portal/': ""
        }
      }
      const routeDownload = '/vre/api/vre/portal/download';
      const optionsDownload = {
        target: 'http://10.3.7.220'
      }
      const routeDataops = '/vre/api/vre/portal/dataops';
      const optionsDataops = {
        target: 'http://10.3.7.220'
      }
      const route = '/vre/api';
      const options = {
        target: 'http://10.3.7.220'
      }
      return [{ route: routeDataops, options: optionsDataops }, { route: routeDownload, options: optionsDownload }, { route: routeBff, options: optionsBff }, { route, options }]
    } 
    case 'staging':{
      const route = '/vre/api';
      const options = {
        target: 'https://vre-staging.indocresearch.org',
        changeOrigin: true
        
      }
      return [{ route, options }]
    }
    default: {
      const route = '/vre/api';
      const options = {
        target: 'http://10.3.7.220'
      }
      return [{ route, options }]
    }
  }
}
