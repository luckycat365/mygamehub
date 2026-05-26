import { GRAVITY, JUMP_SPEED, PLAYER_SPEED } from './constants.js';

const PLATFORM_SNAP_TOLERANCE = 10;

export class PrincessPlayer {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = 54;
    this.height = 86;
    this.vx = 0;
    this.vy = 0;
    this.facing = 1;
    this.onGround = false;
    this.state = 'standing';
    this.frameTime = 0;
    this.attackTime = 0;
    this.jumpCount = 0;
  }

  update(input, platforms, dt, worldWidth) {
    if (input.left && !input.right) {
      this.vx = -PLAYER_SPEED;
      this.facing = -1;
    } else if (input.right && !input.left) {
      this.vx = PLAYER_SPEED;
      this.facing = 1;
    } else {
      this.vx = 0;
    }

    if (input.jump && this.jumpCount < 2) {
      this.vy = -JUMP_SPEED;
      this.onGround = false;
      this.jumpCount += 1;
    }

    if (this.attackTime > 0) {
      this.attackTime = Math.max(0, this.attackTime - dt);
    }

    const previousBottom = this.y + this.height;
    this.vy += GRAVITY * dt;
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.x = Math.max(0, Math.min(worldWidth - this.width, this.x));

    this.onGround = false;
    for (const platform of platforms) {
      const currentBottom = this.y + this.height;
      const horizontallyOverlaps = this.x + this.width * 0.78 > platform.x
        && this.x + this.width * 0.22 < platform.x + platform.width;
      const closeToSurface = previousBottom <= platform.y + PLATFORM_SNAP_TOLERANCE;
      if (this.vy >= 0 && closeToSurface && currentBottom >= platform.y && horizontallyOverlaps) {
        this.y = platform.y - this.height;
        this.vy = 0;
        this.onGround = true;
        this.jumpCount = 0;
      }
    }

    if (this.attackTime > 0) {
      this.state = 'attacking';
    } else if (!this.onGround) {
      this.state = 'jumping';
    } else if (Math.abs(this.vx) > 1) {
      this.state = 'running';
    } else {
      this.state = 'standing';
    }

    this.frameTime += dt;
  }

  attack() {
    this.attackTime = 0.25;
  }

  getBounds() {
    return {
      x: this.x + 8,
      y: this.y + 8,
      width: this.width - 16,
      height: this.height - 12
    };
  }

  draw(ctx, assets, cameraX) {
    const frames = assets.princess[this.state] || assets.princess.standing;
    const frameIndex = Math.floor(this.frameTime * 10) % frames.length;
    const image = frames[frameIndex];
    const drawHeight = 104;
    const drawWidth = 182;
    const drawX = Math.round(this.x + this.width / 2 - drawWidth / 2 - cameraX);
    const drawY = Math.round(this.y - 4);

    ctx.save();
    if (this.facing < 0) {
      ctx.translate(drawX + drawWidth, drawY);
      ctx.scale(-1, 1);
      ctx.drawImage(image, 0, 0, drawWidth, drawHeight);
    } else {
      ctx.drawImage(image, drawX, drawY, drawWidth, drawHeight);
    }
    ctx.restore();
  }
}
