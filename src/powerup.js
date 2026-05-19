export class PowerUp {
  constructor(x, y = 320, type = 'shield', width = 30, height = 30) {
    this.x = x;
    this.baseY = y;
    this.type = type; // 'shield' or 'speed'
    this.width = width;
    this.height = height;
    this.y = y;
    this.hoverTimer = Math.random() * Math.PI * 2;
    this.pulseTimer = 0;
  }

  update(gameSpeed, dt) {
    this.x -= gameSpeed * dt;
    this.hoverTimer += dt * 3;
    this.y = this.baseY + Math.sin(this.hoverTimer) * 5;
    this.pulseTimer = (this.pulseTimer + dt * 1.5) % 1.0;
  }

  draw(ctx) {
    ctx.save();
    
    const centerX = this.x + this.width / 2;
    const centerY = this.y + this.height / 2;
    
    // Draw expanding/fading pulse ring
    const ringColor = this.type === 'shield' ? 'rgba(41, 182, 246,' : 'rgba(255, 179, 0,';
    const ringRadius = this.width * (0.6 + this.pulseTimer * 0.6);
    ctx.strokeStyle = `${ringColor}${1.0 - this.pulseTimer})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(centerX, centerY, ringRadius, 0, Math.PI * 2);
    ctx.stroke();

    // Draw main item background circle (glow effect)
    ctx.fillStyle = this.type === 'shield' ? 'rgba(3, 169, 244, 0.2)' : 'rgba(255, 193, 7, 0.2)';
    ctx.beginPath();
    ctx.arc(centerX, centerY, this.width / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = this.type === 'shield' ? '#0288d1' : '#f57c00';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw inner icon
    if (this.type === 'shield') {
      // Blue shield shape
      ctx.fillStyle = '#29b6f6';
      ctx.strokeStyle = '#01579b';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY - 8);
      ctx.lineTo(centerX + 7, centerY - 6);
      ctx.lineTo(centerX + 6, centerY + 2);
      ctx.quadraticCurveTo(centerX, centerY + 9, centerX, centerY + 9);
      ctx.quadraticCurveTo(centerX - 6, centerY + 2, centerX - 6, centerY + 2);
      ctx.lineTo(centerX - 7, centerY - 6);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Highlight detail
      ctx.fillStyle = '#e1f5fe';
      ctx.beginPath();
      ctx.moveTo(centerX - 3, centerY - 4);
      ctx.lineTo(centerX, centerY - 5);
      ctx.lineTo(centerX, centerY + 6);
      ctx.quadraticCurveTo(centerX - 3, centerY + 1, centerX - 3, centerY + 1);
      ctx.closePath();
      ctx.fill();
    } else {
      // Golden lightning bolt shape
      ctx.fillStyle = '#ffb300';
      ctx.strokeStyle = '#e65100';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(centerX + 2, centerY - 10);
      ctx.lineTo(centerX - 5, centerY);
      ctx.lineTo(centerX - 1, centerY);
      ctx.lineTo(centerX - 3, centerY + 10);
      ctx.lineTo(centerX + 5, centerY - 1);
      ctx.lineTo(centerX + 1, centerY - 1);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Highlight detail
      ctx.fillStyle = '#fffde7';
      ctx.beginPath();
      ctx.moveTo(centerX + 1, centerY - 8);
      ctx.lineTo(centerX - 3, centerY - 1);
      ctx.lineTo(centerX, centerY - 1);
      ctx.closePath();
      ctx.fill();
    }

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
