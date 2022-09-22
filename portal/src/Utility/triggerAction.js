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

import _ from 'lodash';
import { broadcastManager } from '../Service/broadcastManager';
import { namespace as serviceNamespace } from '../Service/namespace';

const actionType = 'touchmove';
const proxyActionType = 'keydown';

const debouncedBroadcastAction = _.debounce(() => {
    broadcastManager.postMessage('refresh', serviceNamespace.broadCast.ONACTION);
  }, 1000 * 5, { leading: true, trailing: false });

const broadcastAction = ()=>{
    document.dispatchEvent(new Event(actionType));
};

const keepAlive = ()=>{
    document.dispatchEvent(new Event(proxyActionType));
}


export {actionType,broadcastAction,keepAlive,debouncedBroadcastAction};