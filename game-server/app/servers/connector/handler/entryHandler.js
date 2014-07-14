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
handler.addchannels = function(msg, session, next) {
    var self = this;
    var channels = msg.channels;
    var clientType = msg.clientType;
    var username = msg.username;
    var uid=username+"*"+clientType;
    var sessionService = self.app.get('sessionService');
    if(!session.uid&&sessionService.getByUid(uid)){
        sessionService.kick(uid);
    }
    //第一次登陆
    if( ! sessionService.getByUid(uid)) {
        session.bind(uid);
        session.set('username', username);
        session.set('channel', []);


        session.on('closed', onUserLeave.bind(null, self.app));
    }
    for (var i=0;i<channels.length;i++){
        session.get('channel').push(channels[i]);
        self.app.rpc.chat.chatRemote.add(channels[i], uid, self.app.get('serverId'), channels[i], true, null);
    }
    session.pushAll(function(err) {
        if(err) {
            console.error('set rid for session service failed! error is : %j', err.stack);
        }
    });
    next(null,{
        route:'addchannels',
        code:200
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