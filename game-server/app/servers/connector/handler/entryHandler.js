module.exports = function(app) {
    return new Handler(app);
};

var Handler = function(app) {
    this.app = app;
};

var handler = Handler.prototype;

handler.quit = function(msg, session, next) {
    var username = msg.username;
    var sessionService = self.app.get('sessionService');
    if(!session.uid&&sessionService.getByUid(username)){
        sessionService.kick(username);
    }
    next(null, {
        code:200
    });
}

/**
 * New client entry chat server.
 *
 * @param  {Object}   msg     request message
 * @param  {Object}   session current session object
 * @param  {Function} next    next stemp callback
 * @return {Void}
 */
handler.enter = function(msg, session, next) {
    var self = this;
    var channel = msg.channel;
    var username = msg.username;
    var sessionService = self.app.get('sessionService');
    if(!session.uid&&sessionService.getByUid(username)){
        sessionService.kick(username);
    }
    //第一次登陆
    if( ! sessionService.getByUid(username)) {
        session.bind(username);
        session.set('username', username);
        session.set('channel', [channel]);

        session.on('closed', onUserLeave.bind(null, self.app));
    }else{
        session.get('channel').push(channel);
    }



    session.pushAll(function(err) {
        if(err) {
            console.error('set rid for session service failed! error is : %j', err.stack);
        }
    });

    //put user into channel
    self.app.rpc.chat.chatRemote.add(channel, username, self.app.get('serverId'), channel, true, function(users){
        next(null, {
            code:200,
            users:users
        });
    });
};

/**
 * User log out handler
 *
 * @param {Object} app current application
 * @param {Object} session current session object
 *
 */
var onUserLeave = function(app, session) {
    if(!session || !session.uid) {
        return;
    }
    var channels = session.get('channel');
    for(var i=0;i<channels.length;i++){
        app.rpc.chat.chatRemote.kick(channels[i], session.uid, app.get('serverId'), channels[i], null);
    }

};