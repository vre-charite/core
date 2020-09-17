const { detect } = require('detect-browser');
const { BroadcastChannel } = require('broadcast-channel');
const browser = detect();
const isSafari = browser.name==='safari';
let channel;
if (isSafari) {
    channel = new BroadcastChannel('logout', { type: 'localstorage' });

} else {
    channel = new BroadcastChannel('logout');

}


export default channel;