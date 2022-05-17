const debug = require('debug')('battleship-server:socket_controller')
let io = null // socket.io server instance

// Array of socket rooms
const rooms = []
let numberOfRooms = 0
let waitingPlayers = 0

const handleDisconnect = function() {
    debug(`Client ${this.id} left`)
}

// When a user wants to enter queue
const handleJoinQueue = function(username, callback) {
    debug(`Player ${username} wants to join queue`)

    // If queue is empty, create a new room
    if (waitingPlayers === 0) {
        rooms.push( {
            room_id: numberOfRooms++,
            players: []
        } )
    }

    // Find current room
    const currentRoom = rooms[rooms.length - 1]

    // Join socket room
    this.join(currentRoom)

    // Push playername to player property in the current room
    currentRoom.players.push(username)

    // Increase amount of players waiting for game
    waitingPlayers++

    // If romm is full, tell sockets in room to start their game
    if (currentRoom.players.length === 2) {
        io.in(currentRoom).emit('game:start', currentRoom.players)
        waitingPlayers = 0
    }
}

module.exports = function(socket, _io) {
	// save a reference to the socket.io server instance
	io = _io;

	debug(`Someone joined ${socket.id}`)

	// handle user disconnect
	socket.on('disconnect', handleDisconnect)
    socket.on('user:join-queue', handleJoinQueue)

}