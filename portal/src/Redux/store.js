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

import { createStore} from "redux";
import rootReducer from "./Reducers";
import { persistStore, persistReducer, createTransform } from 'redux-persist';
import storage from 'redux-persist/lib/storage' // defaults to localStorage for web
const setTransform = createTransform(null, (outboundState, key) => {
  return [...(outboundState.map(item => { if ((item.status === 'uploading') || (item.status === 'waiting')) { item['status'] = 'error'; } return item; }))]
}, { whitelist: ['uploadList',] })

const persistConfig = {
  key: 'root',
  storage,
  whitelist: [], //['username','isLogin'],
  transforms: [setTransform]
}

const persistedReducer = persistReducer(persistConfig, rootReducer)


const configureStore = () => {
  //const store = createStore(persistedReducer,  composeEnhancers(applyMiddleware(...middlewares)));
  const store = createStore(persistedReducer,
    window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__());
  const persistor = persistStore(store)
  if (process.env.NODE_ENV !== 'production') {
    if (module.hot) {
      module.hot.accept('./Reducers', () => {
        store.replaceReducer(rootReducer);
      });
    }
  }

  return { store, persistor };
};

const { store, persistor } = configureStore()

export { store, persistor };