import { Dog } from './dog.js';
import { Background } from './background.js';
import { ParticleSystem } from './particle.js';
import { Sound } from './sound.js';
import { checkCollision } from './physics.js';
import { Obstacle } from './obstacle.js';
import { Collectible } from './collectible.js';
import { PowerUp } from './powerup.js';

export class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.canvas.width = 960;
    this.canvas.height = 540;
    this.ctx = this.canvas.getContext('2d');
    
    // Core game components
    this.background = new Background();
    this.dog = new Dog(460); // Ground is fixed Y = 460
    this.particles = new ParticleSystem();
    this.sound = new Sound();
    
    // States and configurations
    this.state = 'START'; // 'START', 'PLAYING', 'PAUSED', 'GAMEOVER'
    this.score = 0;
    this.bones = 0;
    
    let storedHi = '0';
    if (typeof localStorage !== 'undefined') {
      storedHi = localStorage.getItem('corgi_run_hiscore') || '0';
    }
    this.highScore = parseInt(storedHi, 10);
    
    this.baseSpeed = 350; // px/s
    this.gameSpeed = 350;
    
    // Entities
    this.obstacles = [];
    this.collectibles = [];
    this.powerups = [];
    
    // Spawning timers (seconds remaining until next spawn)
    this.obstacleSpawnTimer = this.getRandomRange(1.5, 2.8);
    this.collectibleSpawnTimer = this.getRandomRange(1.0, 1.8);
    this.powerupSpawnTimer = this.getRandomRange(12, 18);
    
    this.scoreTimer = 0;
    this.dustTimer = 0;
    this.lastTime = 0;
    
    // Init DOM handles
    this.initDOMElements();
    // Register listeners
    this.bindEvents();
    // Update display values
    this.updateHUD(false);
    // Explicitly show initial start screen
    this.showScreen('START');
  }

  initDOMElements() {
    if (typeof document === 'undefined') return;
    this.dom = {
      score: document.getElementById('score-val'),
      bones: document.getElementById('bones-val'),
      hiscore: document.getElementById('hiscore-val'),
      shieldIndicator: document.getElementById('shield-indicator'),
      shieldTimer: document.getElementById('shield-timer'),
      speedIndicator: document.getElementById('speed-indicator'),
      speedTimer: document.getElementById('speed-timer'),
      overlay: document.getElementById('screen-overlay'),
      startScreen: document.getElementById('start-screen'),
      pauseScreen: document.getElementById('pause-screen'),
      gameoverScreen: document.getElementById('gameover-screen'),
      finalScore: document.getElementById('final-score-val'),
      finalBones: document.getElementById('final-bones-val'),
      startBtn: document.getElementById('start-btn'),
      resumeBtn: document.getElementById('resume-btn'),
      restartBtn: document.getElementById('restart-btn'),
      soundBtn: document.getElementById('sound-btn')
    };
  }

  bindEvents() {
    if (typeof window === 'undefined') return;
    
    // Key bindings
    window.addEventListener('keydown', (e) => {
      if (this.state === 'PLAYING') {
        if (e.code === 'Space' || e.code === 'ArrowUp' || e.key === 'w' || e.key === 'W' || e.code === 'KeyW') {
          e.preventDefault();
          const jumped = this.dog.jump();
          if (jumped) this.sound.playJump();
        }
        if (e.code === 'Escape' || e.key === 'p' || e.key === 'P') {
          e.preventDefault();
          this.pause();
        }
      } else if (this.state === 'PAUSED') {
        if (e.code === 'Escape' || e.key === 'p' || e.key === 'P') {
          e.preventDefault();
          this.resume();
        }
      }
    });

    // Pointer jump support
    this.canvas.addEventListener('pointerdown', (e) => {
      if (this.state === 'PLAYING') {
        e.preventDefault();
        const jumped = this.dog.jump();
        if (jumped) this.sound.playJump();
      }
    });

    // Screen button events
    if (this.dom.startBtn) {
      this.dom.startBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.start();
      });
    }
    if (this.dom.resumeBtn) {
      this.dom.resumeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.resume();
      });
    }
    if (this.dom.restartBtn) {
      this.dom.restartBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.restart();
      });
    }
    if (this.dom.soundBtn) {
      this.dom.soundBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleMute();
      });
    }
  }

  getRandomRange(min, max) {
    return min + Math.random() * (max - min);
  }

  start() {
    if (this.state === 'START') {
      this.state = 'PLAYING';
      this.showScreen('PLAYING');
      this.sound.init();
      this.sound.playMusic();
      this.lastTime = performance.now();
      requestAnimationFrame((t) => this.loop(t));
    }
  }

  pause() {
    if (this.state === 'PLAYING') {
      this.state = 'PAUSED';
      this.showScreen('PAUSED');
      this.sound.pauseMusic();
    }
  }

  resume() {
    if (this.state === 'PAUSED') {
      this.state = 'PLAYING';
      this.showScreen('PLAYING');
      this.sound.playMusic();
      this.lastTime = performance.now();
      requestAnimationFrame((t) => this.loop(t));
    }
  }

  restart() {
    this.score = 0;
    this.bones = 0;
    this.gameSpeed = this.baseSpeed;
    this.obstacles = [];
    this.collectibles = [];
    this.powerups = [];
    this.particles.particles = [];
    
    this.dog = new Dog(460);
    this.obstacleSpawnTimer = this.getRandomRange(1.5, 2.8);
    this.collectibleSpawnTimer = this.getRandomRange(1.0, 1.8);
    this.powerupSpawnTimer = this.getRandomRange(12, 18);
    
    this.scoreTimer = 0;
    this.dustTimer = 0;
    
    this.state = 'PLAYING';
    this.showScreen('PLAYING');
    this.updateHUD(false);
    this.sound.stopMusic();
    this.sound.playMusic();
    this.lastTime = performance.now();
    requestAnimationFrame((t) => this.loop(t));
  }

  toggleMute() {
    const isMuted = this.sound.toggleMute();
    if (typeof document !== 'undefined' && this.dom.soundBtn) {
      this.dom.soundBtn.textContent = isMuted ? '🔇' : '🔊';
    }
  }

  showScreen(screenName) {
    if (typeof document === 'undefined' || !this.dom) return;
    
    // Hide screens initially
    this.dom.startScreen.classList.add('hidden');
    this.dom.pauseScreen.classList.add('hidden');
    this.dom.gameoverScreen.classList.add('hidden');
    
    if (screenName === 'START') {
      this.dom.overlay.classList.remove('hidden');
      this.dom.startScreen.classList.remove('hidden');
    } else if (screenName === 'PAUSED') {
      this.dom.overlay.classList.remove('hidden');
      this.dom.pauseScreen.classList.remove('hidden');
    } else if (screenName === 'GAMEOVER') {
      this.dom.overlay.classList.remove('hidden');
      this.dom.gameoverScreen.classList.remove('hidden');
    } else {
      // PLAYING state, hide screen overlay entirely
      this.dom.overlay.classList.add('hidden');
    }
  }

  updateHUD(isFinal = false) {
    if (typeof document === 'undefined' || !this.dom) return;
    
    const pad = (num, size) => {
      let s = num + "";
      while (s.length < size) s = "0" + s;
      return s;
    };
    
    this.dom.score.textContent = pad(this.score, 5);
    this.dom.bones.textContent = this.bones;
    this.dom.hiscore.textContent = pad(this.highScore, 5);
    
    if (isFinal) {
      this.dom.finalScore.textContent = this.score;
      this.dom.finalBones.textContent = this.bones;
    }
    
    // Sync power-up indicators
    if (this.dog.shieldTime > 0) {
      this.dom.shieldIndicator.classList.remove('hidden');
      this.dom.shieldTimer.textContent = this.dog.shieldTime.toFixed(1);
    } else {
      this.dom.shieldIndicator.classList.add('hidden');
    }
    
    if (this.dog.speedTime > 0) {
      this.dom.speedIndicator.classList.remove('hidden');
      this.dom.speedTimer.textContent = this.dog.speedTime.toFixed(1);
    } else {
      this.dom.speedIndicator.classList.add('hidden');
    }
  }

  triggerGameOver() {
    this.state = 'GAMEOVER';
    this.sound.stopMusic();
    this.sound.playHit();
    
    // Massive debris explosion
    const centerX = this.dog.x + this.dog.width / 2;
    const centerY = this.dog.y + this.dog.height / 2;
    this.particles.spawnDebris(centerX, centerY);
    this.particles.spawnDebris(centerX - 10, centerY);
    
    if (this.score > this.highScore) {
      this.highScore = this.score;
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('corgi_run_hiscore', this.highScore.toString());
      }
    }
    
    this.updateHUD(true);
    this.showScreen('GAMEOVER');
  }

  loop(timestamp) {
    if (!this.lastTime) this.lastTime = timestamp;
    const dt = Math.min(0.1, (timestamp - this.lastTime) / 1000);
    this.lastTime = timestamp;
    
    if (this.state === 'PLAYING') {
      this.update(dt);
      this.draw();
      requestAnimationFrame((t) => this.loop(t));
    } else {
      // Force draw one last time for static screens (PAUSED, GAMEOVER)
      this.draw();
    }
  }

  update(dt) {
    // 1. Calculate scrolling speed with scaling and speed powerup boost
    const currentBaseSpeed = Math.min(800, this.baseSpeed + Math.floor(this.score / 100) * 15);
    this.gameSpeed = currentBaseSpeed + (this.dog.hasSpeed() ? 250 : 0);
    
    // 2. Spawn entities
    this.obstacleSpawnTimer -= dt;
    if (this.obstacleSpawnTimer <= 0) {
      const width = 35 + Math.floor(Math.random() * 16); 
      const height = 40 + Math.floor(Math.random() * 21); 
      this.obstacles.push(new Obstacle(960, 460, width, height));
      this.obstacleSpawnTimer = this.getRandomRange(1.5, 2.8);
      // Push powerups away to prevent instant overlaps
      this.powerupSpawnTimer = Math.max(this.powerupSpawnTimer, 1.2);
    }
    
    this.collectibleSpawnTimer -= dt;
    if (this.collectibleSpawnTimer <= 0) {
      const y = 250 + Math.floor(Math.random() * 131); 
      this.collectibles.push(new Collectible(960, y));
      this.collectibleSpawnTimer = this.getRandomRange(1.0, 1.8);
    }
    
    this.powerupSpawnTimer -= dt;
    if (this.powerupSpawnTimer <= 0) {
      const y = 300 + Math.floor(Math.random() * 61); 
      const type = Math.random() < 0.5 ? 'shield' : 'speed';
      this.powerups.push(new PowerUp(960, y, type));
      this.powerupSpawnTimer = this.getRandomRange(12, 18);
      // Push obstacles away to prevent instant overlaps
      this.obstacleSpawnTimer = Math.max(this.obstacleSpawnTimer, 1.2);
    }
    
    // 3. Update active elements
    this.background.update(this.gameSpeed, dt);
    this.dog.update(dt);
    this.particles.update(dt);
    
    // Obstacles
    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const obs = this.obstacles[i];
      obs.update(this.gameSpeed, dt);
      if (obs.isOffScreen()) {
        this.obstacles.splice(i, 1);
      }
    }
    
    // Collectibles (Bones) with Speed Magnet Check
    const dogCenterX = this.dog.x + this.dog.width / 2;
    const dogCenterY = this.dog.y + this.dog.height / 2;
    for (let i = this.collectibles.length - 1; i >= 0; i--) {
      const coll = this.collectibles[i];
      if (this.dog.hasSpeed()) {
        const collCenterX = coll.x + coll.width / 2;
        const collCenterY = coll.y + coll.height / 2;
        const dx = dogCenterX - collCenterX;
        const dy = dogCenterY - collCenterY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < 200) {
          const angle = Math.atan2(dy, dx);
          coll.x += Math.cos(angle) * 600 * dt;
          coll.y += Math.sin(angle) * 600 * dt;
        } else {
          coll.update(this.gameSpeed, dt);
        }
      } else {
        coll.update(this.gameSpeed, dt);
      }
      
      if (coll.isOffScreen()) {
        this.collectibles.splice(i, 1);
      }
    }
    
    // Power-ups
    for (let i = this.powerups.length - 1; i >= 0; i--) {
      const pu = this.powerups[i];
      pu.update(this.gameSpeed, dt);
      if (pu.isOffScreen()) {
        this.powerups.splice(i, 1);
      }
    }
    
    // 4. Passive Score Accumulation (10 points / second)
    this.scoreTimer += dt;
    if (this.scoreTimer >= 1.0) {
      this.score += 10;
      this.scoreTimer -= 1.0;
    }
    
    // 5. Dust puffs spawning while running
    if (this.dog.state === 'running') {
      this.dustTimer += dt;
      if (this.dustTimer >= 0.1) {
        this.particles.spawnDust(this.dog.x + 10, this.dog.y + this.dog.height);
        this.dustTimer = 0;
      }
    }
    
    // 6. Collision processing
    const dogBounds = this.dog.getBounds();
    
    // Bones
    for (let i = this.collectibles.length - 1; i >= 0; i--) {
      const coll = this.collectibles[i];
      if (checkCollision(dogBounds, coll.getBounds())) {
        this.bones += 1;
        this.score += 10;
        this.sound.playCollect();
        this.particles.spawnSparkles(coll.x + coll.width / 2, coll.y + coll.height / 2);
        this.collectibles.splice(i, 1);
      }
    }
    
    // Power-ups
    for (let i = this.powerups.length - 1; i >= 0; i--) {
      const pu = this.powerups[i];
      if (checkCollision(dogBounds, pu.getBounds())) {
        this.sound.playPowerUp();
        this.particles.spawnSparkles(pu.x + pu.width / 2, pu.y + pu.height / 2);
        
        if (pu.type === 'shield') {
          this.dog.shieldTime = 8.0;
        } else if (pu.type === 'speed') {
          this.dog.speedTime = 6.0;
        }
        this.powerups.splice(i, 1);
      }
    }
    
    // Obstacles
    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const obs = this.obstacles[i];
      if (checkCollision(dogBounds, obs.getBounds())) {
        if (this.dog.hasSpeed()) {
          this.sound.playHit();
          this.particles.spawnDebris(obs.x + obs.width / 2, obs.y + obs.height / 2);
          this.obstacles.splice(i, 1);
        } else if (this.dog.hasShield()) {
          this.dog.shieldTime = 0;
          this.sound.playHit();
          this.particles.spawnDebris(obs.x + obs.width / 2, obs.y + obs.height / 2);
          this.obstacles.splice(i, 1);
        } else {
          this.triggerGameOver();
        }
      }
    }
    this.updateHUD(false);
  }

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // 1. Parallax background
    this.background.draw(this.ctx, this.canvas.width, this.canvas.height);
    
    // 2. Collectibles
    for (const coll of this.collectibles) {
      coll.draw(this.ctx);
    }
    
    // 3. Power-ups
    for (const pu of this.powerups) {
      pu.draw(this.ctx);
    }
    
    // 4. Obstacles
    for (const obs of this.obstacles) {
      obs.draw(this.ctx);
    }
    
    // 5. Particles
    this.particles.draw(this.ctx);
    
    // 6. Dog player
    this.dog.draw(this.ctx);
  }
}
