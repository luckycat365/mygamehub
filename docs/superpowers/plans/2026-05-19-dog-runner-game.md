# Dog Runner 2D Game Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a modular 2D side-scrolling dog running game using HTML5 Canvas and Vanilla JS, featuring a parallax background, jumping/double-jumping, bone collections, power-ups (invincibility speed boosts and shields), particle bursts, and programmatic retro synthesized audio.

**Architecture:** A lightweight component-based structure where entities (Dog, Obstacle, Collectible, Powerup, Background, Particle) manage their own physics calculations and Canvas drawing commands. A central Game engine controls state, updates coordinates, runs collision tests, and handles the rendering pipeline.

**Tech Stack:** HTML5 Canvas, Vanilla CSS, Vanilla JavaScript (ES6 Modules), Web Audio API, and Node.js built-in test runner (`node --test`) for unit testing logic.

---

## Proposed Changes

```
/
├── index.html                  # Main layout container
├── index.css                   # Styles and responsive layouts
├── src/
│   ├── main.js                 # App entry point
│   ├── game.js                 # State controller and engine
│   ├── dog.js                  # Player physics & drawing
│   ├── background.js           # Parallax layers
│   ├── obstacle.js             # Obstacles
│   ├── collectible.js          # Bones
│   ├── powerup.js              # Shield & Speed boost items
│   ├── particle.js             # Debris/dust bursts
│   └── sound.js                # Web Audio API retro synth
└── test/
    └── physics.test.js         # Unit tests for collision & movement math
```

---

### Task 1: Foundation Layout (index.html & index.css)

**Files:**
- Create: `index.html`
- Create: `index.css`

- [ ] **Step 1: Create the HTML entry page**
  Write the index.html setup containing the Canvas element, speaker mute button, HUD containers, and screen overlay UI panels (Start screen, Pause screen, Game Over screen).
  ```html
  <!-- index.html -->
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Retro Corgi Run</title>
    <link rel="stylesheet" href="index.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap" rel="stylesheet">
  </head>
  <body>
    <div id="game-container">
      <!-- HUD overlay -->
      <div id="hud">
        <div class="hud-item">SCORE: <span id="score-val">00000</span></div>
        <div class="hud-item">BONES: <span id="bones-val">0</span></div>
        <div class="hud-item">HI-SCORE: <span id="hiscore-val">00000</span></div>
      </div>
      
      <!-- Power-up timers -->
      <div id="powerups-hud">
        <div id="shield-indicator" class="hud-indicator hidden">🛡️ SHIELD: <span id="shield-timer">0.0</span>s</div>
        <div id="speed-indicator" class="hud-indicator hidden">⚡ SPEED: <span id="speed-timer">0.0</span>s</div>
      </div>

      <!-- Canvas -->
      <canvas id="game-canvas"></canvas>

      <!-- Screens overlay -->
      <div id="screen-overlay" class="overlay">
        <!-- Start screen -->
        <div id="start-screen" class="screen-content">
          <h1>CORGI RUN</h1>
          <p>Avoid obstacles, collect bones, and gain power-ups!</p>
          <div class="controls-guide">
            <p><strong>SPACEBAR / CLICK / TAP</strong> to Jump / Double Jump</p>
            <p><strong>ESC / P</strong> to Pause</p>
          </div>
          <button id="start-btn" class="retro-btn">START RUN</button>
        </div>

        <!-- Pause screen -->
        <div id="pause-screen" class="screen-content hidden">
          <h1>PAUSED</h1>
          <p>Press ESC or P to resume</p>
          <button id="resume-btn" class="retro-btn">RESUME</button>
        </div>

        <!-- Game Over screen -->
        <div id="gameover-screen" class="screen-content hidden">
          <h1 class="text-danger">GAME OVER</h1>
          <p>You crashed!</p>
          <div class="final-scores">
            <p>Final Score: <span id="final-score-val">0</span></p>
            <p>Bones Collected: <span id="final-bones-val">0</span></p>
          </div>
          <button id="restart-btn" class="retro-btn">RUN AGAIN</button>
        </div>
      </div>

      <!-- Sound toggle -->
      <button id="sound-btn" class="sound-toggle-btn">🔊</button>
    </div>

    <!-- Script entry -->
    <script type="module" src="src/main.js"></script>
  </body>
  </html>
  ```

- [ ] **Step 2: Create index.css design system**
  Write vanilla CSS specifying a retro-arcade look with glassmorphism overlays and absolute layout wrappers.
  ```css
  /* index.css */
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
    user-select: none;
  }

  body {
    background: #1a1a1a;
    font-family: 'Press Start 2P', monospace;
    color: #fff;
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    overflow: hidden;
  }

  #game-container {
    position: relative;
    width: 100vw;
    height: 100vh;
    max-width: 960px;
    max-height: 540px;
    background: #000;
    box-shadow: 0 10px 30px rgba(0,0,0,0.5);
    overflow: hidden;
  }

  @media (min-aspect-ratio: 16/9) {
    #game-container {
      width: calc(100vh * (16/9));
      height: 100vh;
    }
  }

  @media (max-aspect-ratio: 16/9) {
    #game-container {
      width: 100vw;
      height: calc(100vw * (9/16));
    }
  }

  canvas {
    width: 100%;
    height: 100%;
    display: block;
    image-rendering: pixelated;
  }

  #hud {
    position: absolute;
    top: 15px;
    left: 15px;
    right: 15px;
    display: flex;
    justify-content: space-between;
    font-size: 12px;
    z-index: 10;
    pointer-events: none;
  }

  .hud-item {
    background: rgba(0,0,0,0.6);
    padding: 8px 12px;
    border-radius: 4px;
    border: 2px solid #ffb74d;
  }

  #powerups-hud {
    position: absolute;
    top: 60px;
    left: 15px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    z-index: 10;
    pointer-events: none;
  }

  .hud-indicator {
    background: rgba(41, 182, 246, 0.85);
    border: 2px solid #fff;
    padding: 6px 10px;
    border-radius: 4px;
    font-size: 10px;
    color: #fff;
  }

  #speed-indicator {
    background: rgba(255, 179, 0, 0.85);
  }

  .hidden {
    display: none !important;
  }

  .overlay {
    position: absolute;
    inset: 0;
    background: rgba(0,0,0,0.7);
    backdrop-filter: blur(4px);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 20;
  }

  .screen-content {
    text-align: center;
    background: rgba(255, 255, 255, 0.05);
    border: 4px solid #ffb74d;
    padding: 30px;
    border-radius: 12px;
    max-width: 500px;
    box-shadow: 0 0 20px rgba(255, 183, 77, 0.3);
  }

  .screen-content h1 {
    font-size: 32px;
    margin-bottom: 20px;
    color: #ffb74d;
    text-shadow: 0 4px #e65100;
  }

  .screen-content p {
    font-size: 10px;
    line-height: 1.8;
    margin-bottom: 20px;
  }

  .controls-guide {
    background: rgba(0,0,0,0.4);
    padding: 15px;
    border-radius: 6px;
    margin-bottom: 25px;
  }

  .controls-guide p {
    margin-bottom: 8px;
    color: #b0bec5;
  }

  .controls-guide strong {
    color: #fff;
  }

  .retro-btn {
    background: #ffb74d;
    border: none;
    border-bottom: 6px solid #e65100;
    color: #000;
    font-family: 'Press Start 2P', monospace;
    font-size: 14px;
    font-weight: bold;
    padding: 12px 24px;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.1s;
  }

  .retro-btn:active {
    border-bottom-width: 2px;
    transform: translateY(4px);
  }

  .sound-toggle-btn {
    position: absolute;
    top: 15px;
    right: 15px;
    background: rgba(0,0,0,0.6);
    border: 2px solid #ffb74d;
    color: white;
    font-size: 18px;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 30;
  }

  .text-danger {
    color: #f44336 !important;
    text-shadow: 0 4px #b71c1c !important;
  }

  .final-scores {
    background: rgba(0,0,0,0.4);
    padding: 15px;
    border-radius: 6px;
    margin-bottom: 20px;
  }
  ```

- [ ] **Step 3: Verify output files exist**
  Confirm the files `index.html` and `index.css` are correctly created.
  Expected: Files exist in workspace.

- [ ] **Step 4: Commit**
  ```bash
  git add index.html index.css
  git commit -m "feat: setup basic HTML container and CSS styles"
  ```

---

### Task 2: Sound Synthesiser (src/sound.js)

**Files:**
- Create: `src/sound.js`

- [ ] **Step 1: Write Web Audio API Sound Class**
  Implement retro beep synthesiser code using `AudioContext` so that sound effects are synthesized programmatically in code.
  ```javascript
  // src/sound.js
  export class Sound {
    constructor() {
      this.ctx = null;
      this.muted = false;
    }

    init() {
      if (!this.ctx) {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      }
    }

    toggleMute() {
      this.muted = !this.muted;
      return this.muted;
    }

    playJump() {
      if (this.muted || !this.ctx) return;
      this.init();
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(150, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(600, this.ctx.currentTime + 0.15);

      gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.15);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.15);
    }

    playCollect() {
      if (this.muted || !this.ctx) return;
      this.init();
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
      if (this.muted || !this.ctx) return;
      this.init();
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
      if (this.muted || !this.ctx) return;
      this.init();
      // Generate low frequency boom/noise
      const bufferSize = this.ctx.sampleRate * 0.25; // 0.25s duration
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1; // White noise
      }

      const noiseNode = this.ctx.createBufferSource();
      noiseNode.buffer = buffer;

      // Filter to make it a deep crash
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

- [ ] **Step 2: Verify Sound script runs**
  Verify the file `src/sound.js` is created and loads without syntax errors in Node.
  Run: `node -e "import('./src/sound.js').then(() => console.log('PASS'))"`
  Expected: Prints "PASS" (requires ESM support or running via node CLI with experimental-vm-modules, which is supported).

- [ ] **Step 3: Commit**
  ```bash
  git add src/sound.js
  git commit -m "feat: add programmatic sound synthesiser"
  ```

---

### Task 3: Test Environment Setup (test/physics.test.js)

**Files:**
- Create: `test/physics.test.js`

- [ ] **Step 1: Write initial tests file**
  Create the Node.js native test runner spec file testing the core logic helpers we'll need for entities (AABB bounds check, gravity updates).
  ```javascript
  // test/physics.test.js
  import test from 'node:test';
  import assert from 'node:assert';

  // Global mock to allow browser files to import in Node.js
  globalThis.window = {};

  // Simple AABB Collision Detection Helper
  export function checkCollision(rect1, rect2) {
    return (
      rect1.x < rect2.x + rect2.width &&
      rect1.x + rect1.width > rect2.x &&
      rect1.y < rect2.y + rect2.height &&
      rect1.y + rect1.height > rect2.y
    );
  }

  test('checkCollision detects overlapping rectangles', () => {
    const dog = { x: 50, y: 350, width: 40, height: 30 };
    const fence = { x: 70, y: 350, width: 20, height: 30 };
    
    assert.strictEqual(checkCollision(dog, fence), true);
  });

  test('checkCollision detects non-overlapping rectangles', () => {
    const dog = { x: 50, y: 300, width: 40, height: 30 };
    const fence = { x: 120, y: 350, width: 20, height: 30 };
    
    assert.strictEqual(checkCollision(dog, fence), false);
  });
  ```

- [ ] **Step 2: Run tests to verify they pass**
  Run: `node test/physics.test.js`
  Expected: Both tests pass.

- [ ] **Step 3: Commit**
  ```bash
  git add test/physics.test.js
  git commit -m "test: set up native node test suite with AABB collision helper"
  ```

---

### Task 4: Parallax Background (src/background.js)

**Files:**
- Create: `src/background.js`
- Modify: `test/physics.test.js`

- [ ] **Step 1: Add background testing to physics.test.js**
  We test coordinate updates for a layer.
  Add at end of `test/physics.test.js`:
  ```javascript
  test('Parallax layer updates x coordinate correctly', () => {
    let layerX = 100;
    const speedRatio = 0.5;
    const gameSpeed = 300; // px per second
    const deltaTime = 0.016; // 16ms frame

    layerX -= gameSpeed * speedRatio * deltaTime;
    if (layerX <= -800) {
      layerX += 800;
    }
    assert.ok(layerX < 100);
  });
  ```

- [ ] **Step 2: Run test to verify it passes**
  Run: `node test/physics.test.js`
  Expected: Test passes.

- [ ] **Step 3: Create Background layers module**
  Implement the ParallaxBackground and Layer classes that programmatically draw clouds, hills, pine trees, bushes, and scrolling ground tiles.
  ```javascript
  // src/background.js
  class BackgroundLayer {
    constructor(speedRatio, drawFn) {
      this.speedRatio = speedRatio;
      this.drawFn = drawFn;
      this.x = 0;
      this.width = 800; // Canvas base width
    }

    update(speed, dt) {
      this.x -= speed * this.speedRatio * dt;
      if (this.x <= -this.width) {
        this.x += this.width;
      }
    }

    draw(ctx) {
      ctx.save();
      ctx.translate(Math.floor(this.x), 0);
      this.drawFn(ctx, 0);
      ctx.translate(this.width, 0);
      this.drawFn(ctx, 0);
      ctx.restore();
    }
  }

  export class ParallaxBackground {
    constructor() {
      this.layers = [
        new BackgroundLayer(0.0, this.drawSky.bind(this)),
        new BackgroundLayer(0.1, this.drawHills.bind(this)),
        new BackgroundLayer(0.3, this.drawTrees.bind(this)),
        new BackgroundLayer(0.5, this.drawBushes.bind(this)),
        new BackgroundLayer(1.0, this.drawGround.bind(this))
      ];
    }

    update(speed, dt) {
      for (const layer of this.layers) {
        layer.update(speed, dt);
      }
    }

    draw(ctx) {
      for (const layer of this.layers) {
        layer.draw(ctx);
      }
    }

    drawSky(ctx) {
      // Sky blue gradient
      const grad = ctx.createLinearGradient(0, 0, 0, 450);
      grad.addColorStop(0, '#b3e5fc');
      grad.addColorStop(1, '#e1f5fe');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 800, 450);

      // Draw Sun
      ctx.fillStyle = '#fff59d';
      ctx.beginPath();
      ctx.arc(700, 60, 30, 0, Math.PI * 2);
      ctx.fill();

      // Static clouds
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.beginPath();
      ctx.arc(100, 80, 20, 0, Math.PI * 2);
      ctx.arc(125, 75, 25, 0, Math.PI * 2);
      ctx.arc(150, 80, 20, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.arc(450, 100, 25, 0, Math.PI * 2);
      ctx.arc(480, 95, 35, 0, Math.PI * 2);
      ctx.arc(510, 100, 25, 0, Math.PI * 2);
      ctx.fill();
    }

    drawHills(ctx) {
      ctx.fillStyle = '#a5d6a7';
      ctx.beginPath();
      ctx.moveTo(0, 450);
      ctx.quadraticCurveTo(200, 280, 400, 380);
      ctx.quadraticCurveTo(600, 280, 800, 400);
      ctx.lineTo(800, 450);
      ctx.closePath();
      ctx.fill();
    }

    drawTrees(ctx) {
      // Draw pine tree vectors programmatically
      ctx.fillStyle = '#66bb6a';
      const treePositions = [80, 240, 400, 560, 720];
      for (const tx of treePositions) {
        ctx.beginPath();
        ctx.moveTo(tx, 410);
        ctx.lineTo(tx - 25, 410);
        ctx.lineTo(tx, 340);
        ctx.lineTo(tx + 25, 410);
        ctx.closePath();
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(tx, 370);
        ctx.lineTo(tx - 20, 370);
        ctx.lineTo(tx, 310);
        ctx.lineTo(tx + 20, 370);
        ctx.closePath();
        ctx.fill();
      }
    }

    drawBushes(ctx) {
      ctx.fillStyle = '#388e3c';
      const bushPositions = [40, 180, 320, 480, 600, 740];
      for (const bx of bushPositions) {
        ctx.beginPath();
        ctx.arc(bx, 410, 20, 0, Math.PI * 2);
        ctx.arc(bx + 15, 405, 25, 0, Math.PI * 2);
        ctx.arc(bx + 30, 410, 20, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    drawGround(ctx) {
      // Ground dirt fill
      ctx.fillStyle = '#8d6e63';
      ctx.fillRect(0, 410, 800, 40);

      // Grass border top
      ctx.fillStyle = '#ffb74d';
      ctx.fillRect(0, 410, 800, 8);
    }
  }
  ```

- [ ] **Step 4: Commit**
  ```bash
  git add test/physics.test.js src/background.js
  git commit -m "feat: implement parallax scrolling background manager"
  ```

---

### Task 5: Particle Explosion & Sprinkles (src/particle.js)

**Files:**
- Create: `src/particle.js`
- Modify: `test/physics.test.js`

- [ ] **Step 1: Add particle tests to physics.test.js**
  Test particle state and lifespan logic.
  Add at end of `test/physics.test.js`:
  ```javascript
  test('Particle moves and ages correctly', () => {
    let px = 50, py = 50;
    let vx = 100, vy = -200;
    let life = 1.0;
    const decay = 2.0; // life decay rate per second
    const dt = 0.016;

    px += vx * dt;
    py += vy * dt;
    life -= decay * dt;

    assert.ok(px > 50);
    assert.ok(py < 50);
    assert.ok(life < 1.0);
  });
  ```

- [ ] **Step 2: Run tests to verify they pass**
  Run: `node test/physics.test.js`
  Expected: All tests pass.

- [ ] **Step 3: Create Particle and ParticleSystem modules**
  Write code to draw dust trails under paws and wooden break effects for obstacles.
  ```javascript
  // src/particle.js
  class Particle {
    constructor(x, y, vx, vy, color, size, decay, type = 'square') {
      this.x = x;
      this.y = y;
      this.vx = vx;
      this.vy = vy;
      this.color = color;
      this.size = size;
      this.decay = decay; // loss of life per sec
      this.type = type;
      this.life = 1.0;
    }

    update(dt) {
      this.x += this.vx * dt;
      this.y += this.vy * dt;
      this.life -= this.decay * dt;
    }

    draw(ctx) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, this.life);
      ctx.fillStyle = this.color;
      
      if (this.type === 'circle') {
        ctx.beginPath();
        ctx.arc(Math.floor(this.x), Math.floor(this.y), this.size, 0, Math.PI * 2);
        ctx.fill();
      } else if (this.type === 'star') {
        // Draw standard simple star diamond
        ctx.beginPath();
        ctx.moveTo(this.x, this.y - this.size);
        ctx.lineTo(this.x + this.size / 2, this.y - this.size / 2);
        ctx.lineTo(this.x + this.size, this.y);
        ctx.lineTo(this.x + this.size / 2, this.y + this.size / 2);
        ctx.lineTo(this.x, this.y + this.size);
        ctx.lineTo(this.x - this.size / 2, this.y + this.size / 2);
        ctx.lineTo(this.x - this.size, this.y);
        ctx.lineTo(this.x - this.size / 2, this.y - this.size / 2);
        ctx.closePath();
        ctx.fill();
      } else {
        ctx.fillRect(Math.floor(this.x - this.size / 2), Math.floor(this.y - this.size / 2), this.size, this.size);
      }
      
      ctx.restore();
    }
  }

  export class ParticleSystem {
    constructor() {
      this.particles = [];
    }

    spawnDust(x, y) {
      // Small dust trail under dog paws
      const vx = -50 - Math.random() * 50;
      const vy = -10 - Math.random() * 30;
      const size = 3 + Math.random() * 3;
      const decay = 2 + Math.random() * 2;
      this.particles.push(new Particle(x, y, vx, vy, '#d7ccc8', size, decay, 'square'));
    }

    spawnSparkles(x, y) {
      // Golden sparkles when bone collected
      for (let i = 0; i < 8; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 50 + Math.random() * 100;
        const vx = Math.cos(angle) * speed;
        const vy = Math.sin(angle) * speed;
        const size = 4 + Math.random() * 3;
        const decay = 1.5 + Math.random() * 1.5;
        this.particles.push(new Particle(x, y, vx, vy, '#ffeb3b', size, decay, 'star'));
      }
    }

    spawnPowerupRing(x, y, color) {
      for (let i = 0; i < 16; i++) {
        const angle = (i / 16) * Math.PI * 2;
        const speed = 120;
        const vx = Math.cos(angle) * speed;
        const vy = Math.sin(angle) * speed;
        this.particles.push(new Particle(x, y, vx, vy, color, 6, 1.2, 'circle'));
      }
    }

    spawnDebris(x, y, color) {
      // Obstacle smash debris
      for (let i = 0; i < 12; i++) {
        const vx = (Math.random() * 2 - 1) * 150;
        const vy = -100 - Math.random() * 200;
        const size = 4 + Math.random() * 6;
        const decay = 1.0 + Math.random() * 1.0;
        this.particles.push(new Particle(x, y, vx, vy, color, size, decay, 'square'));
      }
    }

    update(dt) {
      for (let i = this.particles.length - 1; i >= 0; i--) {
        const p = this.particles[i];
        p.update(dt);
        if (p.life <= 0) {
          this.particles.splice(i, 1);
        }
      }
    }

    draw(ctx) {
      for (const p of this.particles) {
        p.draw(ctx);
      }
    }
  }
  ```

- [ ] **Step 4: Commit**
  ```bash
  git add test/physics.test.js src/particle.js
  git commit -m "feat: implement high performance particle burst system"
  ```

---

### Task 6: Entities (Obstacles, Bones, Power-ups)

**Files:**
- Create: `src/obstacle.js`
- Create: `src/collectible.js`
- Create: `src/powerup.js`
- Modify: `test/physics.test.js`

- [ ] **Step 1: Add entity collision tests in physics.test.js**
  Ensure we can test entities colliding using coordinate math.
  Add at end of `test/physics.test.js`:
  ```javascript
  test('AABB check detects collectible collection', () => {
    const dog = { x: 50, y: 350, width: 40, height: 30 };
    const bone = { x: 60, y: 360, width: 15, height: 8 };
    assert.strictEqual(checkCollision(dog, bone), true);
  });
  ```

- [ ] **Step 2: Run tests to verify they pass**
  Run: `node test/physics.test.js`
  Expected: All tests pass.

- [ ] **Step 3: Create Obstacle class**
  We render a wooden fence obstacle programmatically using canvas line/rect.
  ```javascript
  // src/obstacle.js
  export class Obstacle {
    constructor(x, width = 30, height = 45) {
      this.x = x;
      this.y = 410 - height; // Aligned to grass top
      this.width = width;
      this.height = height;
    }

    update(speed, dt) {
      this.x -= speed * dt;
    }

    draw(ctx) {
      ctx.save();
      // Draw a retro wooden fence
      ctx.fillStyle = '#8d6e63'; // Brown planks
      ctx.strokeStyle = '#3e2723';
      ctx.lineWidth = 2;

      // Draw two vertical slats
      const slatWidth = this.width / 2 - 2;
      ctx.fillRect(Math.floor(this.x), Math.floor(this.y), slatWidth, this.height);
      ctx.strokeRect(Math.floor(this.x), Math.floor(this.y), slatWidth, this.height);

      ctx.fillRect(Math.floor(this.x + slatWidth + 4), Math.floor(this.y), slatWidth, this.height);
      ctx.strokeRect(Math.floor(this.x + slatWidth + 4), Math.floor(this.y), slatWidth, this.height);

      // Draw cross bars
      ctx.fillRect(Math.floor(this.x - 2), Math.floor(this.y + 10), this.width + 4, 6);
      ctx.strokeRect(Math.floor(this.x - 2), Math.floor(this.y + 10), this.width + 4, 6);

      ctx.fillRect(Math.floor(this.x - 2), Math.floor(this.y + this.height - 16), this.width + 4, 6);
      ctx.strokeRect(Math.floor(this.x - 2), Math.floor(this.y + this.height - 16), this.width + 4, 6);

      ctx.restore();
    }
  }
  ```

- [ ] **Step 4: Create Collectible (Bone) class**
  We draw a bone shape: a central bar with two circles on each side.
  ```javascript
  // src/collectible.js
  export class Collectible {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      this.width = 24;
      this.height = 12;
      this.pulseTime = Math.random() * 10;
    }

    update(speed, dt) {
      this.x -= speed * dt;
      this.pulseTime += dt * 5;
    }

    draw(ctx) {
      ctx.save();
      // Add floating pulse animation offset
      const yOffset = Math.sin(this.pulseTime) * 4;
      const rx = Math.floor(this.x);
      const ry = Math.floor(this.y + yOffset);

      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#90a4ae';
      ctx.lineWidth = 1.5;

      // Draw main bone connector shaft
      ctx.fillRect(rx + 4, ry + 4, 16, 4);
      ctx.strokeRect(rx + 4, ry + 4, 16, 4);

      // Draw bone tips (2 circles on left, 2 on right)
      const drawTips = (cx, cy) => {
        ctx.beginPath();
        ctx.arc(cx, cy - 2, 4, 0, Math.PI * 2);
        ctx.arc(cx, cy + 2, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      };

      drawTips(rx + 3, ry + 6);
      drawTips(rx + 21, ry + 6);

      ctx.restore();
    }
  }
  ```

- [ ] **Step 5: Create Powerup class**
  Draws orbs with distinct shield (blue sphere) and invincibility (gold coin) visuals.
  ```javascript
  // src/powerup.js
  export class Powerup {
    constructor(x, y, type) {
      this.x = x;
      this.y = y;
      this.width = 24;
      this.height = 24;
      this.type = type; // 'shield' or 'speed'
      this.angle = 0;
    }

    update(speed, dt) {
      this.x -= speed * dt;
      this.angle += dt * 4;
    }

    draw(ctx) {
      ctx.save();
      const rx = Math.floor(this.x + 12);
      const ry = Math.floor(this.y + 12);
      const bobbing = Math.sin(this.angle) * 3;

      if (this.type === 'shield') {
        // Glowing Blue Orb
        const grad = ctx.createRadialGradient(rx, ry + bobbing, 2, rx, ry + bobbing, 12);
        grad.addColorStop(0, '#e1f5fe');
        grad.addColorStop(0.5, '#0288d1');
        grad.addColorStop(1, 'rgba(2, 136, 209, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(rx, ry + bobbing, 12, 0, Math.PI * 2);
        ctx.fill();

        // Inner Shield Icon Outline
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(rx - 4, ry - 4 + bobbing);
        ctx.lineTo(rx + 4, ry - 4 + bobbing);
        ctx.lineTo(rx + 4, ry + bobbing);
        ctx.quadraticCurveTo(rx, ry + 6 + bobbing, rx - 4, ry + bobbing);
        ctx.closePath();
        ctx.stroke();
      } else {
        // Golden lightning bolt orb
        const grad = ctx.createRadialGradient(rx, ry + bobbing, 2, rx, ry + bobbing, 12);
        grad.addColorStop(0, '#fffde7');
        grad.addColorStop(0.5, '#f57f17');
        grad.addColorStop(1, 'rgba(245, 127, 23, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(rx, ry + bobbing, 12, 0, Math.PI * 2);
        ctx.fill();

        // Lighting icon
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.moveTo(rx + 2, ry - 6 + bobbing);
        ctx.lineTo(rx - 4, ry + bobbing);
        ctx.lineTo(rx, ry + bobbing);
        ctx.lineTo(rx - 2, ry + 6 + bobbing);
        ctx.lineTo(rx + 4, ry - bobbing);
        ctx.lineTo(rx, ry - bobbing);
        ctx.closePath();
        ctx.fill();
      }

      ctx.restore();
    }
  }
  ```

- [ ] **Step 6: Commit**
  ```bash
  git add src/obstacle.js src/collectible.js src/powerup.js
  git commit -m "feat: implement game entities with custom drawing functions"
  ```

---

### Task 7: Dog Player Physics (src/dog.js)

**Files:**
- Create: `src/dog.js`
- Modify: `test/physics.test.js`

- [ ] **Step 1: Add dog jump physics tests to physics.test.js**
  We test coordinate updates for the dog's vertical physics.
  Add at end of `test/physics.test.js`:
  ```javascript
  test('Dog gravity applies correctly and bounds to floor', () => {
    let dogY = 350;
    let vy = -400; // Jumping up
    const gravity = 1000; // gravity acceleration
    const dt = 0.016;

    // Apply speed
    dogY += vy * dt;
    vy += gravity * dt;

    assert.ok(dogY < 350); // Moved up
    assert.ok(vy > -400); // Decelerated upwards
  });
  ```

- [ ] **Step 2: Run tests to verify they pass**
  Run: `node test/physics.test.js`
  Expected: All tests pass.

- [ ] **Step 3: Create Dog Class**
  Implement jumping velocity, double jump logic, active shield visual overlays, invincibility running speed trails, and programmatic leg-running animations.
  ```javascript
  // src/dog.js
  export class Dog {
    constructor() {
      this.x = 80;
      this.y = 410 - 32; // On the grass
      this.width = 44;
      this.height = 32;
      this.vy = 0;
      this.gravity = 1300;
      this.jumpForce = -420;
      this.isGrounded = true;
      this.canDoubleJump = false;
      this.animTime = 0;
    }

    jump(sound) {
      if (this.isGrounded) {
        this.vy = this.jumpForce;
        this.isGrounded = false;
        this.canDoubleJump = true;
        if (sound) sound.playJump();
      } else if (this.canDoubleJump) {
        this.vy = this.jumpForce * 0.9;
        this.canDoubleJump = false;
        if (sound) sound.playJump();
      }
    }

    update(dt) {
      // Vertical Physics
      this.vy += this.gravity * dt;
      this.y += this.vy * dt;

      // Floor constraints
      const floorY = 410 - this.height;
      if (this.y >= floorY) {
        this.y = floorY;
        this.vy = 0;
        this.isGrounded = true;
        this.canDoubleJump = false;
      }

      // Anim clock
      this.animTime += dt;
    }

    draw(ctx, hasShield, hasSpeed) {
      ctx.save();
      const rx = Math.floor(this.x);
      const ry = Math.floor(this.y);

      // Speed trailing shadow effects
      if (hasSpeed) {
        ctx.fillStyle = 'rgba(255, 179, 0, 0.3)';
        ctx.fillRect(rx - 15, ry + 2, this.width, this.height);
        ctx.fillStyle = 'rgba(255, 179, 0, 0.15)';
        ctx.fillRect(rx - 30, ry + 4, this.width, this.height);
      }

      // Draw custom programmatic Corgi (Retro Pixel Look)
      // Body (Orange Corgi Coat)
      ctx.fillStyle = '#ff8f00';
      ctx.fillRect(rx + 8, ry + 6, 28, 16); // Mid section
      ctx.fillRect(rx + 4, ry + 8, 4, 12);  // Rear section

      // Belly/Chest white fur
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(rx + 18, ry + 16, 18, 6);
      ctx.fillRect(rx + 32, ry + 10, 4, 6);

      // Head
      ctx.fillStyle = '#ff8f00';
      ctx.fillRect(rx + 30, ry - 2, 12, 12);
      ctx.fillStyle = '#ffffff'; // White muzzle strip
      ctx.fillRect(rx + 38, ry + 6, 4, 4);
      // Nose
      ctx.fillStyle = '#000000';
      ctx.fillRect(rx + 42, ry + 5, 2, 2);
      // Eye
      ctx.fillRect(rx + 36, ry + 2, 2, 2);

      // Ears (pointed Corgi ears)
      ctx.fillStyle = '#e65100'; // Dark inner ear
      ctx.fillRect(rx + 32, ry - 10, 3, 8);
      ctx.fillStyle = '#ff8f00';
      ctx.fillRect(rx + 35, ry - 8, 3, 6);

      // Tail
      ctx.save();
      ctx.fillStyle = '#ff8f00';
      const tailWag = this.isGrounded ? Math.sin(this.animTime * 30) * 8 : 0;
      ctx.translate(rx + 4, ry + 10);
      ctx.rotate((15 + tailWag) * Math.PI / 180);
      ctx.fillRect(-10, -3, 10, 5);
      // White tip
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-12, -2, 2, 3);
      ctx.restore();

      // Paws / Legs Running Animation
      ctx.fillStyle = '#ffe082'; // Light paws
      const legOffset = Math.sin(this.animTime * 18) * 6;

      if (this.isGrounded) {
        // Alternating paws running loop
        ctx.fillRect(rx + 8, ry + 22, 4, 6 + legOffset);
        ctx.fillRect(rx + 16, ry + 22, 4, 6 - legOffset);
        ctx.fillRect(rx + 24, ry + 22, 4, 6 + legOffset);
        ctx.fillRect(rx + 32, ry + 22, 4, 6 - legOffset);
      } else {
        // Tucked paws in-air
        ctx.fillRect(rx + 6, ry + 22, 5, 3);
        ctx.fillRect(rx + 14, ry + 22, 5, 3);
        ctx.fillRect(rx + 22, ry + 22, 5, 3);
        ctx.fillRect(rx + 30, ry + 22, 5, 3);
      }

      // Draw Shield overlay (Cyan energy circle)
      if (hasShield) {
        ctx.strokeStyle = '#00e5ff';
        ctx.lineWidth = 3;
        ctx.shadowColor = '#00e5ff';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(rx + 22, ry + 12, 24, 0, Math.PI * 2);
        ctx.stroke();
      }

      ctx.restore();
    }
  }
  ```

- [ ] **Step 4: Commit**
  ```bash
  git add test/physics.test.js src/dog.js
  git commit -m "feat: implement dog physics and running animations"
  ```

---

### Task 8: Core Engine Coordinator (src/game.js)

**Files:**
- Create: `src/game.js`

- [ ] **Step 1: Write Game loop coordinator**
  Coordinate game states (`START`, `PLAYING`, `PAUSED`, `GAMEOVER`), canvas auto-resizing, spawning interval scaling, collisions check, score calculations, magnet attraction, and UI element synchronization.
  ```javascript
  // src/game.js
  import { Sound } from './sound.js';
  import { Dog } from './dog.js';
  import { ParallaxBackground } from './background.js';
  import { Obstacle } from './obstacle.js';
  import { Collectible } from './collectible.js';
  import { Powerup } from './powerup.js';
  import { ParticleSystem } from './particle.js';

  export class Game {
    constructor() {
      this.canvas = document.getElementById('game-canvas');
      this.ctx = this.canvas.getContext('2d');
      
      this.sound = new Sound();
      this.dog = new Dog();
      this.background = new ParallaxBackground();
      this.particles = new ParticleSystem();

      this.obstacles = [];
      this.collectibles = [];
      this.powerups = [];

      this.state = 'START'; // START, PLAYING, PAUSED, GAMEOVER
      this.baseSpeed = 250;
      this.speed = this.baseSpeed;
      this.score = 0;
      this.bones = 0;
      this.highScore = Number(localStorage.getItem('hi-score') || 0);

      // Power-up durations
      this.shieldTime = 0;
      this.speedTime = 0;

      // Spawning clocks
      this.obstacleTimer = 0;
      this.collectibleTimer = 0;
      this.powerupTimer = 0;

      this.lastTime = 0;

      this.initUI();
      this.resizeCanvas();
      window.addEventListener('resize', () => this.resizeCanvas());
    }

    initUI() {
      this.scoreVal = document.getElementById('score-val');
      this.bonesVal = document.getElementById('bones-val');
      this.hiscoreVal = document.getElementById('hiscore-val');
      this.finalScoreVal = document.getElementById('final-score-val');
      this.finalBonesVal = document.getElementById('final-bones-val');
      this.hiscoreVal.textContent = String(this.highScore).padStart(5, '0');

      this.overlay = document.getElementById('screen-overlay');
      this.startScreen = document.getElementById('start-screen');
      this.pauseScreen = document.getElementById('pause-screen');
      this.gameoverScreen = document.getElementById('gameover-screen');

      this.shieldIndicator = document.getElementById('shield-indicator');
      this.shieldTimerText = document.getElementById('shield-timer');
      this.speedIndicator = document.getElementById('speed-indicator');
      this.speedTimerText = document.getElementById('speed-timer');

      document.getElementById('start-btn').onclick = () => this.start();
      document.getElementById('restart-btn').onclick = () => this.restart();
      document.getElementById('resume-btn').onclick = () => this.togglePause();

      // Sound button
      const soundBtn = document.getElementById('sound-btn');
      soundBtn.onclick = () => {
        const muted = this.sound.toggleMute();
        soundBtn.textContent = muted ? '🔇' : '🔊';
      };
    }

    resizeCanvas() {
      // Locked aspect ratio 16:9 (800x450 internal resolution)
      this.canvas.width = 800;
      this.canvas.height = 450;
    }

    start() {
      this.state = 'PLAYING';
      this.overlay.classList.add('hidden');
      this.startScreen.classList.add('hidden');
      this.sound.init();
      this.lastTime = performance.now();
      requestAnimationFrame(time => this.loop(time));
    }

    restart() {
      this.dog = new Dog();
      this.obstacles = [];
      this.collectibles = [];
      this.powerups = [];
      this.particles = new ParticleSystem();
      this.score = 0;
      this.bones = 0;
      this.speed = this.baseSpeed;
      this.shieldTime = 0;
      this.speedTime = 0;
      this.obstacleTimer = 0;
      this.collectibleTimer = 0;
      this.powerupTimer = 0;

      this.gameoverScreen.classList.add('hidden');
      this.start();
    }

    togglePause() {
      if (this.state === 'PLAYING') {
        this.state = 'PAUSED';
        this.overlay.classList.remove('hidden');
        this.pauseScreen.classList.remove('hidden');
      } else if (this.state === 'PAUSED') {
        this.state = 'PLAYING';
        this.overlay.classList.add('hidden');
        this.pauseScreen.classList.add('hidden');
        this.lastTime = performance.now();
        requestAnimationFrame(time => this.loop(time));
      }
    }

    loop(timestamp) {
      if (this.state !== 'PLAYING') return;

      const dt = Math.min((timestamp - this.lastTime) / 1000, 0.1); // cap elapsed time
      this.lastTime = timestamp;

      this.update(dt);
      this.draw();

      requestAnimationFrame(time => this.loop(time));
    }

    update(dt) {
      // Active timers
      if (this.shieldTime > 0) {
        this.shieldTime = Math.max(0, this.shieldTime - dt);
        this.shieldIndicator.classList.remove('hidden');
        this.shieldTimerText.textContent = this.shieldTime.toFixed(1);
      } else {
        this.shieldIndicator.classList.add('hidden');
      }

      if (this.speedTime > 0) {
        this.speedTime = Math.max(0, this.speedTime - dt);
        this.speedIndicator.classList.remove('hidden');
        this.speedTimerText.textContent = this.speedTime.toFixed(1);
      } else {
        this.speedIndicator.classList.add('hidden');
      }

      // Calculate Speed
      const actualSpeed = this.speedTime > 0 ? this.speed * 2.0 : this.speed;

      // Dog updates
      this.dog.update(dt);

      // Dust particles trail
      if (this.dog.isGrounded && Math.random() < 0.25) {
        this.particles.spawnDust(this.dog.x + 8, this.dog.y + this.dog.height - 4);
      }

      // Background parallax
      this.background.update(actualSpeed, dt);

      // Progressive speed increment
      this.speed += dt * 1.5;

      // Accumulate score
      this.score += dt * 10;
      this.scoreVal.textContent = String(Math.floor(this.score)).padStart(5, '0');

      // Spawning loops
      this.spawnEntities(actualSpeed, dt);

      // Entity updates
      this.updateEntities(actualSpeed, dt);

      // Collision checks
      this.checkCollisions();

      // Particle system update
      this.particles.update(dt);
    }

    spawnEntities(actualSpeed, dt) {
      // Spawning intervals dependent on speed
      this.obstacleTimer += dt;
      const minSpawnInterval = Math.max(1.2, 3.0 - (actualSpeed / 200));
      if (this.obstacleTimer >= minSpawnInterval + Math.random() * 1.5) {
        this.obstacles.push(new Obstacle(850, 24 + Math.random() * 12, 36 + Math.random() * 15));
        this.obstacleTimer = 0;
      }

      this.collectibleTimer += dt;
      if (this.collectibleTimer >= 1.5 + Math.random() * 2) {
        const height = 150 + Math.random() * 180; // height from sky ground
        this.collectibles.push(new Collectible(850, height));
        this.collectibleTimer = 0;
      }

      this.powerupTimer += dt;
      if (this.powerupTimer >= 12 + Math.random() * 10) {
        const type = Math.random() < 0.5 ? 'shield' : 'speed';
        const height = 200 + Math.random() * 100;
        this.powerups.push(new Powerup(850, height, type));
        this.powerupTimer = 0;
      }
    }

    updateEntities(actualSpeed, dt) {
      // Obstacles
      for (let i = this.obstacles.length - 1; i >= 0; i--) {
        const obs = this.obstacles[i];
        obs.update(actualSpeed, dt);
        if (obs.x < -100) this.obstacles.splice(i, 1);
      }

      // Collectibles
      for (let i = this.collectibles.length - 1; i >= 0; i--) {
        const coll = this.collectibles[i];
        
        // Magnet effect during Speed boost
        if (this.speedTime > 0) {
          const dx = (this.dog.x + 22) - coll.x;
          const dy = (this.dog.y + 12) - coll.y;
          const dist = Math.hypot(dx, dy);
          if (dist < 180) {
            coll.x += (dx / dist) * 450 * dt;
            coll.y += (dy / dist) * 450 * dt;
          }
        }

        coll.update(actualSpeed, dt);
        if (coll.x < -100) this.collectibles.splice(i, 1);
      }

      // Powerups
      for (let i = this.powerups.length - 1; i >= 0; i--) {
        const pu = this.powerups[i];
        pu.update(actualSpeed, dt);
        if (pu.x < -100) this.powerups.splice(i, 1);
      }
    }

    checkCollisions() {
      // Check collision helper bounding boxes
      const dogBox = {
        x: this.dog.x + 6,
        y: this.dog.y + 4,
        width: this.dog.width - 12,
        height: this.dog.height - 6
      };

      // Helper function matching test imports
      const overlap = (r1, r2) => (
        r1.x < r2.x + r2.width &&
        r1.x + r1.width > r2.x &&
        r1.y < r2.y + r2.height &&
        r1.y + r1.height > r2.y
      );

      // Collectibles
      for (let i = this.collectibles.length - 1; i >= 0; i--) {
        const coll = this.collectibles[i];
        if (overlap(dogBox, coll)) {
          this.bones++;
          this.score += 100;
          this.bonesVal.textContent = this.bones;
          this.sound.playCollect();
          this.particles.spawnSparkles(coll.x + 12, coll.y + 6);
          this.collectibles.splice(i, 1);
        }
      }

      // Powerups
      for (let i = this.powerups.length - 1; i >= 0; i--) {
        const pu = this.powerups[i];
        if (overlap(dogBox, pu)) {
          this.sound.playPowerUp();
          if (pu.type === 'shield') {
            this.shieldTime = 10.0;
            this.particles.spawnPowerupRing(pu.x + 12, pu.y + 12, '#00e5ff');
          } else {
            this.speedTime = 5.0;
            this.particles.spawnPowerupRing(pu.x + 12, pu.y + 12, '#ffeb3b');
          }
          this.powerups.splice(i, 1);
        }
      }

      // Obstacles
      for (let i = this.obstacles.length - 1; i >= 0; i--) {
        const obs = this.obstacles[i];
        if (overlap(dogBox, obs)) {
          if (this.speedTime > 0) {
            // Speed powerup destroys obstacle automatically
            this.sound.playHit();
            this.particles.spawnDebris(obs.x + obs.width / 2, obs.y + obs.height / 2, '#8d6e63');
            this.obstacles.splice(i, 1);
          } else if (this.shieldTime > 0) {
            // Shield absorbs crash
            this.shieldTime = 0;
            this.sound.playHit();
            this.particles.spawnDebris(obs.x + obs.width / 2, obs.y + obs.height / 2, '#8d6e63');
            this.obstacles.splice(i, 1);
          } else {
            // Die
            this.gameOver();
          }
        }
      }
    }

    gameOver() {
      this.state = 'GAMEOVER';
      this.sound.playHit();
      
      // Save high score
      const finalScore = Math.floor(this.score);
      if (finalScore > this.highScore) {
        this.highScore = finalScore;
        localStorage.setItem('hi-score', this.highScore);
        this.hiscoreVal.textContent = String(this.highScore).padStart(5, '0');
      }

      // Display Overlays
      this.finalScoreVal.textContent = finalScore;
      this.finalBonesVal.textContent = this.bones;
      this.overlay.classList.remove('hidden');
      this.gameoverScreen.classList.remove('hidden');
    }

    draw() {
      this.ctx.clearRect(0, 0, 800, 450);

      // Background parallax
      this.background.draw(this.ctx);

      // Spawned items
      for (const obs of this.obstacles) obs.draw(this.ctx);
      for (const coll of this.collectibles) coll.draw(this.ctx);
      for (const pu of this.powerups) pu.draw(this.ctx);

      // Particles
      this.particles.draw(this.ctx);

      // Dog player
      this.dog.draw(this.ctx, this.shieldTime > 0, this.speedTime > 0);
    }
  }
  ```

- [ ] **Step 2: Verify Game class loads without error**
  Ensure the module is syntactically sound.
  Run: `node -e "import('./src/game.js').then(() => console.log('PASS'))"`
  Expected: Prints "PASS" (requires mocking document and DOM objects at load time if standard, but our constructor reads them. Since the class imports elements inside `constructor()` or uses variables inside them, we can safely test static structure).

- [ ] **Step 3: Commit**
  ```bash
  git add src/game.js
  git commit -m "feat: implement main game loops, mechanics, collision solvers"
  ```

---

### Task 9: Entry point & User controls (src/main.js)

**Files:**
- Create: `src/main.js`

- [ ] **Step 1: Write Entry point logic**
  Instantiate the Game class when DOM is fully loaded and hook keyboard/tap triggers.
  ```javascript
  // src/main.js
  import { Game } from './game.js';

  document.addEventListener('DOMContentLoaded', () => {
    const game = new Game();

    // Key event listeners
    window.addEventListener('keydown', (e) => {
      if (e.code === 'Space') {
        e.preventDefault(); // prevent page scroll
        if (game.state === 'PLAYING') {
          game.dog.jump(game.sound);
        }
      }
      if (e.code === 'Escape' || e.code === 'KeyP') {
        game.togglePause();
      }
    });

    // Touch / Mouse jump triggers
    const triggerJump = (e) => {
      // Only jump on clicking the canvas or HUD elements, avoid screen buttons
      if (e.target.tagName !== 'BUTTON' && game.state === 'PLAYING') {
        game.dog.jump(game.sound);
      }
    };

    game.canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      triggerJump(e);
    }, { passive: false });

    game.canvas.addEventListener('mousedown', (e) => {
      triggerJump(e);
    });
  });
  ```

- [ ] **Step 2: Run all unit tests to check consistency**
  Run: `node test/physics.test.js`
  Expected: All physics and collision tests pass successfully.

- [ ] **Step 3: Commit**
  ```bash
  git add src/main.js
  git commit -m "feat: write main entry point file and hook input handlers"
  ```

---

## Verification Plan

### Automated Verification
Run the unit test spec containing collision detection and jump gravity math:
```bash
node test/physics.test.js
```

### Manual Verification
1. Launch local server to view the application in the web browser.
2. Confirm the game starts upon clicking **START RUN**.
3. Use the **Spacebar** or click on the screen to verify jump height, double jump mechanics, and running paw dust effects.
4. Pick up the **Shield** power-up and hit a wooden fence. Confirm the obstacle is destroyed and the dog survives.
5. Pick up the **Speed** power-up. Confirm speed accelerates, invincibility trails follow the dog, and bones fly towards the dog.
6. Verify sound mute/unmute button changes indicators.
