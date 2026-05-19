export class Dog {
  constructor(groundY = 460) {
    this.x = 100;
    this.width = 60;
    this.height = 40;
    this.groundY = groundY;
    this.y = this.groundY - this.height;
    this.vy = 0;
    
    // Physics constants
    this.gravity = 1500;
    this.jumpForce = -520;
    
    this.jumpsCount = 0; // 0 = ground, 1 = jump, 2 = double jump
    this.state = 'running'; // 'running', 'jumping', 'falling'
    
    // Power-up timers (seconds remaining)
    this.shieldTime = 0;
    this.speedTime = 0;
    
    // Animation timers
    this.runTimer = 0;
    this.tailWagTimer = 0;
    this.flipTime = 0;
    this.flipAngle = 0;
  }

  jump() {
    if (this.jumpsCount < 2) {
      this.vy = this.jumpForce;
      this.jumpsCount++;
      if (this.jumpsCount === 2) {
        this.flipTime = 0;
        this.flipAngle = 0;
      }
      this.state = 'jumping';
      return true;
    }
    return false;
  }

  update(dt) {
    // 1. Decrement power-up timers
    if (this.shieldTime > 0) this.shieldTime = Math.max(0, this.shieldTime - dt);
    if (this.speedTime > 0) this.speedTime = Math.max(0, this.speedTime - dt);
    
    // 2. Physics & Movement
    const isOnGround = this.y >= this.groundY - this.height;
    
    if (!isOnGround) {
      this.vy += this.gravity * dt;
      this.y += this.vy * dt;
      
      if (this.vy < 0) {
        this.state = 'jumping';
      } else {
        this.state = 'falling';
      }
    } else {
      this.y = this.groundY - this.height;
      this.vy = 0;
      this.jumpsCount = 0;
      this.state = 'running';
      this.flipAngle = 0;
      this.flipTime = 0;
    }

    // Safety landing clamp
    if (this.y > this.groundY - this.height) {
      this.y = this.groundY - this.height;
      this.vy = 0;
      this.jumpsCount = 0;
      this.state = 'running';
      this.flipAngle = 0;
      this.flipTime = 0;
    }

    // 3. Animation Updates
    if (this.state === 'running') {
      const speedFactor = this.speedTime > 0 ? 25 : 15;
      this.runTimer += dt * speedFactor;
    } else {
      this.runTimer = 0; // Keep legs static in air
    }
    
    this.tailWagTimer += dt * (this.speedTime > 0 ? 25 : 12);

    // Double-jump 360-degree flip logic
    if (this.jumpsCount === 2) {
      this.flipTime += dt;
      this.flipAngle = Math.min(Math.PI * 2, (this.flipTime / 0.45) * Math.PI * 2);
    } else {
      this.flipAngle = 0;
      this.flipTime = 0;
    }
  }

  draw(ctx) {
    // 1. Draw Speed Trails if active
    if (this.speedTime > 0) {
      ctx.save();
      ctx.globalAlpha = 0.25;
      this.drawDogShape(ctx, this.x - 20, this.y, this.runTimer - 0.2, this.tailWagTimer - 0.2, true);
      ctx.globalAlpha = 0.1;
      this.drawDogShape(ctx, this.x - 40, this.y, this.runTimer - 0.4, this.tailWagTimer - 0.4, true);
      ctx.restore();
    }

    // 2. Draw Main Corgi
    ctx.save();
    
    if (this.flipAngle > 0 && this.flipAngle < Math.PI * 2) {
      const centerX = this.x + this.width / 2;
      const centerY = this.y + this.height / 2;
      ctx.translate(centerX, centerY);
      ctx.rotate(this.flipAngle);
      this.drawDogShape(ctx, -this.width / 2, -this.height / 2, this.runTimer, this.tailWagTimer, false);
    } else {
      this.drawDogShape(ctx, this.x, this.y, this.runTimer, this.tailWagTimer, false);
    }
    
    ctx.restore();

    // 3. Draw Shield Overlay Bubble
    if (this.shieldTime > 0) {
      ctx.save();
      const centerX = this.x + this.width / 2;
      const centerY = this.y + this.height / 2;
      
      const pulse = Math.sin(Date.now() / 100) * 3;
      const radius = 34 + pulse;
      
      const grad = ctx.createRadialGradient(centerX, centerY, radius * 0.6, centerX, centerY, radius);
      grad.addColorStop(0, 'rgba(129, 212, 250, 0.15)');
      grad.addColorStop(0.8, 'rgba(41, 182, 246, 0.45)');
      grad.addColorStop(1, 'rgba(3, 155, 229, 0.8)');
      
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.strokeStyle = '#03a9f4';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();
    }
    
    // 4. Draw Speed Ring Overlay
    if (this.speedTime > 0) {
      ctx.save();
      const centerX = this.x + this.width / 2;
      const centerY = this.y + this.height / 2;
      const pulse = Math.sin(Date.now() / 80) * 2;
      
      ctx.strokeStyle = 'rgba(255, 215, 0, 0.7)';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.arc(centerX, centerY, 33 + pulse, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  }

  drawDogShape(ctx, px, py, runTimer, tailWagTimer, isTrail = false) {
    let orange = '#e67e22'; 
    let white = '#f5f6fa';  
    let pink = '#ff80ab';   
    let black = '#2c3e50';  
    
    if (isTrail) {
      orange = '#ffb300';
      white = '#fffde7';
      pink = '#ffe082';
      black = '#ffb300';
    }

    // 1. Tail (Wagging)
    ctx.save();
    ctx.translate(px + 10, py + 16);
    const wagAngle = Math.sin(tailWagTimer) * 0.4;
    ctx.rotate(wagAngle);
    ctx.fillStyle = white;
    ctx.fillRect(-6, -6, 6, 6);
    ctx.restore();

    // 2. Legs (back layer)
    const legW = 6;
    const legH = 10;
    const backLegX = px + 16;
    const frontLegX = px + 40;
    const legBaseY = py + 30;

    // Back Left Leg
    const backLeftOffset = Math.sin(runTimer) * 4;
    ctx.fillStyle = isTrail ? '#ff8f00' : '#d35400'; 
    ctx.fillRect(backLegX, legBaseY + (backLeftOffset > 0 ? backLeftOffset : 0), legW, legH - (backLeftOffset < 0 ? -backLeftOffset : 0));

    // Front Left Leg
    const frontLeftOffset = -Math.sin(runTimer) * 4;
    ctx.fillRect(frontLegX, legBaseY + (frontLeftOffset > 0 ? frontLeftOffset : 0), legW, legH - (frontLeftOffset < 0 ? -frontLeftOffset : 0));

    // 3. Body
    ctx.fillStyle = orange;
    ctx.fillRect(px + 12, py + 10, 36, 20);
    
    // Belly
    ctx.fillStyle = white;
    ctx.fillRect(px + 12, py + 24, 30, 6);
    
    // Chest
    ctx.fillRect(px + 36, py + 12, 12, 14);

    // 4. Head
    ctx.fillStyle = orange;
    ctx.fillRect(px + 42, py + 2, 16, 16);
    
    // Muzzle/Snout
    ctx.fillStyle = white;
    ctx.fillRect(px + 52, py + 10, 8, 8);
    
    // Nose
    ctx.fillStyle = black;
    ctx.fillRect(px + 58, py + 10, 2, 2);
    
    // Eye
    ctx.fillStyle = black;
    ctx.fillRect(px + 49, py + 6, 2, 2);

    // 5. Ears
    // Left ear
    ctx.fillStyle = orange;
    ctx.fillRect(px + 44, py - 4, 4, 6);
    ctx.fillStyle = pink;
    ctx.fillRect(px + 45, py - 2, 2, 4);

    // Right ear
    ctx.fillStyle = orange;
    ctx.fillRect(px + 50, py - 4, 4, 6);
    ctx.fillStyle = pink;
    ctx.fillRect(px + 51, py - 2, 2, 4);

    // 6. Legs (front layer)
    ctx.fillStyle = orange;
    // Back Right Leg
    const backRightOffset = -Math.sin(runTimer) * 4;
    ctx.fillRect(backLegX + 4, legBaseY + (backRightOffset > 0 ? backRightOffset : 0), legW, legH - (backRightOffset < 0 ? -backRightOffset : 0));

    // Front Right Leg
    const frontRightOffset = Math.sin(runTimer) * 4;
    ctx.fillRect(frontLegX + 4, legBaseY + (frontRightOffset > 0 ? frontRightOffset : 0), legW, legH - (frontRightOffset < 0 ? -frontRightOffset : 0));
  }

  getBounds() {
    return {
      x: this.x + 5,
      y: this.y,
      width: this.width - 10,
      height: this.height
    };
  }

  hasShield() {
    return this.shieldTime > 0;
  }

  hasSpeed() {
    return this.speedTime > 0;
  }
}
