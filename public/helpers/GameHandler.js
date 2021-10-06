export default class GameHandler {
  constructor(scene) {
    this.gameState = 'initializing';
    this.deck = null;

    this.turn = null;
    this.myTurn = null;

    this.playerDeck = [];
    this.playerHand = [];

    this.opponentDeck = [];
    this.opponentHand = [];

    this.dropZone = [];

    this.selected = [];

    this.changeTurn = () => {
      this.turn = (this.turn + 1) % 2;
      console.log('Turn changed to:', this.turn);
    };

    this.isMyTurn = () => {
      return this.myTurn === this.turn;
    };

    this.changeGameState = (newState) => {
      this.gameState = newState;
      console.log('Game state changed to:', this.gameState);
    };

    this.clearBoard = () => {
      for (const card of this.dropZone) {
        card.destroy();
      }
      this.dropZone.length = 0;
      for (const card of this.playerHand) {
        card.destroy();
      }
      this.playerHand.length = 0;
      for (const card of this.opponentHand) {
        card.destroy();
      }
      this.opponentHand.length = 0;
      scene.UIHandler.updatePlayerDeck(0);
      scene.UIHandler.updateOpponentDeck(0);
      scene.UIHandler.updateDeckRemaining(40);
    };

    this.selectedHelper = () => {
      const selectedSum = this.selected.reduce((acc, cur) => acc + cur.rep.number, 0);
      for (const handCard of this.playerHand) {
        handCard.off('pointerdown');
        handCard.clearTint();
        if (handCard.rep.number === selectedSum) {
          scene.UIHandler.takeCardTint(handCard);
          handCard.on('pointerdown', () => {
            const selectedCardsNames = this.selected.map((c) => c.rep.name);
            this.selected.length = 0;
            scene.SocketHandler.take(handCard.rep.name, selectedCardsNames);
          });
        }
      }
    };

    this.take = (cardName, selectedCardsNames) => {
      if (this.myTurn === -1) {
        console.log('taking as spectator');
        if (this.turn === 0) {
          this.playerHand.pop().destroy();
          this.playerHand.push(
            scene.UIHandler.fadeOut(
              scene.UIHandler.addCardPlayerHand(
                scene.CardsHandler.dealCard(cardName, false, false), this.playerHand.length)));
        }
        else {
          this.opponentHand.pop().destroy();
          this.opponentHand.push(
            scene.UIHandler.fadeOut(
              scene.UIHandler.addCardOpponentHand(
                scene.CardsHandler.dealCard(cardName, false, false), this.opponentHand.length)));
        }
      }
      else if (this.myTurn === this.turn) {
        const card = this.playerHand.find((c) => c.rep.name === cardName);
        scene.UIHandler.fadeOut(card);
      }
      else {
        this.opponentHand.pop().destroy();
        this.opponentHand.push(
          scene.UIHandler.fadeOut(
            scene.UIHandler.addCardOpponentHand(
              scene.CardsHandler.dealCard(cardName, false, false), this.opponentHand.length)));
      }

      for (const cardN of selectedCardsNames) {
        const card = this.dropZone.find((c) => c.rep.name === cardN);
        // scene.UIHandler.clickedCardTint(card);
        scene.UIHandler.fadeOut(card);
      }
    };

    this.addSelected = (card) => {
      if (this.myTurn === this.turn) {
        this.selected.push(card);
        this.selectedHelper();
      }
    };

    this.removeSelected = (card) => {
      if (this.myTurn === this.turn) {
        this.selected.splice(this.selected.indexOf(card), 1);
        this.selectedHelper();
      }
    };
    this.gameOver = (points) => {
      if (points[this.myTurn] > points[(this.myTurn + 1) % 2]) {
        alert(`Game over! You won with ${points[this.myTurn]} points.`);
      }
      else {
        alert(`Game over! You lost with ${points[this.myTurn]} points.`);
      }
    };

    this.updateGameBoard = ({ deck, playerHand, playerDeck, opponentHand, opponentDeck, dropZone, turn, myTurn }) => {
      this.clearBoard();

      this.deck = deck;
      this.turn = turn;
      this.myTurn = myTurn;

      scene.UIHandler.updateDeckRemaining(this.deck);
      scene.UIHandler.updateTurn(this.turn, this.myTurn);

      if (playerDeck !== 0) {
        scene.UIHandler.updatePlayerDeck(playerDeck);
      }
      if (opponentDeck !== 0) {
        scene.UIHandler.updateOpponentDeck(opponentDeck);
      }

      if (myTurn === -1) {
        console.log('Updating game state as spectator');
        for (let i = 0; i < playerHand; i++) {
          this.playerHand.push(scene.UIHandler.addCardPlayerHand(scene.CardsHandler.dealCardBack(), i));
        }
        for (let i = 0; i < opponentHand; i++) {
          this.opponentHand.push(scene.UIHandler.addCardOpponentHand(scene.CardsHandler.dealCardBack(), i));
        }
        for (const i in dropZone) {
          const card = dropZone[i];
          this.dropZone.push(scene.UIHandler.addCardDropZone(scene.CardsHandler.dealCard(card, false, true), i));
        }
        return;
      }
      console.log('Turn:', this.turn);

      for (const i in playerHand) {
        const card = playerHand[i];
        this.playerHand.push(scene.UIHandler.addCardPlayerHand(scene.CardsHandler.dealCard(card, true, false), i));
      }
      for (let i = 0; i < opponentHand; i++) {
        this.opponentHand.push(scene.UIHandler.addCardOpponentHand(scene.CardsHandler.dealCardBack(), i));
      }
      for (const i in dropZone) {
        const card = dropZone[i];
        this.dropZone.push(scene.UIHandler.addCardDropZone(scene.CardsHandler.dealCard(card, false, true), i));
      }
    };
  }
}