import ZoneHandler from './ZoneHandler.js';

export default class UIHandler {
  constructor(scene) {

    this.zoneHandler = new ZoneHandler(scene);

    this.buildZones = () => {
      scene.dropZone = this.zoneHandler.renderZone(470, 500);
      this.zoneHandler.renderOutline(scene.dropZone);
    };

    this.buildPlayersAreas = () => {
      scene.playerHandArea = scene.add.rectangle(470, 860, 850, 230);
      scene.playerHandArea.setStrokeStyle(4, 0xFFFFFF);
      scene.playerDeckArea = scene.add.rectangle(1000, 860, 140, 145);
      scene.playerDeckArea.setStrokeStyle(3, 0xFFFFFF);
      scene.playerDeckText = scene.add.text(1040, 725, '0', { fontSize: '20px', fill: '#FFFFFF' });

      scene.opponentHandArea = scene.add.rectangle(470, 135, 850, 230);
      scene.opponentHandArea.setStrokeStyle(4, 0xFFFFFF);
      scene.opponentDeckArea = scene.add.rectangle(1000, 135, 140, 145);
      scene.opponentDeckArea.setStrokeStyle(3, 0xFFFFFF);
      scene.opponentDeckText = scene.add.text(1040, 250, '0', { fontSize: '20px', fill: '#FFFFFF' });
    };

    this.buildDeckArea = () => {
      scene.deckArea = scene.add.rectangle(1000, 500, 140, 145);
      // scene.deckArea.setStrokeStyle(3, 0xFF0000);
      scene.deckRemainingText = scene.add.text(1040, 620, '40', { fontSize: '20px', fill: '#FFFFFF' });
    };

    this.buildUI = () => {
      this.buildZones();
      this.buildPlayersAreas();
      this.buildDeckArea();
    };

    this.addCardPlayerHand = (card, i) => {
      return card.render(155 + (i * 155), 860);
    };
    this.addCardOpponentHand = (card, i) => {
      return card.render(155 + (i * 155), 135);
    };
    this.addCardDropZone = (card, i) => {
      return card.render(135 + (i * 155), 500);
    };
    /* this.addCardDeck = (card) => {
      return card.render(1000, 500);
    }; */


    this.updatePlayerDeck = (deckSize) => {
      scene.playerDeckText.setText(deckSize);
      if (deckSize === 0) {
        if (scene.playerDeckArea.card) {
          scene.playerDeckArea.card.destroy();
          scene.playerDeckArea.card = null;
        }
      }
      else {
        scene.playerDeckArea.card.destroy();
        scene.playerDeckArea.card = scene.CardsHandler.dealCardBack().render(1000, 860);
      }
    };
    this.updateOpponentDeck = (deckSize) => {
      scene.opponentDeckText.setText(deckSize);
      if (deckSize === 0) {
        if (scene.opponentDeckArea.card) {
          scene.opponentDeckArea.card.destroy();
          scene.opponentDeckArea.card = null;
        }
      }
      else {
        scene.opponentDeckArea.card.destroy();
        scene.opponentDeckArea.card = scene.CardsHandler.dealCardBack().render(1000, 135);
      }
    };

    this.updateDeckRemaining = (remaining) => {
      scene.deckRemainingText.setText(remaining);
      if (remaining === 0) {
        if (scene.deckArea.card) {
          scene.deckArea.card.destroy();
          scene.deckArea.card = null;
        }
      }
      else {
        if (scene.deckArea.card) scene.deckArea.card.destroy();
        scene.deckArea.card = scene.CardsHandler.dealCardBack().render(1000, 500);
      }
    };

    this.updateTurn = (turn, myTurn) => {
      if (turn === myTurn) {
        scene.playerHandArea.setStrokeStyle(4, 0x3cf738);
        scene.opponentHandArea.setStrokeStyle(4, 0xFFFFFF);
      }
      else {
        scene.playerHandArea.setStrokeStyle(4, 0xFFFFFF);
        scene.opponentHandArea.setStrokeStyle(4, 0x3cf738);
      }
    };

    this.dragStartTint = (card) => {
      card.setTint(0xef6060);
    };
    this.clickedCardTint = (card) => {
      card.setTint(0x6060ee);
    };
    this.takeCardTint = (card) => {
      card.setTint(0x60ee60);
    };

  }
}
