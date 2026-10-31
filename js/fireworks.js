/**
 * ==========================================================================
 * PANDU'S BIRTHDAY - FIREWORKS & PHULJHADI (SPARKLER) PARTICLE ENGINE
 * Realistic golden sparkler physics, sky fireworks, lanterns, and stars.
 * ==========================================================================
 */

class FestiveCanvasEngine {
  constructor() {
    this.bgCanvas = document.getElementById('bg-canvas');
    this.bgCtx = this.bgCanvas ? this.bgCanvas.getContext('2d') : null;
    
    this.sparklerCanvas = document.getElementById('sparkler-canvas');
    this.sparklerCtx = this.sparklerCanvas ? this.sparklerCanvas.getContext('2d') : null;

    this.width = window.innerWidth;
    this.height = window.innerHeight;

    // Simulation states
    this.fireworks = [];
    this.particles = [];
    this.sparklerParticles = [];
    this.stars = [];
    this.lanterns = [];
    this.isWandActive = true; // Handheld Phuljhadi mode
    this.pointer = { x: this.width * 0.5, y: this.height * 0.5, isDown: false, moving: false };
    this.lastPointerMoveTime = Date.now();

    this.autoLaunchTimer = 0;
    this.autoLaunchInterval = 55; // Frames between auto fireworks
    this.isRunning = false;

    this.init();
  }

  init() {
    if (!this.bgCanvas || !this.sparklerCanvas) return;
    this.resize();
    window.addEventListener('resize', () => this.resize());

    // Generate static/twinkling stars
    this.createStarfield();

    // Generate initial floating lanterns
    this.createLanterns();

    // Mouse and Touch Listeners for interactive sparklers
    window.addEventListener('mousemove', (e) => this.onPointerMove(e.clientX, e.clientY));
    window.addEventListener('mousedown', (e) => this.onPointerDown(e.clientX, e.clientY));
    window.addEventListener('mouseup', () => this.onPointerUp());

    window.addEventListener('touchmove', (e) => {
      if (e.touches.length > 0) {
        this.onPointerMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    }, { passive: true });

    window.addEventListener('touchstart', (e) => {
      if (e.touches.length > 0) {
        this.onPointerDown(e.touches[0].clientX, e.touches[0].clientY);
      }
    }, { passive: true });

    window.addEventListener('touchend', () => this.onPointerUp());

    this.isRunning = true;
    this.loop();
  }

  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    this.bgCanvas.width = this.width;
    this.bgCanvas.height = this.height;

    this.sparklerCanvas.width = this.width;
    this.sparklerCanvas.height = this.height;

    this.createStarfield();
  }

  createStarfield() {
    this.stars = [];
    const count = Math.min(220, Math.floor((this.width * this.height) / 5000));
    for (let i = 0; i < count; i++) {
      this.stars.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        size: Math.random() * 1.8 + 0.4,
        alpha: Math.random() * 0.8 + 0.2,
        twinkleSpeed: (Math.random() * 0.03 + 0.008) * (Math.random() < 0.5 ? 1 : -1)
      });
    }
  }

  createLanterns() {
    this.lanterns = [];
    const count = Math.min(18, Math.floor(this.width / 80));
    for (let i = 0; i < count; i++) {
      this.lanterns.push(new SkyLantern(this.width, this.height, true));
    }
  }

  onPointerMove(x, y) {
    this.pointer.x = x;
    this.pointer.y = y;
    this.pointer.moving = true;
    this.lastPointerMoveTime = Date.now();

    // Handheld phuljhadi sparkler trail when moving
    if (this.isWandActive) {
      this.emitSparklerAt(x, y, 4);
    }
  }

  onPointerDown(x, y) {
    this.pointer.x = x;
    this.pointer.y = y;
    this.pointer.isDown = true;
    // Burst on click!
    this.explodeAt(x, y, 'gold');
    this.emitSparklerAt(x, y, 22);
  }

  onPointerUp() {
    this.pointer.isDown = false;
  }

  setWandActive(active) {
    this.isWandActive = active;
  }

  emitSparklerAt(x, y, count = 10) {
    for (let i = 0; i < count; i++) {
      this.sparklerParticles.push(new PhuljhadiSpark(x, y));
    }
  }

  launchFirework(targetX = null, targetY = null, type = 'peony') {
    const startX = Math.random() * (this.width * 0.8) + (this.width * 0.1);
    const endX = targetX !== null ? targetX : Math.random() * (this.width * 0.7) + (this.width * 0.15);
    const endY = targetY !== null ? targetY : Math.random() * (this.height * 0.45) + (this.height * 0.1);
    this.fireworks.push(new Rocket(startX, this.height, endX, endY, type));
  }

  explodeAt(x, y, colorTheme = 'festive') {
    const count = 90;
    const colors = [
      '#ffd166', '#ffb703', '#fff275', '#ff4d6d', '#ff758f', '#ffb3c1', '#8338ec', '#06d6a0'
    ];

    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.3;
      const speed = Math.random() * 5.5 + 1.5;
      const color = colorTheme === 'gold' 
        ? (Math.random() < 0.6 ? '#ffd166' : '#fff275') 
        : colors[Math.floor(Math.random() * colors.length)];
      this.particles.push(new FireworkParticle(x, y, angle, speed, color));
    }
  }

  triggerGrandFinale(durationMs = 4000) {
    const startTime = Date.now();
    const interval = setInterval(() => {
      if (Date.now() - startTime > durationMs) {
        clearInterval(interval);
        return;
      }
      for (let i = 0; i < 3; i++) {
        const x = Math.random() * this.width;
        const y = Math.random() * (this.height * 0.5) + (this.height * 0.1);
        this.explodeAt(x, y, 'festive');
        this.emitSparklerAt(x, y, 30);
      }
    }, 240);
  }

  loop() {
    if (!this.isRunning) return;

    // 1. Draw Background Sky & Stars
    this.bgCtx.clearRect(0, 0, this.width, this.height);

    // Subtle dark gradient background
    const skyGrad = this.bgCtx.createRadialGradient(
      this.width * 0.5, this.height * 0.3, 50,
      this.width * 0.5, this.height * 0.5, this.height
    );
    skyGrad.addColorStop(0, 'rgba(15, 17, 36, 0.4)');
    skyGrad.addColorStop(1, 'rgba(6, 7, 19, 0.6)');
    this.bgCtx.fillStyle = skyGrad;
    this.bgCtx.fillRect(0, 0, this.width, this.height);

    // Stars
    this.bgCtx.save();
    for (const star of this.stars) {
      star.alpha += star.twinkleSpeed;
      if (star.alpha > 0.95 || star.alpha < 0.15) {
        star.twinkleSpeed = -star.twinkleSpeed;
      }
      this.bgCtx.fillStyle = `rgba(255, 248, 220, ${Math.max(0.1, star.alpha)})`;
      this.bgCtx.shadowColor = 'rgba(255, 215, 120, 0.6)';
      this.bgCtx.shadowBlur = 4;
      this.bgCtx.beginPath();
      this.bgCtx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      this.bgCtx.fill();
    }
    this.bgCtx.restore();

    // 2. Floating Sky Lanterns
    for (let i = this.lanterns.length - 1; i >= 0; i--) {
      const lantern = this.lanterns[i];
      lantern.update();
      lantern.draw(this.bgCtx);
      if (lantern.isDead(this.height)) {
        this.lanterns[i] = new SkyLantern(this.width, this.height);
      }
    }

    // 3. Update & Draw Fireworks Rockets
    for (let i = this.fireworks.length - 1; i >= 0; i--) {
      const rocket = this.fireworks[i];
      rocket.update();
      rocket.draw(this.bgCtx);

      if (rocket.hasReachedTarget()) {
        this.explodeAt(rocket.x, rocket.y, rocket.colorTheme);
        this.fireworks.splice(i, 1);
      }
    }

    // 4. Update & Draw Firework Particles (peonies & willows)
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.update();
      p.draw(this.bgCtx);
      if (p.isDead()) {
        this.particles.splice(i, 1);
      }
    }

    // 5. Draw Sparkler Canvas (Phuljhadi Sparklers)
    // Use destination-out fade for sizzling trails
    this.sparklerCtx.save();
    this.sparklerCtx.globalCompositeOperation = 'destination-out';
    this.sparklerCtx.fillStyle = 'rgba(0, 0, 0, 0.18)';
    this.sparklerCtx.fillRect(0, 0, this.width, this.height);
    this.sparklerCtx.restore();

    this.sparklerCtx.save();
    this.sparklerCtx.globalCompositeOperation = 'lighter';

    // If mouse is held down, continually emit phuljhadi sparks
    if (this.pointer.isDown && this.isWandActive) {
      this.emitSparklerAt(this.pointer.x, this.pointer.y, 6);
    } else if (this.isWandActive && Date.now() - this.lastPointerMoveTime < 1500) {
      // Gentle ambient sparkler at cursor
      this.emitSparklerAt(this.pointer.x, this.pointer.y, 1);
    }

    for (let i = this.sparklerParticles.length - 1; i >= 0; i--) {
      const sp = this.sparklerParticles[i];
      sp.update();
      sp.draw(this.sparklerCtx);
      if (sp.isDead()) {
        this.sparklerParticles.splice(i, 1);
      }
    }
    this.sparklerCtx.restore();

    // Auto-launch periodic celebratory sky fireworks
    this.autoLaunchTimer++;
    if (this.autoLaunchTimer >= this.autoLaunchInterval) {
      this.autoLaunchTimer = 0;
      this.launchFirework();
      this.autoLaunchInterval = Math.floor(Math.random() * 40) + 40;
    }

    requestAnimationFrame(() => this.loop());
  }
}

/**
 * Ascending Firework Rocket with sparkling trail
 */
class Rocket {
  constructor(x, y, targetX, targetY, colorTheme = 'festive') {
    this.x = x;
    this.y = y;
    this.targetX = targetX;
    this.targetY = targetY;
    this.colorTheme = colorTheme;

    const dx = targetX - x;
    const dy = targetY - y;
    this.distance = Math.hypot(dx, dy);
    this.angle = Math.atan2(dy, dx);
    this.speed = Math.random() * 2 + 7.5;
    this.vx = Math.cos(this.angle) * this.speed;
    this.vy = Math.sin(this.angle) * this.speed;

    this.trail = [];
    this.maxTrail = 6;
  }

  update() {
    this.trail.push({ x: this.x, y: this.y });
    if (this.trail.length > this.maxTrail) {
      this.trail.shift();
    }

    this.x += this.vx;
    this.y += this.vy;
    // slight air resistance
    this.vy += 0.03;
  }

  draw(ctx) {
    ctx.save();
    ctx.strokeStyle = '#ffd166';
    ctx.lineWidth = 2.5;
    ctx.shadowColor = '#ffb703';
    ctx.shadowBlur = 10;

    ctx.beginPath();
    for (let i = 0; i < this.trail.length; i++) {
      const pt = this.trail[i];
      if (i === 0) ctx.moveTo(pt.x, pt.y);
      else ctx.lineTo(pt.x, pt.y);
    }
    ctx.lineTo(this.x, this.y);
    ctx.stroke();

    // Rocket head ember
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(this.x, this.y, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  hasReachedTarget() {
    // If it reached target altitude or starts moving downward
    return this.y <= this.targetY || this.vy >= 0;
  }
}

/**
 * Colorful Fireworks Explosion Particle
 */
class FireworkParticle {
  constructor(x, y, angle, speed, color) {
    this.x = x;
    this.y = y;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    this.color = color;
    this.alpha = 1;
    this.decay = Math.random() * 0.018 + 0.012;
    this.gravity = 0.085;
    this.friction = 0.965;
    this.size = Math.random() * 2.2 + 1.2;
    this.sparkle = Math.random() < 0.4;
  }

  update() {
    this.vx *= this.friction;
    this.vy *= this.friction;
    this.vy += this.gravity;
    this.x += this.vx;
    this.y += this.vy;
    this.alpha -= this.decay;
  }

  draw(ctx) {
    if (this.alpha <= 0) return;
    ctx.save();
    ctx.globalAlpha = Math.max(0, this.alpha);
    ctx.fillStyle = this.color;
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 8;
    ctx.beginPath();
    const radius = this.sparkle ? (Math.random() < 0.5 ? this.size * 1.5 : this.size * 0.6) : this.size;
    ctx.arc(this.x, this.y, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  isDead() {
    return this.alpha <= 0;
  }
}

/**
 * Phuljhadi (Handheld Sparkler) Sizzling Spark
 * High velocity, golden branching sparks with crackle physics
 */
class PhuljhadiSpark {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 6.5 + 2.5;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    this.alpha = 1;
    this.decay = Math.random() * 0.045 + 0.025;
    this.length = Math.random() * 8 + 4;
    this.color = Math.random() < 0.7 ? '#ffd166' : (Math.random() < 0.85 ? '#fff275' : '#ff758f');
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.vy += 0.12; // gravity pulls sparks downward
    this.vx *= 0.95;
    this.vy *= 0.95;
    this.alpha -= this.decay;
  }

  draw(ctx) {
    if (this.alpha <= 0) return;
    ctx.save();
    ctx.globalAlpha = Math.max(0, this.alpha);
    ctx.strokeStyle = this.color;
    ctx.lineWidth = Math.random() * 1.6 + 0.8;
    ctx.shadowColor = '#ffb703';
    ctx.shadowBlur = 6;

    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    ctx.lineTo(this.x - this.vx * 1.5, this.y - this.vy * 1.5);
    ctx.stroke();

    // White core hot tip
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(this.x, this.y, 1, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  isDead() {
    return this.alpha <= 0;
  }
}

/**
 * Floating Sky Lantern (Kandil / Paper Lantern)
 * Gently sways and ascends with glowing warm ember illumination
 */
class SkyLantern {
  constructor(screenWidth, screenHeight, randomY = false) {
    this.screenWidth = screenWidth;
    this.screenHeight = screenHeight;
    this.x = Math.random() * screenWidth;
    this.y = randomY ? Math.random() * screenHeight : screenHeight + Math.random() * 80;
    this.width = Math.random() * 14 + 16;
    this.height = this.width * 1.35;
    this.speedY = Math.random() * 0.6 + 0.35;
    this.swayAngle = Math.random() * Math.PI * 2;
    this.swaySpeed = Math.random() * 0.02 + 0.01;
    this.swayAmount = Math.random() * 0.7 + 0.3;
    this.alpha = Math.random() * 0.35 + 0.65;
  }

  update() {
    this.y -= this.speedY;
    this.swayAngle += this.swaySpeed;
    this.x += Math.sin(this.swayAngle) * this.swayAmount;
  }

  draw(ctx) {
    ctx.save();
    ctx.globalAlpha = this.alpha;
    
    // Lantern body glow
    ctx.shadowColor = 'rgba(255, 170, 0, 0.85)';
    ctx.shadowBlur = 18;

    // Outer lantern shell
    const grad = ctx.createLinearGradient(this.x, this.y, this.x, this.y + this.height);
    grad.addColorStop(0, 'rgba(255, 183, 3, 0.95)');
    grad.addColorStop(0.7, 'rgba(255, 120, 40, 0.9)');
    grad.addColorStop(1, 'rgba(200, 50, 50, 0.85)');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.roundRect(this.x - this.width / 2, this.y, this.width, this.height, 5);
    ctx.fill();

    // Hot flame core at base
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = '#ffeaa7';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(this.x, this.y + this.height * 0.8, this.width * 0.22, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  isDead(screenHeight) {
    return this.y < -60;
  }
}

// Instantiate engine when DOM is ready
let festiveEngine = null;
window.addEventListener('DOMContentLoaded', () => {
  festiveEngine = new FestiveCanvasEngine();
  window.festiveEngine = festiveEngine;
});
