export class Background {
  constructor() {
    this.cloudsOffset = 0;
    this.farHillsOffset = 0;
    this.nearBushesOffset = 0;
    this.groundOffset = 0;
  }

  update(gameSpeed, dt) {
    // gameSpeed is in pixels/second, dt is in seconds
    const dx = gameSpeed * dt;
    this.cloudsOffset = (this.cloudsOffset + dx * 0.05) % 960;
    this.farHillsOffset = (this.farHillsOffset + dx * 0.15) % 960;
    this.nearBushesOffset = (this.nearBushesOffset + dx * 0.4) % 960;
    this.groundOffset = (this.groundOffset + dx * 1.0) % 960;
  }

  draw(ctx, canvasWidth, canvasHeight) {
    // 1. Draw Sky (static gradient)
    this.drawSky(ctx, canvasWidth, canvasHeight);

    // 2. Draw Clouds
    this.drawClouds(ctx, canvasWidth, canvasHeight);

    // 3. Draw Far Hills
    this.drawFarHills(ctx, canvasWidth, canvasHeight);

    // 4. Draw Near Trees/Bushes
    this.drawNearBushes(ctx, canvasWidth, canvasHeight);

    // 5. Draw Ground
    this.drawGround(ctx, canvasWidth, canvasHeight);
  }

  drawSky(ctx, width, height) {
    const grad = ctx.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0, '#80deea'); // Soft cyan/blue
    grad.addColorStop(0.4, '#e0f7fa'); // Light pastel cyan
    grad.addColorStop(0.8, '#fff9c4'); // Warm morning pastel yellow
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
  }

  drawClouds(ctx, width, height) {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
    const clouds = [
      { x: 100, y: 60, r: 25 },
      { x: 340, y: 100, r: 20 },
      { x: 580, y: 50, r: 30 },
      { x: 820, y: 80, r: 18 },
    ];
    
    for (let offset of [-this.cloudsOffset, -this.cloudsOffset + 960]) {
      for (const cloud of clouds) {
        const cx = cloud.x + offset;
        ctx.beginPath();
        ctx.arc(cx, cloud.y, cloud.r, 0, Math.PI * 2);
        ctx.arc(cx - cloud.r * 0.6, cloud.y + cloud.r * 0.2, cloud.r * 0.7, 0, Math.PI * 2);
        ctx.arc(cx + cloud.r * 0.6, cloud.y + cloud.r * 0.2, cloud.r * 0.7, 0, Math.PI * 2);
        ctx.rect(cx - cloud.r * 1.2, cloud.y + cloud.r * 0.2, cloud.r * 2.4, cloud.r * 0.8);
        ctx.fill();
      }
    }
  }

  drawFarHills(ctx, width, height) {
    const baseY = height - 80;
    
    for (let offset of [-this.farHillsOffset, -this.farHillsOffset + 960]) {
      ctx.save();
      ctx.translate(offset, 0);
      
      // Far soft teal hills
      ctx.fillStyle = '#80cbc4'; 
      ctx.beginPath();
      ctx.moveTo(0, height);
      for (let x = 0; x <= 960; x += 10) {
        const y = baseY - 50 - Math.sin(x * (Math.PI / 480)) * 40 - Math.cos(x * (Math.PI / 240)) * 15;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(960, height);
      ctx.fill();
      
      ctx.restore();
    }
  }

  drawNearBushes(ctx, width, height) {
    const baseY = height - 80;

    for (let offset of [-this.nearBushesOffset, -this.nearBushesOffset + 960]) {
      ctx.save();
      ctx.translate(offset, 0);

      // Back layer of bushes (dark green)
      ctx.fillStyle = '#2e7d32';
      ctx.beginPath();
      ctx.moveTo(0, height);
      for (let x = 0; x <= 960; x += 8) {
        const y = baseY - 20 - Math.abs(Math.sin(x * (Math.PI / 160))) * 25 - Math.abs(Math.cos(x * (Math.PI / 80))) * 8;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(960, height);
      ctx.fill();

      // Front layer of bushes (medium warm green)
      ctx.fillStyle = '#4caf50';
      ctx.beginPath();
      ctx.moveTo(0, height);
      for (let x = 0; x <= 960; x += 8) {
        const y = baseY - 10 - Math.abs(Math.sin(x * (Math.PI / 120) + 1.2)) * 18 - Math.abs(Math.cos(x * (Math.PI / 60))) * 6;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(960, height);
      ctx.fill();

      ctx.restore();
    }
  }

  drawGround(ctx, width, height) {
    const baseY = height - 80;
    
    // 1. Draw Earth base
    ctx.fillStyle = '#5d4037'; 
    ctx.fillRect(0, baseY, width, 80);
    
    // 2. Draw Grass top (medium green)
    ctx.fillStyle = '#8bc34a'; 
    ctx.fillRect(0, baseY, width, 12);
    
    // 3. Draw Grass shadow line (darker green)
    ctx.fillStyle = '#689f38'; 
    ctx.fillRect(0, baseY + 12, width, 4);

    // 4. Pixelated grass tufts scrolling to indicate speed
    ctx.fillStyle = '#a7d129'; 
    for (let offset of [-this.groundOffset, -this.groundOffset + 960]) {
      ctx.save();
      ctx.translate(offset, 0);
      for (let gx = 0; gx < 960; gx += 40) {
        ctx.fillRect(gx, baseY + 4, 8, 4);
        ctx.fillRect(gx + 4, baseY + 2, 4, 2);
        ctx.fillRect(gx - 4, baseY + 6, 4, 2);
      }
      ctx.restore();
    }
  }
}
