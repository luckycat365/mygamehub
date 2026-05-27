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
      stopMusic() { stopCalled += 1; },
      playStarAttack() {},
      playTeacupCrash() {},
      playDoubleJump() {}
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

  await t.test('plays crash sound when a teacup sentry is destroyed', async () => {
    let crashCalled = 0;
    const sound = {
      playMusic() {},
      pauseMusic() {},
      stopMusic() {},
      playStarAttack() {},
      playTeacupCrash() { crashCalled += 1; },
      playDoubleJump() {}
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

    game.projectiles = [{
      getBounds: () => ({ x: 0, y: 0, width: 20, height: 20 })
    }];
    game.enemies = [{
      destroyed: false,
      getBounds: () => ({ x: 5, y: 5, width: 20, height: 20 }),
      hit: () => true
    }];

    game.resolveProjectileHits();

    assert.strictEqual(crashCalled, 1);
    assert.strictEqual(game.score, 1);
  });

  await t.test('plays double jump sound only on the second jump', async () => {
    let doubleJumpCalled = 0;
    const sound = {
      playMusic() {},
      pauseMusic() {},
      stopMusic() {},
      playStarAttack() {},
      playTeacupCrash() {},
      playDoubleJump() { doubleJumpCalled += 1; }
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

    game.input.snapshot = () => ({ left: false, right: false, jump: true, shoot: false, pause: false });
    game.update(0.016);
    assert.strictEqual(doubleJumpCalled, 0);

    game.update(0.016);
    assert.strictEqual(doubleJumpCalled, 1);

    game.update(0.016);
    assert.strictEqual(doubleJumpCalled, 1);
  });
});
