const dotenv = require('dotenv');
dotenv.config();

const PORTAL_PREFIX = process.env.REACT_APP_PORTAL_PATH;
const API_PATH = process.env.REACT_APP_API_PATH;
const STAGING_DOMAIN = process.env.REACT_APP_DOMAIN_STAGING;
const DOMAIN_DEV = process.env.REACT_APP_DOMAIN_DEV;

const devServerUrl = `http://${DOMAIN_DEV}${PORTAL_PREFIX}/`;
const devServerBaseUrl = `http://${DOMAIN_DEV}` + API_PATH;
const stagingUrl = `https://${STAGING_DOMAIN}${PORTAL_PREFIX}/`;
const stagingServerUrl = `https://${STAGING_DOMAIN}${API_PATH}`;

const localUrl = `http://localhost:3000${PORTAL_PREFIX}/`;
const baseUrl =
  process.env.REACT_APP_TEST_ENV === 'dev' ? devServerUrl : localUrl;
const serverUrl = devServerBaseUrl;

const mailHogHost = '10.3.7.106';
const mailHogPort = 8025;

module.exports = {
  localUrl,
  baseUrl,
  stagingUrl,
  stagingServerUrl,
  serverUrl,
  mailHogHost,
  mailHogPort
};
