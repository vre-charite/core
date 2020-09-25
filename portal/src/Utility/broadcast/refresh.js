const { BroadcastChannel } = require('broadcast-channel');

const channel = new BroadcastChannel('refresh',{type:'localstorage'});

export default channel;