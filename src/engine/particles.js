/**
 * Advanced 2D Particle and Visual FX Engine.
 * Features weapon slash crescent trails, dash dust, ghost trails,
 * bouncy floating combat damage numbers, and KO shockwaves.
 */

export class ParticleSystem {
  constructor() {
    this.particles = [];
    this.ghostTrails = [];
    this.floatingTexts = [];
    this.slashSwooshes = [];
  }

  update(dt) {
    // 1. Update Particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= dt;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
        continue;
      }

      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += (p.gravity || 0) * dt;
      p.size = Math.max(0, p.size + (p.growth || 0) * dt);
      p.alpha = Math.max(0, p.life / p.maxLife);
    }

    // 2. Update Ghost Trails
    for (let i = this.ghostTrails.length - 1; i >= 0; i--) {
      const g = this.ghostTrails[i];
      g.life -= dt;
      if (g.life <= 0) {
        this.ghostTrails.splice(i, 1);
        continue;
      }
      g.alpha = Math.max(0, g.life / g.maxLife) * 0.45;
    }

    // 3. Update Floating Combat Texts (+12, 2 HIT COMBO!)
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const txt = this.floatingTexts[i];
      txt.life -= dt;
      if (txt.life <= 0) {
        this.floatingTexts.splice(i, 1);
        continue;
      }
      txt.y += txt.vy * dt;
      txt.x += txt.vx * dt;
      txt.vy += 80 * dt; // slight downward gravity on float
      txt.scale = Math.min(1.4, txt.scale + dt * 2.5); // Initial bounce pop
      txt.alpha = Math.min(1, txt.life / (txt.maxLife * 0.6));
    }

    // 4. Update Weapon Slash Arcs
    for (let i = this.slashSwooshes.length - 1; i >= 0; i--) {
      const s = this.slashSwooshes[i];
      s.life -= dt;
      if (s.life <= 0) {
        this.slashSwooshes.splice(i, 1);
        continue;
      }
      s.alpha = Math.max(0, s.life / s.maxLife);
    }
  }

  render(ctx) {
    ctx.save();

    // 1. Render Ghost Trails
    for (const g of this.ghostTrails) {
      ctx.save();
      ctx.globalAlpha = g.alpha;
      ctx.translate(g.x, g.y);
      if (!g.isFacingRight) ctx.scale(-1, 1);
      ctx.fillStyle = g.color;
      ctx.beginPath();
      ctx.roundRect(-g.width / 2, -g.height / 2, g.width, g.height, 10);
      ctx.fill();
      ctx.restore();
    }

    // 2. Render Weapon Slash Arcs
    for (const s of this.slashSwooshes) {
      ctx.save();
      ctx.globalAlpha = s.alpha * 0.85;
      ctx.translate(s.x, s.y);
      if (!s.isFacingRight) ctx.scale(-1, 1);
      ctx.rotate(s.rotation);

      const grad = ctx.createLinearGradient(0, -s.radius, s.radius * 1.2, s.radius);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.3, s.color);
      grad.addColorStop(1, 'transparent');

      ctx.fillStyle = grad;
      ctx.beginPath();
      // Crescent blade swoop
      ctx.arc(0, 0, s.radius, -s.sweepAngle / 2, s.sweepAngle / 2);
      ctx.arc(s.radius * 0.25, 0, s.radius * 0.6, s.sweepAngle / 2, -s.sweepAngle / 2, true);
      ctx.closePath();
      ctx.fill();

      // Gleam edge
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.restore();
    }

    // 3. Render Particles
    for (const p of this.particles) {
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;

      if (p.type === 'ring') {
        ctx.strokeStyle = p.color;
        ctx.lineWidth = p.lineWidth || 3;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.stroke();
      } else if (p.type === 'line') {
        ctx.strokeStyle = p.color;
        ctx.lineWidth = p.size;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x - p.vx * 0.04, p.y - p.vy * 0.04);
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // 4. Render Floating Combat Damage Numbers & Combo Banners
    for (const txt of this.floatingTexts) {
      ctx.save();
      ctx.globalAlpha = txt.alpha;
      ctx.translate(txt.x, txt.y);
      ctx.scale(txt.scale, txt.scale);

      ctx.font = txt.isCombo ? '900 22px "Cinzel", sans-serif' : '900 19px "Rajdhani", sans-serif';
      ctx.textAlign = 'center';

      // Outline
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 4;
      ctx.strokeText(txt.text, 0, 0);

      // Fill
      ctx.fillStyle = txt.color;
      ctx.fillText(txt.text, 0, 0);
      ctx.restore();
    }

    ctx.restore();
  }

  // Ghost Trail afterimage
  addGhostTrail(x, y, width, height, isFacingRight, color) {
    this.ghostTrails.push({
      x, y, width, height, isFacingRight,
      color,
      life: 0.16,
      maxLife: 0.16,
      alpha: 0.45
    });
  }

  // Weapon Slash Arc Swoosh
  addSlashSwoosh(x, y, radius, sweepAngle, rotation, isFacingRight, color) {
    this.slashSwooshes.push({
      x, y, radius, sweepAngle, rotation, isFacingRight, color,
      life: 0.16,
      maxLife: 0.16,
      alpha: 1.0
    });
  }

  // Floating Damage Number
  addDamageText(x, y, damage, isHeavy = false) {
    const text = `+${Math.round(damage)}`;
    const color = isHeavy ? '#f87171' : '#fef08a';
    this.floatingTexts.push({
      x: x + (Math.random() - 0.5) * 30,
      y: y - 35,
      vx: (Math.random() - 0.5) * 50,
      vy: -(Math.random() * 80 + 70),
      text,
      color,
      isCombo: false,
      scale: 0.7,
      life: 0.75,
      maxLife: 0.75,
      alpha: 1.0
    });
  }

  // Combo Banner Popup
  addComboText(x, y, count) {
    const text = `${count} HIT COMBO!`;
    const color = count >= 3 ? '#f59e0b' : '#38bdf8';
    this.floatingTexts.push({
      x,
      y: y - 65,
      vx: 0,
      vy: -55,
      text,
      color,
      isCombo: true,
      scale: 0.8,
      life: 1.0,
      maxLife: 1.0,
      alpha: 1.0
    });
  }

  // Dash Dust Burst
  emitDashDust(x, y, isFacingRight) {
    const dir = isFacingRight ? -1 : 1;
    for (let i = 0; i < 9; i++) {
      this.particles.push({
        x: x + (Math.random() - 0.5) * 15,
        y: y + 26,
        vx: (Math.random() * 120 + 80) * dir,
        vy: -(Math.random() * 45 + 15),
        size: Math.random() * 5 + 3,
        growth: 4,
        life: 0.22,
        maxLife: 0.22,
        color: '#cbd5e1'
      });
    }
  }

  // Skid Friction Dust
  emitSkidDust(x, y, dir) {
    for (let i = 0; i < 6; i++) {
      this.particles.push({
        x: x + (Math.random() - 0.5) * 20,
        y: y + 28,
        vx: dir * (Math.random() * 90 + 30),
        vy: -(Math.random() * 50 + 10),
        size: Math.random() * 4 + 2,
        growth: 3,
        life: 0.2,
        maxLife: 0.2,
        color: '#e2e8f0'
      });
    }
  }

  // Hit Spark Explosion
  emitHitSpark(x, y, color = '#facc15', isHeavy = false) {
    const count = isHeavy ? 30 : 16;
    const speed = isHeavy ? 480 : 280;

    // Center ring shockwave
    this.particles.push({
      x, y, vx: 0, vy: 0,
      size: 12,
      growth: isHeavy ? 200 : 110,
      life: 0.2,
      maxLife: 0.2,
      color: '#ffffff',
      type: 'ring',
      lineWidth: isHeavy ? 6 : 3
    });

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const spd = (Math.random() * 0.7 + 0.3) * speed;
      this.particles.push({
        x, y,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd,
        gravity: 220,
        size: Math.random() * (isHeavy ? 5 : 3) + 2,
        life: Math.random() * 0.28 + 0.15,
        maxLife: 0.42,
        color: Math.random() > 0.4 ? color : '#ffffff',
        type: 'line'
      });
    }
  }

  // KO Blast Ring Explosion
  emitKOExplosion(x, y, color = '#ef4444') {
    this.particles.push({
      x, y, vx: 0, vy: 0,
      size: 20, growth: 700,
      life: 0.55, maxLife: 0.55,
      color: '#ffffff',
      type: 'ring', lineWidth: 9
    });
    this.particles.push({
      x, y, vx: 0, vy: 0,
      size: 10, growth: 450,
      life: 0.7, maxLife: 0.7,
      color: color,
      type: 'ring', lineWidth: 16
    });

    for (let i = 0; i < 55; i++) {
      const angle = Math.random() * Math.PI * 2;
      const spd = Math.random() * 700 + 220;
      this.particles.push({
        x, y,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd,
        gravity: 0,
        size: Math.random() * 7 + 3,
        life: Math.random() * 0.55 + 0.3,
        maxLife: 0.85,
        color: Math.random() > 0.3 ? color : '#fef08a',
        type: 'line'
      });
    }
  }

  emitJumpDust(x, y) {
    for (let i = 0; i < 9; i++) {
      const dir = (Math.random() - 0.5) * 180;
      this.particles.push({
        x: x + (Math.random() - 0.5) * 20,
        y: y + 25,
        vx: dir,
        vy: -(Math.random() * 50 + 20),
        size: Math.random() * 4 + 3,
        growth: 4,
        life: 0.25,
        maxLife: 0.25,
        color: '#94a3b8'
      });
    }
  }

  emitWallSparks(x, y, isFacingRight) {
    if (Math.random() > 0.4) return;
    const dir = isFacingRight ? -1 : 1;
    this.particles.push({
      x, y: y + 20,
      vx: (Math.random() * 70 + 30) * dir,
      vy: -(Math.random() * 80 + 20),
      gravity: 300,
      size: 2,
      life: 0.15,
      maxLife: 0.15,
      color: '#f59e0b'
    });
  }

  emitSigAura(x, y, color = '#60a5fa') {
    this.particles.push({
      x: x + (Math.random() - 0.5) * 35,
      y: y + (Math.random() - 0.5) * 45,
      vx: (Math.random() - 0.5) * 35,
      vy: -(Math.random() * 80 + 50),
      size: Math.random() * 5 + 3,
      growth: -2,
      life: 0.3,
      maxLife: 0.3,
      color: color
    });
  }
}

export const particles = new ParticleSystem();
