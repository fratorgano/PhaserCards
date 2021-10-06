// import Phaser from 'phaser';
import SocketHandler from '../helpers/SocketHandler.js';

import CardsHandler from '../helpers/CardsHandler.js';
import GameHandler from '../helpers/GameHandler.js';

import UIHandler from '../helpers/UIHandler.js';

import InteractivityHandler from '../helpers/InteractivityHandler.js';

const params = new URLSearchParams(window.location.search);
const roomName = params.get('roomName');
const userName = params.get('userName');

export default class Game extends Phaser.Scene {
  constructor() {
    super({ key: 'Game' });
  }

  preload() {
    const suits = ['hearts', 'diamonds', 'spades', 'clubs'];
    const values = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    for (const suit of suits) {
      for (const value of values) {
        this.load.image(`card-${suit}-${value}`, `assets/cards/card-${suit}-${value}.png`);
      }
    }
    this.load.image('card-back1', 'assets/cards/card-back2.png');
  }

  create() {
    // console.log(window.innerWidth, window.innerHeight, window.innerWidth / window.innerHeight);
    // this.scale.displaySize.setAspectRatio(window.innerWidth / window.innerHeight);
    // this.scale.refresh();

    console.log('Creating game scene');
    this.SocketHandler = new SocketHandler(this, roomName, userName);

    this.CardsHandler = new CardsHandler(this);
    this.GameHandler = new GameHandler(this);

    this.UIHandler = new UIHandler(this);
    this.UIHandler.buildUI();

    this.InteractivityHandler = new InteractivityHandler(this);
    this.cameras.main.setBackgroundColor('rgba(28, 28, 30, 1)');
  }

  update() {
    // console.log(this.GameHandler.dropZone);
  }
}