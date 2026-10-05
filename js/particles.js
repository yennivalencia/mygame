/**
 * NEON DASH - High Performance Particle & FX System
 */

class ParticleSystem {
  constructor() {
    this.particles = [];
    this.shockwaves = [];
    this.ghosts = [];
  }

  reset() {
    this.particles = [];
    this.shockwaves = [];
    this.ghosts = [];
  }

  // --- Trail Particles ---
  emitTrail(x, y, color, type = 'sparks', size = 30) {
    const half = size / 2;
    const px = x + 4;
    const py = y + half + (Math.random() * 8 - 4);

    if (type === 'sparks') {
      for (let i = 0; i < 2; i++) {
        this.particles.push({
          x: px,
          y: py,
          vx: -(Math.random() * 4 + 2),
          vy: (Math.random() - 0.5) * 3,
          size: Math.random() * 4 + 2,
          color: color,
          alpha: 0.9,
          decay: Math.random() * 0.04 + 0.03,
          shape: 'circle'
        });
      }
    } else if (type === 'fire') {
      const colors = ['#ffcc00', '#ff6600', '#ff0033'];
      this.particles.push({
        x: px,
        y: py,
        vx: -(Math.random() * 3 + 1),
        vy: (Math.random() - 0.5) * 2 - 1,
        size: Math.random() * 6 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 0.85,
        decay: 0.05,
        shape: 'circle'
      });
    } else if (type === 'rainbow') {
      const hue = (Date.now() / 4) % 360;
      this.particles.push({
        x: px,
        y: py,
        vx: -(Math.random() * 3 + 2),
        vy: (Math.random() - 0.5) * 2,
        size: Math.random() * 5 + 3,
        color: `hsl(${hue}, 100%, 60%)`,
        alpha: 0.9,
        decay: 0.04,
        shape: 'square'
      });
    } else if (type === 'cyber') {
      this.particles.push({
        x: px,
        y: py,
        vx: -(Math.random() * 2 + 1),
        vy: (Math.random() - 0.5) * 1.5,
        size: Math.random() * 6 + 2,
        color: '#00f0ff',
        alpha: 0.9,
        decay: 0.03,
        shape: 'glitch'
      });
    } else if (type === 'ghost') {
      if (Math.random() < 0.25) {
        this.ghosts.push({
          x: x,
          y: y,
          size: size,
          color: color,
          alpha: 0.4,
          decay: 0.05
        });
      }
    }
  }

  // --- Death Explosion ---
  createDeathExplosion(x, y, primaryColor, secondaryColor) {
    // 1. Expanding shockwave ring
    this.shockwaves.push({
      x: x + 15,
      y: y + 15,
      radius: 5,
      maxRadius: 100,
      color: primaryColor,
      alpha: 1,
      speed: 6
    });

    // 2. High-speed shards & particles
    const shardCount = 45;
    for (let i = 0; i < shardCount; i++) {
      const angle = (Math.PI * 2 * i) / shardCount + (Math.random() * 0.4 - 0.2);
      const speed = Math.random() * 8 + 3;
      const isPrimary = Math.random() > 0.4;

      this.particles.push({
        x: x + 15,
        y: y + 15,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 6 + 3,
        color: isPrimary ? primaryColor : secondaryColor,
        alpha: 1,
        decay: Math.random() * 0.02 + 0.015,
        rotation: Math.random() * Math.PI,
        vRot: (Math.random() - 0.5) * 0.3,
        shape: Math.random() > 0.5 ? 'shard' : 'square'
      });
    }
  }

  // --- Pad Bounce FX ---
  createBounceEffect(x, y, color = '#ffe600') {
    for (let i = 0; i < 15; i++) {
      const angle = -Math.PI / 2 + (Math.random() * 1.2 - 0.6);
      const speed = Math.random() * 6 + 2;
      this.particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 4 + 2,
        color: color,
        alpha: 1,
        decay: 0.04,
        shape: 'circle'
      });
    }
  }

  // --- Victory Confetti & Fireworks ---
  createVictoryBurst(x, y) {
    const colors = ['#00f0ff', '#ff007f', '#ffe600', '#00ff66', '#9d00ff', '#ffffff'];
    for (let i = 0; i < 60; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 9 + 2;
      this.particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 6 + 3,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1,
        decay: 0.015,
        gravity: 0.15,
        shape: Math.random() > 0.5 ? 'square' : 'circle'
      });
    }
  }

  update() {
    // Update particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      if (p.gravity) p.vy += p.gravity;
      if (p.rotation !== undefined) p.rotation += p.vRot;
      p.alpha -= p.decay;

      if (p.alpha <= 0) {
        this.particles.splice(i, 1);
      }
    }

    // Update shockwaves
    for (let i = this.shockwaves.length - 1; i >= 0; i--) {
      const sw = this.shockwaves[i];
      sw.radius += sw.speed;
      sw.alpha = 1 - (sw.radius / sw.maxRadius);
      if (sw.radius >= sw.maxRadius || sw.alpha <= 0) {
        this.shockwaves.splice(i, 1);
      }
    }

    // Update ghosts
    for (let i = this.ghosts.length - 1; i >= 0; i--) {
      const g = this.ghosts[i];
      g.alpha -= g.decay;
      if (g.alpha <= 0) {
        this.ghosts.splice(i, 1);
      }
    }
  }

  draw(ctx, cameraX) {
    ctx.save();

    // 1. Draw Ghosts
    for (const g of this.ghosts) {
      const screenX = g.x - cameraX;
      ctx.globalAlpha = g.alpha;
      ctx.fillStyle = g.color;
      ctx.fillRect(screenX, g.y, g.size, g.size);
    }

    // 2. Draw Shockwaves
    for (const sw of this.shockwaves) {
      const screenX = sw.x - cameraX;
      ctx.globalAlpha = sw.alpha;
      ctx.strokeStyle = sw.color;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(screenX, sw.y, sw.radius, 0, Math.PI * 2);
      ctx.stroke();
    }

    // 3. Draw Particles
    for (const p of this.particles) {
      const screenX = p.x - cameraX;
      ctx.globalAlpha = Math.max(0, p.alpha);
      ctx.fillStyle = p.color;

      if (p.shape === 'circle') {
        ctx.beginPath();
        ctx.arc(screenX, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.shape === 'square') {
        ctx.fillRect(screenX - p.size / 2, p.y - p.size / 2, p.size, p.size);
      } else if (p.shape === 'glitch') {
        ctx.fillRect(screenX - p.size, p.y - p.size / 4, p.size * 2, p.size / 2);
      } else if (p.shape === 'shard') {
        ctx.save();
        ctx.translate(screenX, p.y);
        ctx.rotate(p.rotation);
        ctx.beginPath();
        ctx.moveTo(-p.size, -p.size);
        ctx.lineTo(p.size, 0);
        ctx.lineTo(0, p.size);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }
    }

    ctx.restore();
  }
}

window.particleSystem = new ParticleSystem();
