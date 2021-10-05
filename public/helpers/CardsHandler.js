import Card from './Card.js';

export default class CardsHandler {
  constructor(scene) {
    this.scene = scene;

    this.dealCard = (name, draggable = true, clickable = true) => {
      const newCard = new Card(this.scene, name, draggable, clickable);
      return (newCard);
    };
    this.dealCardBack = () => {
      const newCard = new Card(this.scene, 'card-back1', false, false);
      return (newCard);
    };
  }
}