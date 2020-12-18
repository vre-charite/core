import _ from 'lodash';
import { broadcastManager } from '../Service/broadcastManager';
import { namespace as serviceNamespace } from '../Service/namespace';

const actionType = 'touchmove';
const uploadProxyActionType = 'keydown';

const debouncedBroadcastAction = _.debounce(() => {
    broadcastManager.postMessage('refresh', serviceNamespace.broadCast.ONACTION);
  }, 1000 * 5, { leading: true, trailing: false });

const broadcastAction = ()=>{
    document.dispatchEvent(new Event(actionType));
};

const uploadAction = ()=>{
    document.dispatchEvent(new Event(uploadProxyActionType));
}


export {actionType,broadcastAction,uploadAction,debouncedBroadcastAction};