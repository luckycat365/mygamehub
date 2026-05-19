export class Collectible {
  constructor(x, y = 300, width = 30, height = 20) {
    this.x = x;
    this.baseY = y;
    this.width = width;
    this.height = height;
    this.y = y;
    this.hoverTimer = Math.random() * Math.PI * 2; // Randomize start phase
  }

  update(gameSpeed, dt) {
    this.x -= gameSpeed * dt;
    this.hoverTimer += dt * 4; // Bob speed
    this.y = this.baseY + Math.sin(this.hoverTimer) * 6; // Bob height
  }

  drawBoneShape(ctx, offsetX, offsetY, fillStyle) {
    ctx.fillStyle = fillStyle;
    const shaftY = this.y + offsetY + this.height * 0.35;
    const shaftHeight = this.height * 0.3;
    const endRadius = this.height * 0.25;
    
    ctx.beginPath();
    // Left top knob
    ctx.arc(this.x + offsetX + endRadius + 2, this.y + offsetY + endRadius + 2, endRadius, 0, Math.PI * 2);
    // Left bottom knob
    ctx.arc(this.x + offsetX + endRadius + 2, this.y + offsetY + this.height - endRadius - 2, endRadius, 0, Math.PI * 2);
    // Right top knob
    ctx.arc(this.x + offsetX + this.width - endRadius - 2, this.y + offsetY + endRadius + 2, endRadius, 0, Math.PI * 2);
    // Right bottom knob
    ctx.arc(this.x + offsetX + this.width - endRadius - 2, this.y + offsetY + this.height - endRadius - 2, endRadius, 0, Math.PI * 2);
    
    // Connecting shaft
    ctx.rect(this.x + offsetX + endRadius, shaftY, this.width - endRadius * 2, shaftHeight);
    ctx.fill();
  }

  draw(ctx) {
    ctx.save();
    // Draw dark border shadow
    this.drawBoneShape(ctx, 0, 0, '#37474f');
    // Draw cream bone core
    this.drawBoneShape(ctx, 0, -1, '#fffde7'); 
    ctx.restore();
  }

  getBounds() {
    return {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height
    };
  }

  isOffScreen() {
    return this.x + this.width < 0;
  }
}
