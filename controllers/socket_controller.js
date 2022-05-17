const debug = require('debug')('battleship-server:socket_controller');
let io = null; // socket.io server instance

module.exports = function(socket, _io) {
	// save a reference to the socket.io server instance
	io = _io;

	debug(`Someone joined`)

	// handle user disconnect
	// socket.on('disconnect', handleDisconnect); 

}