import { PROJECTILE_SPEED } from './constants.js?v=princess-mobile-stability';

export class StarProjectile {
  constructor(x, y, direction) {
    this.x = x;
    this.y = y;
    this.width = 34;
    this.height = 34;
    this.vx = PROJECTILE_SPEED * direction;
  }

  update(dt) {
    this.x += this.vx * dt;
  }

  isOffscreen(cameraX, canvasWidth) {
    return this.x + this.width < cameraX - 80 || this.x > cameraX + canvasWidth + 80;
  }

  getBounds() {
    return {
      x: this.x + 5,
      y: this.y + 5,
      width: this.width - 10,
      height: this.height - 10
    };
  }

  draw(ctx, image, cameraX) {
    ctx.drawImage(image, Math.round(this.x - cameraX), Math.round(this.y), this.width, this.height);
  }
}
