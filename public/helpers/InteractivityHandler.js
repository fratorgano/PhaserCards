export default class InteractivityHandler {
  constructor(scene) {

    scene.input.on('drag', (_points, card, dragX, dragY) => {
      card.x = dragX;
      card.y = dragY;
    });

    scene.input.on('dragstart', (_pointer, gameObject) => {
      scene.UIHandler.dragStartTint(gameObject);
      scene.children.bringToTop(gameObject);
    });

    scene.input.on('dragend', (_pointer, card, dropped) => {
      card.clearTint();
      if (!dropped) {
        card.x = card.input.dragStartX;
        card.y = card.input.dragStartY;
      }
    });

    scene.input.on('drop', (_pointer, card) => {
      if (scene.GameHandler.isMyTurn() && scene.GameHandler.gameState === 'ready' && scene.GameHandler.moveType() === 'plays') {
        scene.SocketHandler.playCard(card.rep.name);
      }
      else {
        card.x = card.input.dragStartX;
        card.y = card.input.dragStartY;
      }
    });
  }
}