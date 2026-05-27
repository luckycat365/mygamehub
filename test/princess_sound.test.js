import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PrincessSound } from '../src/princess/sound.js';

const repoRoot = path.dirname(fileURLToPath(new URL('../package.json', import.meta.url)));

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
    assert.ok(sound.starAttack);
    assert.ok(sound.starAttack.src.endsWith('/assets/sounds/PrincessStarAdventure/star-attack.wav'));
    assert.strictEqual(sound.starAttack.preload, 'auto');
    assert.strictEqual(sound.starAttack.loaded, true);
    assert.ok(sound.teacupCrash);
    assert.ok(sound.teacupCrash.src.endsWith('/assets/sounds/PrincessStarAdventure/teacup-crash.wav'));
    assert.strictEqual(sound.teacupCrash.preload, 'auto');
    assert.strictEqual(sound.teacupCrash.loaded, true);
    assert.ok(sound.doubleJump);
    assert.ok(sound.doubleJump.src.endsWith('/assets/sounds/PrincessStarAdventure/princess%20double%20jump.wav'));
    assert.strictEqual(sound.doubleJump.preload, 'auto');
    assert.strictEqual(sound.doubleJump.loaded, true);
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

  await t.test('plays the star attack sound effect', () => {
    const sound = new PrincessSound();

    sound.playStarAttack();

    assert.ok(sound.starAttack);
    assert.strictEqual(sound.starAttack.paused, false);
    assert.strictEqual(sound.starAttack.volume, sound.sfxVolume);
  });

  await t.test('plays the teacup crash sound effect', () => {
    const sound = new PrincessSound();

    sound.playTeacupCrash();

    assert.ok(sound.teacupCrash);
    assert.strictEqual(sound.teacupCrash.paused, false);
    assert.strictEqual(sound.teacupCrash.volume, sound.sfxVolume);
  });

  await t.test('plays the double jump sound effect', () => {
    const sound = new PrincessSound();

    sound.playDoubleJump();

    assert.ok(sound.doubleJump);
    assert.strictEqual(sound.doubleJump.paused, false);
    assert.strictEqual(sound.doubleJump.volume, sound.sfxVolume);
  });

  await t.test('sound effect playback failures do not throw', () => {
    const OriginalAudio = globalThis.Audio;
    globalThis.Audio = class {
      constructor(src) {
        this.src = src;
        this.loop = false;
        this.preload = '';
        this.volume = 1;
      }

      set currentTime(value) {
        throw new Error(`Cannot seek to ${value}`);
      }

      load() {}
      pause() {}
      play() {
        throw new Error('Audio playback is not ready');
      }
    };

    try {
      const sound = new PrincessSound();
      assert.doesNotThrow(() => sound.playStarAttack());
      assert.doesNotThrow(() => sound.playTeacupCrash());
      assert.doesNotThrow(() => sound.playDoubleJump());
      assert.doesNotThrow(() => {
        sound.playMusic();
        sound.stopMusic();
      });
    } finally {
      globalThis.Audio = OriginalAudio;
    }
  });

  await t.test('double jump effect starts without a perceptible silence gap', () => {
    const soundPath = path.join(
      repoRoot,
      'assets',
      'sounds',
      'PrincessStarAdventure',
      'princess double jump.wav'
    );
    const wav = fs.readFileSync(soundPath);
    const sampleRate = wav.readUInt32LE(24);
    const dataOffset = wav.indexOf(Buffer.from('data')) + 8;
    const firstAudibleByte = (() => {
      for (let offset = dataOffset; offset < wav.length; offset += 2) {
        if (Math.abs(wav.readInt16LE(offset)) > 80) return offset;
      }
      return -1;
    })();

    assert.notStrictEqual(firstAudibleByte, -1);
    const firstAudibleSeconds = ((firstAudibleByte - dataOffset) / 2) / sampleRate;
    assert.ok(firstAudibleSeconds < 0.05);
  });
});
