const debug = require('debug')('battleship-server:socket_controller');
let io = null; // socket.io server instance

// Array of socket rooms
const rooms = [];
let currentRoom = null;
let numberOfRooms = 0;
let waitingPlayers = 0;

const handleDisconnect = function () {
  debug(`Client ${this.id} left`);
};

// When a user wants to enter queue
const handleJoinQueue = function (username, callback) {
  debug(`Player ${username} wants to join queue`);

  // If queue is empty, create a new room
  if (waitingPlayers === 0) {
    rooms.push({
      room_id: numberOfRooms++,
      players: [],
    });
  }

  // Find current room
  currentRoom = rooms[rooms.length - 1];

  // Join socket room
  this.join(currentRoom);

  // Push playername to player property in the current room
  currentRoom.players.push(username);

  // Increase amount of players waiting for game
  waitingPlayers++;

  // If romm is full, tell sockets in room to start their game
  if (currentRoom.players.length === 2) {
    const startingPlayer = currentRoom.players[Math.floor(Math.random() * 2)];
    debug(startingPlayer, ' should start');
    // Tell all players in room that game should start
    io.in(currentRoom).emit('game:start', currentRoom.players, startingPlayer);
    waitingPlayers = 0;
  }
};

// Function for when a player clicked a square
const handlePlayerClick = function (index) {
  debug('Player clicked on square', index);
  // Tell other player in room that opponent clicked on a square
  this.broadcast.to(currentRoom).emit('game:click', index);
};

// Function for when there is a result for if a click was a hit or not
const handleClickResult = function (result, index, shipSunk, gameOver) {
  // Tell other player in room that opponent clicked on a square
  /*  debug('this is the result:', result, 'and this is the index:', index); */
  debug('this is gameOver on server', gameOver);
  this.broadcast.to(currentRoom).emit('game:click-result', result, index, shipSunk, gameOver);
};

module.exports = function (socket, _io) {
  // save a reference to the socket.io server instance
  io = _io;

  debug(`Someone joined ${socket.id}`);

  // handle user disconnect
  socket.on('disconnect', handleDisconnect);
  // Handle when player wants to join a game
  socket.on('user:join-queue', handleJoinQueue);
  // Handle when a player clicked on opponent board
  socket.on('game:click', handlePlayerClick);
  // Handle when there is a result for if a click was a hit or not
  socket.on('game:click-result', handleClickResult);
};
