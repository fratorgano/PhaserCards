export default class Card {
  constructor(scene, name, draggable, clickable) {
    this.render = (x, y) => {
      const card = scene.add.image(x, y, name).setScale(1.5);

      card.rep = {
        name: name,
        number: parseInt(name.split('-').pop()),
        suit: name.substring(name.indexOf('-') + 1, name.lastIndexOf('-')),
      };

      if (draggable) {
        card.setInteractive();
        scene.input.setDraggable(card);
      }
      if (clickable) {
        card.setInteractive();
        card.on('pointerdown', function() {
          if (card.isTinted) {
            card.clearTint();
            scene.GameHandler.removeSelected(card);
          }
          else {
            scene.UIHandler.clickedCardTint(this);
            card.selected = true;
            scene.GameHandler.addSelected(card);
          }
        });
      }
      return card;
    };
  }
}