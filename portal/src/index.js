import React from 'react';
import ReactDOM from 'react-dom';
import { /* BrowserRouter as  */ Router } from 'react-router-dom';
import { CookiesProvider } from 'react-cookie';
import App from './App';
import { Provider } from 'react-redux';
import { store, persistor } from './Redux/store';
import { setIsLoginCreator, setIsKeycloakReady } from './Redux/actions';
import { PersistGate } from 'redux-persist/integration/react';
import { history } from './Routes';
import './i18n';
import { ReactKeycloakProvider as KeycloakProvider } from '@react-keycloak/web';
import { keycloak } from './Service/keycloak';
const { detect } = require('detect-browser');
const browser = detect();
const initOptions =
  browser?.name === 'safari' ? {} : { checkLoginIframe: false };

const onEvent = (event, error) => {
  switch (event) {
    case 'onReady': {
      store.dispatch(setIsLoginCreator(keycloak.authenticated));
      store.dispatch(setIsKeycloakReady(true));
      break;
    }
    case 'onAuthError': {
      break;
    }
    case "onAuthRefreshError":{
      console.error('onRefresh error');
      break;
    }
    default: {

    }
  }
};

ReactDOM.render(
  <KeycloakProvider
    onEvent={onEvent}
    initOptions={initOptions}
    autoRefreshToken={false}
    authClient={keycloak}
  >
    <CookiesProvider>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <Router
            /* basename={"/vre"} */ history={history}
            forceRefresh={false}
          >
            <App />
          </Router>
        </PersistGate>
      </Provider>
    </CookiesProvider>
  </KeycloakProvider>,
  document.getElementById('root'),
);


function Load(){
  
}