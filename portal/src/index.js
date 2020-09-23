import React from "react";
import ReactDOM from "react-dom";
import { /* BrowserRouter as  */ Router } from "react-router-dom";
import { CookiesProvider } from "react-cookie";
import App from "./App";
import { Provider } from "react-redux";
import {store,persistor} from "./Redux/store";
import { PersistGate } from 'redux-persist/integration/react';
import {history} from './Routes'
import {logoutChannel,loginChannel} from './Utility'
//const { store, persistor } = configureStore();
logoutChannel.onmessage = msg => {
  console.log(msg, 'logoutChannel in index.js')
  //logout();
};
loginChannel.onmessage = (username)=>{
  console.log(username,'loginChannel in index.js')
}
console.log('no route')
ReactDOM.render(
  <CookiesProvider>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <Router /* basename={"/vre"} */ history={history} forceRefresh={false}>
         {/*  <UploadQueueContext.Provider> */}
            <App />
         {/*  </UploadQueueContext.Provider> */}
        </Router>
      </PersistGate>
    </Provider>
  </CookiesProvider>,
  document.getElementById("root")
);
