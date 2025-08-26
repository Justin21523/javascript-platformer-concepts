// ui/GameUI.js
export class GameUI {
    constructor(game) {
      this.game = game;
      this.score = 0;
      this.lives = 3;
      this.elements = {};
    }

    init(elements) {
      this.elements = elements;
      this.update();
    }

  addScore(points) {
    this.score += points;
    this.update();
  }

  loseLife() {
    this.lives--;
    this.update();
  }

  update() {
    if (this.elements.score) {
      this.elements.score.textContent = `分數: ${this.score}`;
    }

    if (this.elements.lives) {
      this.elements.lives.textContent = `生命: ${this.lives}`;
    }
  }
}

