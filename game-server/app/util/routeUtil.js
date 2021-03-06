var exp = module.exports;
var dispatcher = require('./dispatcher');

exp.chat = function(channelid, msg, app, cb) {
	var chatServers = app.getServersByType('chat');

	if(!chatServers || chatServers.length === 0) {
		cb(new Error('can not find chat servers.'));
		return;
	}

    console.log(channelid);
    console.log(msg);
	var res = dispatcher.dispatch(channelid, chatServers);

	cb(null, res.id);
};