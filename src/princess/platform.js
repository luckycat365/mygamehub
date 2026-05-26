export class FantasyPlatform {
  constructor(config) {
    Object.assign(this, config);
  }

  draw(ctx, image, cameraX) {
    const visualHeight = this.type === 'cloud' ? 72 : 86;
    const surfaceInset = this.type === 'cloud' ? 9 : 12;
    const visualY = this.y - surfaceInset;
    ctx.drawImage(image, Math.round(this.x - cameraX), visualY, this.width, visualHeight);
  }
}
