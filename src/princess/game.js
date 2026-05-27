import { checkCollision } from '../physics.js';
import { CANVAS_HEIGHT, CANVAS_WIDTH } from './constants.js';
import { loadPrincessAssets } from './assets.js';
import { TeacupSentry } from './enemy.js';
import { PrincessInput } from './input.js';
import { LEVEL } from './level.js';
import { FantasyPlatform } from './platform.js';
import { PrincessPlayer } from './player.js';
import { StarProjectile } from './projectile.js';
import { playerReachedCastle, playerTouchedEnemy } from './rules.js';
import { PrincessSound } from './sound.js';

export class PrincessGame {
  constructor(canvas, options = {}) {
    this.canvas = canvas;
    this.canvas.width = CANVAS_WIDTH;
    this.canvas.height = CANVAS_HEIGHT;
    this.ctx = canvas.getContext('2d');
    this.input = new PrincessInput(window);
    this.assets = null;
    this.state = 'LOADING';
    this.score = 0;
    this.lastTime = 0;
    this.cameraX = 0;
    this.shootCooldown = 0;
    this.sound = options.sound || new PrincessSound();

    this.initDOMElements();
    this.bindButtons();
    this.resetLevel();
    this.updateHUD();
    this.setStartButtonReady(false);
    this.showScreen('START');
    this.drawLoading();

    loadPrincessAssets().then((assets) => {
      this.assets = assets;
      this.state = 'START';
      this.setStartButtonReady(true);
      this.draw();
    }).catch((error) => {
      this.state = 'ERROR';
      this.drawError(error);
    });
  }

  initDOMElements() {
    this.dom = {
      score: document.getElementById('princess-score-val'),
      overlay: document.getElementById('screen-overlay'),
      startScreen: document.getElementById('start-screen'),
      pauseScreen: document.getElementById('pause-screen'),
      winScreen: document.getElementById('win-screen'),
      gameoverScreen: document.getElementById('gameover-screen'),
      winScore: document.getElementById('win-score-val'),
      finalScore: document.getElementById('final-score-val'),
      startBtn: document.getElementById('start-btn'),
      resumeBtn: document.getElementById('resume-btn'),
      restartBtn: document.getElementById('restart-btn'),
      playAgainBtn: document.getElementById('play-again-btn')
    };
  }

  bindButtons() {
    this.dom.startBtn?.addEventListener('click', () => this.start());
    this.dom.resumeBtn?.addEventListener('click', () => this.resume());
    this.dom.restartBtn?.addEventListener('click', () => this.restart());
    this.dom.playAgainBtn?.addEventListener('click', () => this.restart());
  }

  setStartButtonReady(isReady) {
    if (!this.dom.startBtn) return;
    this.dom.startBtn.disabled = !isReady;
    this.dom.startBtn.textContent = isReady ? 'START QUEST' : 'LOADING...';
  }

  resetLevel() {
    this.platforms = LEVEL.platforms.map((platform) => new FantasyPlatform(platform));
    this.player = new PrincessPlayer(LEVEL.start.x, LEVEL.start.y);
    this.enemies = LEVEL.enemies.map((enemy) => (
      new TeacupSentry(enemy, this.platforms[enemy.platformIndex])
    ));
    this.projectiles = [];
    this.score = 0;
    this.cameraX = 0;
    this.shootCooldown = 0;
  }

  start() {
    if (this.state !== 'START' || !this.assets) return;
    this.state = 'PLAYING';
    this.showScreen('PLAYING');
    this.sound.playMusic();
    this.lastTime = performance.now();
    requestAnimationFrame((time) => this.loop(time));
  }

  restart() {
    this.resetLevel();
    this.updateHUD();
    this.state = 'PLAYING';
    this.showScreen('PLAYING');
    this.sound.stopMusic();
    this.sound.playMusic();
    this.lastTime = performance.now();
    requestAnimationFrame((time) => this.loop(time));
  }

  pause() {
    if (this.state !== 'PLAYING') return;
    this.state = 'PAUSED';
    this.showScreen('PAUSED');
    this.sound.pauseMusic();
  }

  resume() {
    if (this.state !== 'PAUSED') return;
    this.state = 'PLAYING';
    this.showScreen('PLAYING');
    this.sound.playMusic();
    this.lastTime = performance.now();
    requestAnimationFrame((time) => this.loop(time));
  }

  win() {
    this.state = 'WON';
    this.sound.stopMusic();
    this.dom.winScore.textContent = this.score;
    this.showScreen('WON');
  }

  gameOver() {
    this.state = 'GAMEOVER';
    this.sound.stopMusic();
    this.dom.finalScore.textContent = this.score;
    this.showScreen('GAMEOVER');
  }

  showScreen(screenName) {
    this.dom.startScreen?.classList.add('hidden');
    this.dom.pauseScreen?.classList.add('hidden');
    this.dom.winScreen?.classList.add('hidden');
    this.dom.gameoverScreen?.classList.add('hidden');

    if (screenName === 'PLAYING') {
      this.dom.overlay?.classList.add('hidden');
      return;
    }

    this.dom.overlay?.classList.remove('hidden');
    if (screenName === 'START') this.dom.startScreen?.classList.remove('hidden');
    if (screenName === 'PAUSED') this.dom.pauseScreen?.classList.remove('hidden');
    if (screenName === 'WON') this.dom.winScreen?.classList.remove('hidden');
    if (screenName === 'GAMEOVER') this.dom.gameoverScreen?.classList.remove('hidden');
  }

  updateHUD() {
    if (this.dom.score) this.dom.score.textContent = this.score;
  }

  loop(timestamp) {
    const dt = Math.min(0.05, (timestamp - this.lastTime) / 1000);
    this.lastTime = timestamp;

    if (this.state === 'PLAYING') {
      this.update(dt);
      this.draw();
      if (this.state === 'PLAYING') {
        requestAnimationFrame((time) => this.loop(time));
      }
    } else {
      this.draw();
    }
  }

  update(dt) {
    const actions = this.input.snapshot();
    if (actions.pause) {
      this.pause();
      return;
    }

    this.shootCooldown = Math.max(0, this.shootCooldown - dt);
    if (actions.shoot && this.shootCooldown <= 0) {
      this.shoot();
    }

    this.player.update(actions, this.platforms, dt, LEVEL.width);
    for (const enemy of this.enemies) enemy.update(dt);
    for (const projectile of this.projectiles) projectile.update(dt);

    this.cameraX = Math.max(0, Math.min(LEVEL.width - CANVAS_WIDTH, this.player.x - 300));

    this.resolveProjectileHits();
    this.projectiles = this.projectiles.filter((projectile) => !projectile.isOffscreen(this.cameraX, CANVAS_WIDTH));
    this.enemies = this.enemies.filter((enemy) => !enemy.removeAfterDestroy);

    if (this.player.y > CANVAS_HEIGHT + 180) {
      this.gameOver();
      return;
    }

    if (this.enemies.some((enemy) => playerTouchedEnemy(this.player, enemy))) {
      this.gameOver();
      return;
    }

    if (playerReachedCastle(this.player, LEVEL.castle)) {
      this.win();
    }
  }

  shoot() {
    this.player.attack();
    this.shootCooldown = 0.32;
    const direction = this.player.facing;
    const x = direction > 0 ? this.player.x + this.player.width - 8 : this.player.x - 24;
    const y = this.player.y + 28;
    this.projectiles.push(new StarProjectile(x, y, direction));
  }

  resolveProjectileHits() {
    const remainingProjectiles = [];
    for (const projectile of this.projectiles) {
      let consumed = false;
      for (const enemy of this.enemies) {
        if (!enemy.destroyed && checkCollision(projectile.getBounds(), enemy.getBounds())) {
          consumed = true;
          if (enemy.hit()) {
            this.score += 1;
            this.updateHUD();
          }
          break;
        }
      }
      if (!consumed) remainingProjectiles.push(projectile);
    }
    this.projectiles = remainingProjectiles;
  }

  drawLoading() {
    this.ctx.fillStyle = '#9edcff';
    this.ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    this.ctx.fillStyle = '#24304f';
    this.ctx.font = '16px monospace';
    this.ctx.fillText('Loading Princess Star Adventure...', 280, 270);
  }

  drawError(error) {
    this.ctx.fillStyle = '#1b1b24';
    this.ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    this.ctx.fillStyle = '#ff8a80';
    this.ctx.font = '16px monospace';
    this.ctx.fillText(error.message, 60, 270);
  }

  draw() {
    if (!this.assets) {
      this.drawLoading();
      return;
    }

    this.ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    this.ctx.drawImage(this.assets.background, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    this.drawWorldDecor();

    for (const platform of this.platforms) {
      platform.draw(this.ctx, this.assets.platforms[platform.type], this.cameraX);
    }

    this.ctx.drawImage(
      this.assets.castle,
      Math.round(LEVEL.castle.x - this.cameraX),
      LEVEL.castle.y,
      LEVEL.castle.width,
      LEVEL.castle.height
    );

    for (const projectile of this.projectiles) {
      projectile.draw(this.ctx, this.assets.projectile, this.cameraX);
    }
    for (const enemy of this.enemies) {
      enemy.draw(this.ctx, this.assets, this.cameraX);
    }
    this.player.draw(this.ctx, this.assets, this.cameraX);
  }

  drawWorldDecor() {
    const crystal = this.assets.platforms.crystal;
    this.ctx.globalAlpha = 0.92;
    this.ctx.drawImage(crystal, Math.round(1520 - this.cameraX * 0.75), 404, 80, 54);
    this.ctx.drawImage(crystal, Math.round(2260 - this.cameraX * 0.75), 405, 76, 52);
    this.ctx.globalAlpha = 1;
  }
}
