const fs = require('fs');
const express = require('express');
const app = express();
const server = require('http').createServer(app);
const { Server } = require('socket.io');
const io = new Server(server);

const Scopa = require('./Scopa');

// answering / get requests with login.html
app.get('/', (_req, res) => {
  res.sendFile(__dirname + '/public/login.html');
});
// answering /game get requests with game.html
app.get('/game', (req, res) => {
  if (rooms.find((room) => room.name === req.query.roomName)) {
    res.sendFile(__dirname + '/public/game.html');
  }
  else {
    res.redirect('/');
  }
});

// making public folder available, contains html, scripts, css, images
app.use(express.static(__dirname + '/public/'));
// making chessboardjs files available
app.use(
  express.static(__dirname + '/node_modules/phaser/dist/'),
);

// read directory with cards and create array of cards
const cards = fs
  .readdirSync('./public/assets/cards')
  .filter((file) => file.endsWith('.png'))
  .map((file) => file.replace('.png', ''))
  .filter((file) => ['clubs', 'diamonds', 'hearts', 'spades'].some((suit) => file.includes(suit)));

const rooms = [];

function updateMembers(game, spectators) {
  const player0Board = game.getBoardPlayer0();
  io.to(game.players[0].id).emit('playerNumber', 0);
  io.to(game.players[0].id).emit('updateGameBoard', player0Board);

  // setup playerB
  const player1Board = game.getBoardPlayer1();
  io.to(game.players[1].id).emit('playerNumber', 1);
  io.to(game.players[1].id).emit('updateGameBoard', player1Board);

  // setup spectators
  const spectatorBoard = game.getBoardSpectator();
  for (const spectator of spectators) {
    io.to(spectator.id).emit('updateGameBoard', spectatorBoard);
  }
}

function resetGame(game, spectators) {
  // resetting game
  // setting all players and spectators to initializing state
  for (const players of game.players) {
    io.to(players.id).emit('changeGameState', 'initializing');
  }
  for (const spectator of spectators) {
    io.to(spectator.id).emit('changeGameState', 'initializing');
  }
  // resetting game
  game.reset();
}

io.on('connection', (socket) => {
  console.log('user connected:', socket.id);

  // sending new users the list of rooms
  socket.emit('room_list', rooms);

  // variable to store room name
  let roomNameSocket = '';

  // handling create_room event
  socket.on('create_room', (name) => {
    console.log('creating room:', name);
    // check if rooms contains a room with name name
    if (rooms.find((room) => room.name === name)) {
      // if room already exists, don't create a new room
      console.log('room already exists');
      return;
    }
    // create a new room and add it to rooms array
    rooms.push({
      name: name,
      players: [],
      spectators: [],
      game: new Scopa(cards),
    });
  });

  socket.on('joinRoom', (name, userName) => {
    console.log(userName, 'is joining room', name);
    io.to(socket.id).emit('changeGameState', 'initializing');

    // find room the user want to join
    const room = rooms.find((r) => r.name === name);
    if (room) {
      // if room exists, socket joins room
      socket.join(name);
      roomNameSocket = room.name;
      // if game is already ready to start, join as spectator
      if (room.game.isReady()) {
        room.spectators.push({ id:socket.id, name:userName });
        if (room.game.started === true) {
          const spectatorBoard = room.game.getBoardSpectator();
          io.to(room.name).emit('changeGameState', 'ready');
          io.to(socket.id).emit('updateGameBoard', spectatorBoard);
        }
      }
      else {
        room.game.addPlayer(socket.id);
        room.players.push({ id:socket.id, name:userName });
        if (room.game.isReady() && room.game.started === false) {
          room.game.start();
          // updating members
          updateMembers(room.game, room.spectators);
          // updating game state
          gameState = 'ready';
          io.to(room.name).emit('changeGameState', gameState);
        }
      }
    }
    // update everyone's room list
    io.emit('room_list', rooms);
  });

  socket.on('cardPlayed', (cardName) => {
    console.log(`${roomNameSocket}: cardPlayed -> ${JSON.stringify(cardName)}`);
    const room = rooms.find((r) => r.name === roomNameSocket);

    room.game.playCard(cardName);

    updateMembers(room.game, room.spectators);

    if (room.game.isGameOver()) {
      io.emit('gameOver', room.game.calculateScores());
      resetGame(room.game, room.spectators);
      room.game.start();
      updateMembers(room.game, room.spectators);
    }
  });

  socket.on('take', (card, taken) => {
    console.log(`${roomNameSocket}: take -> {${JSON.stringify(card)}, ${JSON.stringify(taken)}}`);
    const room = rooms.find((r) => r.name === roomNameSocket);

    room.game.take(card, taken);
    // update members
    updateMembers(room.game, room.spectators);
    if (room.game.isGameOver()) {
      io.emit('gameOver', room.game.calculateScores());
      resetGame(room.game, room.spectators);
      room.game.start();
      updateMembers(room.game, room.spectators);
    }
  });

  socket.on('disconnect', () => {
    console.log('user disconnected:', socket.id);
    const room = rooms.find((r) => r.name === roomNameSocket);
    if (room) {
      room.game.removePlayer(socket.id);
      room.spectators = room.spectators.filter((spectator) => spectator.id !== socket.id);

      if (!room.game.isReady()) {
        resetGame(room.game, room.spectators);
        /* // resetting game if there are not enough players
        for (const players of room.game.players) {
          // newGame.addPlayer(players.id);
          io.to(players.id).emit('changeGameState', 'initializing');
        }
        for (const spectator of room.spectators) {
          io.to(spectator.id).emit('changeGameState', 'initializing');
        }
        console.log('game reset');
        room.game.reset(); */
      }

      // removing the empty room from the rooms list if necessary
      if (room.game.players.length === 0) {
        console.log('room removed:', roomNameSocket);
        rooms.splice(rooms.indexOf(room), 1);
        // update everyone's room list
        io.emit('room_list', rooms);
      }
    }
  });
});

server.listen(3001, () => {
  console.log('listening on *:', server.address().port);
});