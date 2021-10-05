const shuffle = require('shuffle-array');

class Scopa {
  constructor(deck) {
    this.cards = deck;
    this.deck = shuffle(this.cards, { 'copy': true });
    this.players = [];
    this.dropZone = [];
    this.turn = 0;
    this.started = false;
    this.lastTake = null;
  }

  reset() {
    this.deck = shuffle(this.cards, { 'copy': true });
    for (const player of this.players) {
      player.hand = [];
      player.taken = [];
      player.points = 0;
    }
    this.dropZone = [];
    this.turn = 0;
    this.started = false;
    this.lastTake = null;
  }

  addPlayer(playerId) {
    this.players.push({
      id: playerId,
      hand: [],
      taken: [],
      points: 0,
    });
  }
  removePlayer(playerId) {
    this.players = this.players.filter(player => player.id !== playerId);
  }

  isReady() {
    return this.players.length === 2;
  }

  dealCards(cardsNumber) {
    const cardsToDeal = this.deck.slice(0, cardsNumber);
    this.deck.splice(0, cardsNumber);
    return cardsToDeal;
  }

  start() {
    this.dealCardsToPlayers();
    this.dropZone = this.dealCards(4);
    this.started = true;
  }

  dealCardsToPlayers() {
    this.players.forEach(player => {
      player.hand = this.dealCards(3);
    });
  }

  checkIfLastCardOnBothHands() {
    // if hands are empty, draw a new hand
    if (this.players[0].hand.length == 0 && this.players[1].hand.length == 0) {
      if (this.deck.length > 0) {
        this.dealCardsToPlayers();
      }
      else {
        this.players[this.lastTake].taken = this.players[this.lastTake].taken.concat(this.dropZone);
        console.log('GAME OVER');
      }
    }
  }

  playCard(card) {
    // find the player
    const player = this.players[this.turn];
    // check if player has the card
    if (player.hand.includes(card)) {
      player.hand.splice(player.hand.indexOf(card), 1);
      this.dropZone.push(card);
    }
    else {
      console.log('card not found');
    }
    // change turn
    this.turn = (this.turn + 1) % 2;
    this.checkIfLastCardOnBothHands();
  }

  take(card, taken) {
    const player = this.players[this.turn];
    // TODO: check if card has the same value of the sum of the taken cards
    // check if player has the card
    if (player.hand.includes(card)) {
      player.hand.splice(player.hand.indexOf(card), 1);
    }
    else {
      console.log('card not found');
      return;
    }
    // check if taken cards are in the dropzone
    if (taken.every(c => this.dropZone.includes(c))) {
      this.lastTake = this.turn;
      this.dropZone = this.dropZone.filter(c => !taken.includes(c));
      // add taken to player.taken
      player.taken = player.taken.concat(taken);
      player.taken.push(card);
    }
    else {
      console.log('player picked up card that weren\'t in the dropzone');
      return;
    }
    // if there are no more cards in the dropzone, give a point to player
    if (this.dropZone.length === 0) {
      player.points++;
    }
    // change turn
    this.turn = (this.turn + 1) % 2;
    this.checkIfLastCardOnBothHands();
  }

  isGameOver() {
    return this.deck.length === 0 && this.players[0].hand.length == 0 && this.players[1].hand.length == 0;
  }

  calculateScores() {
    const points = [];
    for (const player of this.players) {
      let point = 0;
      // denari
      const diamondSum = player.taken.filter(c => c.includes('diamonds')).length;
      if (diamondSum >= 6) point++;

      // carte
      if (player.taken.length >= 21) point++;

      // settebello
      if (player.taken.filter(c => c.includes('spades-7')).length === 1) point++;

      // primiera
      // separate cards
      const spades = player.taken.filter(c => c.includes('spades')).map(c => this.convertCardTextToCard(c));
      const hearts = player.taken.filter(c => c.includes('hearts')).map(c => this.convertCardTextToCard(c));
      const clubs = player.taken.filter(c => c.includes('clubs')).map(c => this.convertCardTextToCard(c));
      const diamonds = player.taken.filter(c => c.includes('diamonds')).map(c => this.convertCardTextToCard(c));
      // find highest card of each
      const spadesHighest = spades.reduce((a, b) => (a.value > b.value) ? a : b, { value:0, suit:'' });
      const heartsHighest = hearts.reduce((a, b) => (a.value > b.value) ? a : b, { value:0, suit:'' });
      const clubsHighest = clubs.reduce((a, b) => (a.value > b.value) ? a : b, { value:0, suit:'' });
      const diamondsHighest = diamonds.reduce((a, b) => (a.value > b.value) ? a : b, { value:0, suit:'' });
      // console.log(spadesHighest, heartsHighest, clubsHighest, diamondsHighest, spadesHighest.value + heartsHighest.value + clubsHighest.value + diamondsHighest.value);
      player.primiera = spadesHighest.value + heartsHighest.value + clubsHighest.value + diamondsHighest.value;

      point += player.points;
      points.push(point);
    }
    if (this.players[0].primiera > this.players[1].primiera) {
      points[0] += 1;
    }
    else {
      points[1] += 1;
    }
    console.log(this.players);
    return points;
    // console.log(this.players);
  }

  convertCardTextToCard(cardText) {
    const card = {
      number: parseInt(cardText.split('-').pop()),
      value: this.convertCardNumberToValue(parseInt(cardText.split('-').pop())),
      suit: cardText.substring(cardText.indexOf('-') + 1, cardText.lastIndexOf('-')),
    };
    return card;
  }

  convertCardNumberToValue(cardNumber) {
    switch (cardNumber) {
    case 1: return 16;
    case 2: case 3: case 4: case 5: return cardNumber + 10;
    case 6: case 7: return cardNumber * 3;
    default: return 10;
    }
  }

  getBoardPlayer0() {
    if (this.players[0] != null) {
      return {
        deck: this.deck.length,
        playerHand: this.players[0].hand,
        playerDeck: this.players[0].taken.length,
        opponentHand: this.players[1].hand.length,
        opponentDeck: this.players[1].taken.length,
        dropZone: this.dropZone,
        turn: this.turn,
        myTurn: 0,
      };
    }
  }

  getBoardPlayer1() {
    if (this.players[1] != null) {
      return {
        deck: this.deck.length,
        playerHand: this.players[1].hand,
        playerDeck: this.players[1].taken.length,
        opponentHand: this.players[0].hand.length,
        opponentDeck: this.players[0].taken.length,
        dropZone: this.dropZone,
        turn: this.turn,
        myTurn: 1,
      };
    }
  }

  getBoardSpectator() {
    return {
      deck: this.deck.length,
      playerHand: this.players[0].hand.length,
      playerDeck: this.players[0].taken.length,
      opponentHand: this.players[1].hand.length,
      opponentDeck: this.players[1].taken.length,
      dropZone: this.dropZone,
      turn: this.turn,
      myTurn: -1,
    };
  }
}

module.exports = Scopa;