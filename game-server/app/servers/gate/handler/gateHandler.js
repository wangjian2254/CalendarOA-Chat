var dispatcher = require('../../../util/dispatcher');

module.exports = function(app) {
	return new Handler(app);
};

var Handler = function(app) {
	this.app = app;
};

var handler = Handler.prototype;

/**
 * Gate handler that dispatch user to connectors.
 *
 * @param {Object} msg message from client
 * @param {Object} session
 * @param {Function} next next stemp callback
 *
 */
//handler.queryEntry = function(msg, session, next) {
//	if(!msg.appcode) {
//		next(null, {
//			code: 500
//		});
//		return;
//	}
//	// get all connectors
//	var connectors = this.app.getServersByType('connector');
//	if(!connectors || connectors.length === 0) {
//		next(null, {
//			code: 500
//		});
//		return;
//	}
//	// select connector
//	var res = dispatcher.dispatch(msg.appcode, connectors);
//	next(null, {
//		code: 200,
//		host: res.host,
//		port: res.clientPort
//	});
//};

handler.queryEntry = function(msg, session, next) {
    if(!msg.clienttype||msg.clienttype=='web'||msg.clienttype=='flash'||msg.clienttype=='flexair') {
        var connectors = this.app.getServersByType('webconnector');
        if(!connectors || connectors.length === 0) {
            next(null, {
                code: 500
            });
            return;
        }
        // select connector
        var res = dispatcher.dispatch(msg.username, connectors);
        next(null, {
            code: 200,
            host: res.host,
            port: res.clientPort
        });

    }else if(msg.clienttype||msg.clienttype=='iphone'||msg.clienttype=='android') {
        var connectors = this.app.getServersByType('phoneconnector');
        if(!connectors || connectors.length === 0) {
            next(null, {
                code: 500
            });
            return;
        }
        // select connector
        var res = dispatcher.dispatch(msg.username, connectors);
        next(null, {
            code: 200,
            host: res.host,
            port: res.clientPort
        });
    }
    // get all connectors

};
