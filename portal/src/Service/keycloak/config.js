import Keycloak from 'keycloak-js'
const keycloakConfig = {
/*   "realm": "vre",
  "url": "http://10.3.7.220/vre/auth/",
  "ssl-required": "external",
  "resource": "react-app",
  "public-client": true,
  "confidential-port": 0,
  clientId:'react-app' */
  "realm": "vre",
  "url": process.env.NODE_ENV==='development'?"http://10.3.7.220/vre/auth/":"/vre/auth/",
  "ssl-required": "external",
  "resource": "react-app",
  "public-client": true,
  "verify-token-audience": true,
  "use-resource-role-mappings": true,
  "confidential-port": 0,
  clientId:'react-app'
}

const keycloak = new Keycloak(keycloakConfig);
export { keycloak };