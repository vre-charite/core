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