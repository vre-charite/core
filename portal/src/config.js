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

const BRANDING_PREFIX = process.env.REACT_APP_BRANDING_PATH || '';
const PORTAL_PREFIX = process.env.REACT_APP_PORTAL_PATH || '';
const DOWNLOAD_PREFIX = process.env.REACT_APP_DOWNLOAD_URL || ''; // use as PORTAL_PREFIX + DOWNLOAD_PREFIX
const DOWNLOAD_PREFIX_V1 = process.env.REACT_APP_DOWNLOAD_URL_V1 || '';
const KEYCLOAK_REALM = process.env.REACT_APP_KEYCLOAK_REALM;
const DEFAULT_AUTH_URL = process.env.REACT_APP_DEFAULT_AUTH_URL || '';
const API_PATH = process.env.REACT_APP_API_PATH || '';
const UPLOAD_URL = process.env.REACT_APP_UPLOAD_URL || '';
const PLATFORM = process.env.REACT_APP_PLATFORM || '';
const DOMAIN_DEV = process.env.REACT_APP_DOMAIN_DEV || '';
const DOMAIN_STAGING = process.env.REACT_APP_DOMAIN_STAGING || '';
const DOMAIN_PROD = process.env.REACT_APP_DOMAIN_PROD || '';
const SUPPORT_EMAIL = process.env.REACT_APP_SUPPORT_EMAIL || '';
const PROXY_ROUTE = process.env.REACT_APP_PROXY_ROUTE || '';
const XWIKI = process.env.REACT_APP_XWIKI || '';
const ORGANIZATION_PORTAL_DOMAIN =
  process.env.REACT_APP_ORGANIZATION_PORTAL_DOMAIN;
const PLATFORM_INTRODUCTION_URL =
  process.env.REACT_APP_PLATFORM_INTRODUCTION_URL;
const ORGANIZATION_DOMAIN = process.env.REACT_APP_ORGANIZATION_DOMAIN;
const DcmSpaceID = process.env.REACT_APP_DcmSpaceID;
const dcmProjectCode = process.env.REACT_APP_dcmProjectCode;

if (!KEYCLOAK_REALM) throw new Error(`keycloak realm is empty`);

module.exports = {
  BRANDING_PREFIX,
  PORTAL_PREFIX,
  DOWNLOAD_PREFIX,
  DOWNLOAD_PREFIX_V1,
  KEYCLOAK_REALM,
  DEFAULT_AUTH_URL,
  API_PATH,
  UPLOAD_URL,
  PLATFORM,
  DOMAIN_DEV,
  DOMAIN_STAGING,
  DOMAIN_PROD,
  SUPPORT_EMAIL,
  PROXY_ROUTE,
  XWIKI,
  ORGANIZATION_PORTAL_DOMAIN,
  PLATFORM_INTRODUCTION_URL,
  ORGANIZATION_DOMAIN,
  DcmSpaceID,
  dcmProjectCode,
};
