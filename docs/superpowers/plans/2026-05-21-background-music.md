# Background Music Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Integrate a looping background music track (`assets/music/AP.mp3`) that plays during active gameplay and pauses/resumes/restarts/stops correctly with game states.

**Architecture:** Use HTML5 Audio wrapped in Web Audio API `MediaElementAudioSourceNode` for memory efficiency and instant play, routing it through a music-specific `GainNode`.

**Tech Stack:** Vanilla JavaScript, Web Audio API, Node.js (test runner)

---

### Task 1: Refactor Sound Engine with HTML5 Streaming Audio

**Files:**
- Modify: `src/sound.js`
- Create: `test/sound.test.js`

- [ ] **Step 1: Write the failing test for Sound class music methods**

Create `test/sound.test.js` with mock browser environments to verify background music methods.

```javascript
import test from 'node:test';
import assert from 'node:assert';
import { Sound } from '../src/sound.js';

// Setup environment mocks
globalThis.window = {
  AudioContext: class {
    constructor() {
      this.currentTime = 0;
      this.destination = {};
    }
    createGain() {
      return {
        gain: { value: 1.0, setValueAtTime: function(v) { this.value = v; } },
        connect: () => {}
      };
    }
    createMediaElementSource() {
      return {
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
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test test/sound.test.js`
Expected: FAIL due to missing music properties and methods.

- [ ] **Step 3: Implement minimal background music changes in Sound class**

Update `src/sound.js` to initialize, route, play, pause, stop and mute the background music.

```javascript
export class Sound {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.music = null;
    this.musicGain = null;
    this.musicSource = null;
  }

  init() {
    if (typeof window === 'undefined') return;
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    
    // Lazy load background music elements
    if (!this.music && typeof Audio !== 'undefined') {
      this.music = new Audio('assets/music/AP.mp3');
      this.music.loop = true;
      
      if (this.ctx) {
        this.musicGain = this.ctx.createGain();
        this.musicGain.gain.setValueAtTime(this.muted ? 0 : 0.3, this.ctx.currentTime);
        
        this.musicSource = this.ctx.createMediaElementSource(this.music);
        this.musicSource.connect(this.musicGain);
        this.musicGain.connect(this.ctx.destination);
      }
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    if (this.musicGain && this.ctx) {
      this.musicGain.gain.setValueAtTime(this.muted ? 0 : 0.3, this.ctx.currentTime);
    }
    return this.muted;
  }

  playMusic() {
    this.init();
    if (this.music) {
      this.music.play().catch(err => {
        console.warn('BGM play blocked or failed:', err);
      });
    }
  }

  pauseMusic() {
    if (this.music) {
      this.music.pause();
    }
  }

  stopMusic() {
    if (this.music) {
      this.music.pause();
      this.music.currentTime = 0;
    }
  }

  playJump() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.type = 'triangle';
    const now = this.ctx.currentTime;
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(600, now + 0.15);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

    osc.start();
    osc.stop(now + 0.15);
  }

  playCollect() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.type = 'sine';
    const now = this.ctx.currentTime;
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.setValueAtTime(900, now + 0.05);

    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);

    osc.start();
    osc.stop(now + 0.12);
  }

  playPowerUp() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.type = 'sawtooth';
    const now = this.ctx.currentTime;
    osc.frequency.setValueAtTime(300, now);
    osc.frequency.linearRampToValueAtTime(1200, now + 0.3);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

    osc.start();
    osc.stop(now + 0.35);
  }

  playHit() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const bufferSize = this.ctx.sampleRate * 0.25;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noiseNode = this.ctx.createBufferSource();
    noiseNode.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(400, this.ctx.currentTime);
    filter.Q.value = 1.0;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.25);

    noiseNode.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    noiseNode.start();
    noiseNode.stop(this.ctx.currentTime + 0.25);
  }
}
```

- [ ] **Step 4: Run tests and make sure they pass**

Run: `node --test test/sound.test.js`
Expected: PASS

---

### Task 2: Connect Music Controls to Game State Handlers

**Files:**
- Modify: `src/game.js`
- Create: `test/game_sound.test.js`

- [ ] **Step 1: Write the failing test for Game integration**

Create `test/game_sound.test.js` mock-checking that music play/pause/stop functions are called on game states.

```javascript
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
      getContext: () => ({})
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test test/game_sound.test.js`
Expected: FAIL because we haven't linked the music calls to `src/game.js` yet.

- [ ] **Step 3: Modify Game Class to call music methods**

Update `src/game.js`:
- In `start()`, add: `this.sound.playMusic();`
- In `pause()`, add: `this.sound.pauseMusic();`
- In `resume()`, add: `this.sound.playMusic();`
- In `restart()`, add: `this.sound.stopMusic();` and `this.sound.playMusic();`
- In `triggerGameOver()`, add: `this.sound.stopMusic();`

- [ ] **Step 4: Run tests to verify they pass**

Run: `node --test test/game_sound.test.js` and `node --test test/physics.test.js`
Expected: PASS
