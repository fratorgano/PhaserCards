// import Phaser from '/phaser.min.js';
import Game from './scenes/gameScene.js';

const config = {
  type: Phaser.AUTO,
  parent: 'game',
  scale:{
    mode: Phaser.Scale.FIT,
    width: 1200,
    height: 1000,
  },
  scene: [Game],
};

window.onload = () => {
  new Phaser.Game(config);
};
