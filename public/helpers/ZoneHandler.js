export default class ZoneHandler {
  constructor(scene) {
    this.renderZone = (x, y) => {
      const dropZone = scene.add.zone(x, y, 850, 230).setRectangleDropZone(850, 230);
      dropZone.setData({
        'cards':0,
      });
      return dropZone;
    };
    this.renderOutline = (dropZone) => {
      const dropZoneOutline = scene.add.graphics();
      dropZoneOutline.lineStyle(4, 0xffffff);
      dropZoneOutline.strokeRect(dropZone.x - dropZone.width / 2, dropZone.y - dropZone.height / 2, dropZone.width, dropZone.height);
    };
  }
}