module.exports = function(app) {
	return new ChatRemote(app);
};

var ChatRemote = function(app) {
	this.app = app;
	this.channelService = app.get('channelService');
};

/**
 * Add user into chat channel.
 *
 * @param {String} uid unique id for user
 * @param {String} sid server id
 * @param {String} name channel name
 * @param {boolean} flag channel parameter
 *
 */
ChatRemote.prototype.add = function(uid, sid, name, flag, cb) {
	var channel = this.channelService.getChannel(name, flag);
    var username=uid.split('*')[0];
    var clientType=uid.split('*')[1];


	if( !! channel) {
        channel.add(uid, sid);
        var param = {
            route: 'onAdd',
            uid:uid,
            clientType:clientType,
            channel:name,
            user: username
        };
        channel.pushMessage(param);
		var memberparam={
            route:'members',
            channel:name,
            users:this.get(name,flag)
        }
        channel.pushMessage(memberparam);
        this.channelService.pushMessageByUids(memberparam,[{uid:uid,sid:sid}]);
	}

	cb();
};

/**
 * Get user from chat channel.
 *
 * @param {Object} opts parameters for request
 * @param {String} name channel name
 * @param {boolean} flag channel parameter
 * @return {Array} users uids in channel
 *
 */
ChatRemote.prototype.get = function(name, flag) {
	var users = [];
	var channel = this.channelService.getChannel(name, flag);
	if( !! channel) {
		users = channel.getMembers();
	}
	return users;
};

/**
 * Kick user out chat channel.
 *
 * @param {String} uid unique id for user
 * @param {String} sid server id
 * @param {String} name channel name
 *
 */
ChatRemote.prototype.kick = function(uid, sid, name, cb) {
	var channel = this.channelService.getChannel(name, false);
	// leave channel
	if( !! channel) {
		channel.leave(uid, sid);
        var username=uid.split('*')[0];
        var clientType=uid.split('*')[1];
        var param = {
            route: 'onLeave',
            uid:uid,
            clientType:clientType,
            channel:name,
            user: username
        };
        channel.pushMessage(param);
	}

	cb();
};
