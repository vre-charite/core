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
