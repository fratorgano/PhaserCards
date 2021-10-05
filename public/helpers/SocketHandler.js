// import * as io from '/socket.io/socket.io.js';
// console.log(io);

export default class SocketHandler {
  constructor(scene, roomName, playerName) {
    this.scene = scene;
    this.socket = io('http://localhost:3001');
    this.roomName = roomName;
    this.playerName = playerName;

    console.log('joining room', roomName, 'with name', playerName);
    this.socket.emit('joinRoom', roomName, playerName);

    this.socket.on('playerNumber', (number) => {
      console.log('myTurn:', number);
      scene.GameHandler.myTurn = number;
    });

    this.socket.on('changeGameState', (gameState) => {
      scene.GameHandler.changeGameState(gameState);
      if (gameState === 'initializing') {
        // scene.GameHandler.deck = scene.UIHandler.addCardDeck(scene.CardsHandler.dealCardBack());
        scene.UIHandler.updateDeckRemaining(40);
        scene.GameHandler.clearBoard();
      }
    });

    this.socket.on('gameOver', (points) => {
      scene.GameHandler.gameOver(points);
    });

    this.socket.on('updateGameBoard', (board) => {
      scene.GameHandler.updateGameBoard(board);
    });

  }
  playCard(card) {
    this.socket.emit('cardPlayed', card);
  }

  take(card, taken) {
    this.socket.emit('take', card, taken);
  }
}