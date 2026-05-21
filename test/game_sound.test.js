import test from 'node:test';
import assert from 'node:assert';
import { Game } from '../src/game.js';

// Setup environment mocks
globalThis.window = {
  addEventListener: () => {},
  localStorage: { getItem: () => '0', setItem: () => {} }
};
globalThis.document = {
  getElementById: () => ({
    addEventListener: () => {},
    classList: { add: () => {}, remove: () => {} },
    textContent: ''
  })
};
globalThis.requestAnimationFrame = () => {};

test('Game BGM Integration', async (t) => {
  let playCalled = 0;
  let pauseCalled = 0;
  let stopCalled = 0;

  class MockSound {
    init() {}
    playMusic() { playCalled++; }
    pauseMusic() { pauseCalled++; }
    stopMusic() { stopCalled++; }
    playHit() {}
  }

  await t.test('calls appropriate music APIs on start, pause, resume, restart, and gameover', () => {
    // Instantiate game and override canvas/sound
    const canvas = {
      width: 0,
      height: 0,
      getContext: () => ({}),
      addEventListener: () => {}
    };
    const game = new Game(canvas);
    game.sound = new MockSound();

    // Start
    game.state = 'START';
    game.start();
    assert.strictEqual(playCalled, 1);

    // Pause
    game.pause();
    assert.strictEqual(pauseCalled, 1);

    // Resume
    game.resume();
    assert.strictEqual(playCalled, 2);

    // Game Over
    game.triggerGameOver();
    assert.strictEqual(stopCalled, 1);

    // Restart
    game.restart();
    assert.strictEqual(stopCalled, 2);
    assert.strictEqual(playCalled, 3);
  });
});
