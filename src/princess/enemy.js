export class TeacupSentry {
  constructor(config, platform) {
    this.x = config.x;
    this.width = 58;
    this.height = 62;
    this.y = platform.y - this.height;
    this.patrolMin = config.patrolMin;
    this.patrolMax = config.patrolMax;
    this.speed = 70;
    this.direction = -1;
    this.hp = 2;
    this.destroyed = false;
    this.removeAfterDestroy = false;
    this.destroyedTime = 0;
    this.hitTime = 0;
    this.frameTime = 0;
  }

  update(dt) {
    if (this.destroyed) {
      this.destroyedTime += dt;
      this.removeAfterDestroy = this.destroyedTime >= 0.45;
      return;
    }

    this.x += this.direction * this.speed * dt;
    if (this.x <= this.patrolMin) {
      this.x = this.patrolMin;
      this.direction = 1;
    } else if (this.x >= this.patrolMax) {
      this.x = this.patrolMax;
      this.direction = -1;
    }
    this.hitTime = Math.max(0, this.hitTime - dt);
    this.frameTime += dt;
  }

  hit() {
    if (this.destroyed) return false;
    this.hp -= 1;
    this.hitTime = 0.18;
    if (this.hp <= 0) {
      this.destroyed = true;
      this.destroyedTime = 0;
      return true;
    }
    return false;
  }

  getBounds() {
    return {
      x: this.x + 9,
      y: this.y + 10,
      width: this.width - 18,
      height: this.height - 12
    };
  }

  draw(ctx, assets, cameraX) {
    const frames = this.destroyed
      ? assets.enemy.destroyed
      : this.hitTime > 0
        ? assets.enemy.hit
        : assets.enemy.walking;
    const image = frames[Math.floor(this.frameTime * 8) % frames.length];
    const drawWidth = 82;
    const drawHeight = 82;
    const drawX = Math.round(this.x - cameraX - 12);
    const drawY = Math.round(this.y - 18);

    ctx.save();
    if (this.hitTime > 0 && !this.destroyed) {
      ctx.globalAlpha = 0.72;
    }
    if (this.direction > 0) {
      ctx.translate(drawX + drawWidth, drawY);
      ctx.scale(-1, 1);
      ctx.drawImage(image, 0, 0, drawWidth, drawHeight);
    } else {
      ctx.drawImage(image, drawX, drawY, drawWidth, drawHeight);
    }
    ctx.restore();
  }
}
