const { BroadcastChannel } = require('broadcast-channel');

const channel = new BroadcastChannel('login',{type:'localstorage'});

export default channel;