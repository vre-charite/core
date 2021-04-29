import Keycloak from 'keycloak-js'

const getUrl = (environment) => {
  switch (environment) {
    case 'local': {
      return "http://10.3.7.220/vre/auth/"; // the local will also connect the dev keycloak
    }
    case 'staging': {
      return "https://vre-staging.indocresearch.org/vre/auth"
    }
    default: {
      return "http://10.3.7.220/vre/auth/";
    }
  }
}

const keycloakConfig = {
  /*   "realm": "vre",
    "url": "http://10.3.7.220/vre/auth/",
    "ssl-required": "external",
    "resource": "react-app",
    "public-client": true,
    "confidential-port": 0,
    clientId:'react-app' */
  "realm": "vre",
  "url": process.env.NODE_ENV === 'development' ? getUrl(process.env["REACT_APP_BASE_URL"]) : "/vre/auth/",
  "ssl-required": "external",
  "resource": "react-app",
  "public-client": true,
  "verify-token-audience": true,
  "use-resource-role-mappings": true,
  "confidential-port": 0,
  clientId: 'react-app'
}



const keycloak = new Keycloak(keycloakConfig);
export { keycloak };