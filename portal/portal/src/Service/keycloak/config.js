import Keycloak from 'keycloak-js';
import {
  DEFAULT_AUTH_URL,
  DOMAIN_STAGING,
  KEYCLOAK_REALM,
  DOMAIN_DEV,
} from '../../config';

const getUrl = (environment) => {
  switch (environment) {
    case 'local': {
      return `http://${DOMAIN_DEV}${DEFAULT_AUTH_URL}/`; // the local will also connect the dev keycloak
    }
    case 'staging': {
      return `https://${DOMAIN_STAGING}${DEFAULT_AUTH_URL}`;
    }
    default: {
      return `http://${DOMAIN_DEV}${DEFAULT_AUTH_URL}`;
    }
  }
};

const keycloakConfig = {
  realm: KEYCLOAK_REALM,
  url:
    process.env.NODE_ENV === 'development'
      ? getUrl(process.env['REACT_APP_BASE_URL'])
      : DEFAULT_AUTH_URL + '/',
  'ssl-required': 'external',
  resource: 'react-app',
  'public-client': true,
  'verify-token-audience': true,
  'use-resource-role-mappings': true,
  'confidential-port': 0,
  clientId: 'react-app',
};

const keycloak = new Keycloak(keycloakConfig);
export { keycloak };
