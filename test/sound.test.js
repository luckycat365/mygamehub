import test from 'node:test';
import assert from 'node:assert';
import { Sound } from '../src/sound.js';

// Setup environment mocks
globalThis.window = {
  AudioContext: class {
    constructor() {
      this.currentTime = 0;
      this.destination = {};
      this.sampleRate = 44100;
      this.state = 'suspended';
    }
    resume() {
      this.state = 'running';
      return Promise.resolve();
    }
    createGain() {
      return {
        gain: {
          value: 1.0,
          setValueAtTime: function(v) { this.value = v; },
          exponentialRampToValueAtTime: function(v) { this.value = v; }
        },
        connect: () => {}
      };
    }
    createMediaElementSource() {
      return {
        connect: () => {}
      };
    }
    createOscillator() {
      return {
        type: 'sine',
        frequency: {
          value: 440,
          setValueAtTime: function(v) { this.value = v; },
          exponentialRampToValueAtTime: function(v) { this.value = v; },
          linearRampToValueAtTime: function(v) { this.value = v; }
        },
        connect: () => {},
        start: () => {},
        stop: () => {}
      };
    }
    createBuffer(channels, size, sampleRate) {
      return {
        numberOfChannels: channels,
        length: size,
        sampleRate: sampleRate,
        getChannelData: (index) => new Float32Array(size)
      };
    }
    createBufferSource() {
      return {
        buffer: null,
        connect: () => {},
        start: () => {},
        stop: () => {}
      };
    }
    createBiquadFilter() {
      return {
        type: 'lowpass',
        frequency: {
          value: 350,
          setValueAtTime: function(v) { this.value = v; }
        },
        Q: { value: 1.0 },
        connect: () => {}
      };
    }
  }
};

globalThis.Audio = class {
  constructor(src) {
    this.src = src;
    this.loop = false;
    this.currentTime = 0;
    this.paused = true;
  }
  play() {
    this.paused = false;
    return Promise.resolve();
  }
  pause() {
    this.paused = true;
  }
};

test('Sound Background Music Controls', async (t) => {
  await t.test('defines musicSource as null in constructor', () => {
    const sound = new Sound();
    assert.strictEqual(sound.musicSource, null);
  });

  await t.test('initializes music elements in init() instead of playMusic()', () => {
    const sound = new Sound();
    assert.strictEqual(sound.music, null);
    assert.strictEqual(sound.musicGain, null);
    assert.strictEqual(sound.musicSource, null);

    sound.init();

    assert.ok(sound.music);
    assert.ok(sound.musicGain);
    assert.ok(sound.musicSource);
    assert.strictEqual(sound.music.src, 'assets/music/AP.mp3');
    assert.strictEqual(sound.music.loop, true);
    assert.strictEqual(sound.musicGain.gain.value, 0.3);
  });

  await t.test('toggleMute() correctly mutes and unmutes the gain node', () => {
    const sound = new Sound();
    sound.init();
    assert.strictEqual(sound.musicGain.gain.value, 0.3);

    // Mute
    sound.toggleMute();
    assert.strictEqual(sound.muted, true);
    assert.strictEqual(sound.musicGain.gain.value, 0);

    // Unmute
    sound.toggleMute();
    assert.strictEqual(sound.muted, false);
    assert.strictEqual(sound.musicGain.gain.value, 0.3);
  });

  await t.test('initializes music on playMusic', () => {
    const sound = new Sound();
    sound.playMusic();
    assert.ok(sound.music);
    assert.strictEqual(sound.music.src, 'assets/music/AP.mp3');
    assert.strictEqual(sound.music.loop, true);
    assert.strictEqual(sound.music.paused, false);
  });

  await t.test('pauses music on pauseMusic', () => {
    const sound = new Sound();
    sound.playMusic();
    sound.pauseMusic();
    assert.strictEqual(sound.music.paused, true);
  });

  await t.test('resets and pauses music on stopMusic', () => {
    const sound = new Sound();
    sound.playMusic();
    sound.music.currentTime = 15;
    sound.stopMusic();
    assert.strictEqual(sound.music.paused, true);
    assert.strictEqual(sound.music.currentTime, 0);
  });

  await t.test('sound effects play without throwing when unmuted', () => {
    const sound = new Sound();
    assert.doesNotThrow(() => sound.playJump());
    assert.doesNotThrow(() => sound.playCollect());
    assert.doesNotThrow(() => sound.playPowerUp());
    assert.doesNotThrow(() => sound.playHit());
  });

  await t.test('sound effects play without throwing when muted', () => {
    const sound = new Sound();
    sound.toggleMute();
    assert.doesNotThrow(() => sound.playJump());
    assert.doesNotThrow(() => sound.playCollect());
    assert.doesNotThrow(() => sound.playPowerUp());
    assert.doesNotThrow(() => sound.playHit());
  });
});
