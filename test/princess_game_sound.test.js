import test from 'node:test';
import assert from 'node:assert';
import { PrincessGame } from '../src/princess/game.js';

const createElement = () => ({
  addEventListener: () => {},
  classList: { add: () => {}, remove: () => {} },
  textContent: ''
});

globalThis.window = {
  addEventListener: () => {},
  removeEventListener: () => {}
};

globalThis.document = {
  getElementById: () => createElement()
};

globalThis.performance = {
  now: () => 0
};

globalThis.requestAnimationFrame = () => {};

globalThis.Image = class {
  set src(value) {
    this._src = value;
    setTimeout(() => this.onload?.(), 0);
  }

  get src() {
    return this._src;
  }
};

test('PrincessGame music lifecycle', async (t) => {
  await t.test('plays, pauses, resumes, and stops princess music with game state', async () => {
    let playCalled = 0;
    let pauseCalled = 0;
    let stopCalled = 0;

    const sound = {
      playMusic() { playCalled += 1; },
      pauseMusic() { pauseCalled += 1; },
      stopMusic() { stopCalled += 1; }
    };

    const canvas = {
      width: 0,
      height: 0,
      getContext: () => ({
        clearRect: () => {},
        drawImage: () => {},
        fillRect: () => {},
        fillText: () => {},
        save: () => {},
        restore: () => {},
        translate: () => {},
        scale: () => {},
        globalAlpha: 1,
        fillStyle: '',
        font: ''
      })
    };

    const game = new PrincessGame(canvas, { sound });
    await new Promise((resolve) => setTimeout(resolve, 20));

    game.start();
    assert.strictEqual(playCalled, 1);

    game.pause();
    assert.strictEqual(pauseCalled, 1);

    game.resume();
    assert.strictEqual(playCalled, 2);

    game.gameOver();
    assert.strictEqual(stopCalled, 1);

    game.restart();
    assert.strictEqual(stopCalled, 2);
    assert.strictEqual(playCalled, 3);
  });
});
