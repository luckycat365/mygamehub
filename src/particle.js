export class Particle {
  constructor(x, y, vx, vy, color, size, life, gravity = 0) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.color = color;
    this.size = size;
    this.alpha = 1.0;
    this.decay = 1.0 / life; // life is in seconds
    this.gravity = gravity;
  }

  update(dt) {
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.vy += this.gravity * dt;
    this.alpha -= this.decay * dt;
  }

  draw(ctx) {
    ctx.globalAlpha = Math.max(0, Math.min(1, this.alpha));
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.size, this.size);
  }
}

export class ParticleSystem {
  constructor() {
    this.particles = [];
    this.maxParticles = 300;
  }

  addParticle(p) {
    if (this.particles.length >= this.maxParticles) {
      this.particles.shift();
    }
    this.particles.push(p);
  }

  spawnDust(x, y) {
    const colors = ['#e0e0e0', '#b0bec5', '#cfd8dc'];
    const count = 2 + Math.floor(Math.random() * 3);
    for (let i = 0; i < count; i++) {
      const vx = -80 - Math.random() * 60; 
      const vy = -30 - Math.random() * 40; 
      const color = colors[Math.floor(Math.random() * colors.length)];
      const size = 3 + Math.floor(Math.random() * 4); 
      const life = 0.4 + Math.random() * 0.3; 
      const gravity = 10 + Math.random() * 20; 
      
      this.addParticle(new Particle(x, y, vx, vy, color, size, life, gravity));
    }
  }

  spawnSparkles(x, y) {
    const colors = ['#ffd54f', '#ffca28', '#ffb300', '#ffecb3'];
    const count = 8 + Math.floor(Math.random() * 5);
    for (let i = 0; i < count; i++) {
      const vx = (Math.random() - 0.5) * 200; 
      const vy = -120 - Math.random() * 100; 
      const color = colors[Math.floor(Math.random() * colors.length)];
      const size = 4 + Math.floor(Math.random() * 5); 
      const life = 0.5 + Math.random() * 0.4; 
      const gravity = 250; 
      
      this.addParticle(new Particle(x, y, vx, vy, color, size, life, gravity));
    }
  }

  spawnDebris(x, y) {
    const colors = ['#8d6e63', '#795548', '#5d4037', '#d84315', '#ff5722'];
    const count = 15 + Math.floor(Math.random() * 6);
    for (let i = 0; i < count; i++) {
      const vx = (Math.random() - 0.5) * 350; 
      const vy = -200 - Math.random() * 200; 
      const color = colors[Math.floor(Math.random() * colors.length)];
      const size = 5 + Math.floor(Math.random() * 7); 
      const life = 0.7 + Math.random() * 0.5; 
      const gravity = 500; 
      
      this.addParticle(new Particle(x, y, vx, vy, color, size, life, gravity));
    }
  }

  update(dt) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.update(dt);
      if (p.alpha <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  draw(ctx) {
    const originalAlpha = ctx.globalAlpha;
    for (let i = 0; i < this.particles.length; i++) {
      this.particles[i].draw(ctx);
    }
    ctx.globalAlpha = originalAlpha;
  }
}
