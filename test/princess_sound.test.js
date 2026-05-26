import test from 'node:test';
import assert from 'node:assert';
import { PrincessSound } from '../src/princess/sound.js';

globalThis.Audio = class {
  constructor(src) {
    this.src = src;
    this.loop = false;
    this.preload = '';
    this.volume = 1;
    this.currentTime = 0;
    this.paused = true;
    this.loaded = false;
  }

  load() {
    this.loaded = true;
  }

  play() {
    this.paused = false;
    return Promise.resolve();
  }

  pause() {
    this.paused = true;
  }
};

test('PrincessSound background music controls', async (t) => {
  await t.test('loads ChasingLight as the princess music track', () => {
    const sound = new PrincessSound();
    sound.init();

    assert.ok(sound.music);
    assert.ok(sound.music.src.endsWith('/assets/music/ChasingLight.mp3'));
    assert.strictEqual(sound.music.loop, true);
    assert.strictEqual(sound.music.preload, 'auto');
    assert.strictEqual(sound.music.loaded, true);
  });

  await t.test('plays, pauses, and stops the princess music', async () => {
    const sound = new PrincessSound();

    sound.playMusic();
    assert.strictEqual(sound.music.paused, false);

    sound.pauseMusic();
    assert.strictEqual(sound.music.paused, true);

    sound.music.currentTime = 12;
    sound.stopMusic();
    assert.strictEqual(sound.music.paused, true);
    assert.strictEqual(sound.music.currentTime, 0);
  });
});
