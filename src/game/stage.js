/**
 * Interactive Platform Fighter Stage inspired by Brawlhaven & Mammoth Fortress.
 * Features solid main island, vertical wall-jump surfaces, soft floating platforms, and blast zones.
 */

export class Stage {
  constructor(width = 1280, height = 720) {
    this.width = width;
    this.height = height;

    // Main Stage Solid Platform (x, y, w, h)
    this.mainPlatform = {
      x: 340,
      y: 440,
      w: 600,
      h: 220,
      color: '#1e293b',
      rimColor: '#f59e0b',
      isSolid: true
    };

    // Soft Platforms (jump-through and drop-down)
    this.softPlatforms = [
      { x: 390, y: 310, w: 180, h: 14, color: '#3b82f6', rimColor: '#60a5fa', isSoft: true },
      { x: 710, y: 310, w: 180, h: 14, color: '#3b82f6', rimColor: '#60a5fa', isSoft: true },
      { x: 550, y: 200, w: 180, h: 14, color: '#f59e0b', rimColor: '#fde047', isSoft: true }
    ];

    // Blast Zones (Off-screen boundary limits where characters are KO'd)
    this.blastZones = {
      left: -180,
      right: 1460,
      top: -300,
      bottom: 820
    };

    // Cloud background simulation
    this.clouds = [
      { x: 100, y: 120, spd: 15, scale: 1.2 },
      { x: 500, y: 80, spd: 22, scale: 1.8 },
      { x: 900, y: 140, spd: 12, scale: 1.4 },
      { x: 300, y: 220, spd: 18, scale: 1.0 },
      { x: 800, y: 250, spd: 25, scale: 1.6 }
    ];
  }

  update(dt) {
    for (const c of this.clouds) {
      c.x += c.spd * dt;
      if (c.x > this.width + 200) {
        c.x = -250;
      }
    }
  }

  renderBackground(ctx) {
    // Majestic Sky Gradient
    const skyGrad = ctx.createLinearGradient(0, 0, 0, this.height);
    skyGrad.addColorStop(0, '#0a1128');
    skyGrad.addColorStop(0.4, '#1c2541');
    skyGrad.addColorStop(0.7, '#3a506b');
    skyGrad.addColorStop(1, '#1b2a47');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, this.width, this.height);

    // Distant Valhalla Citadel & Mountain Silhouettes
    ctx.fillStyle = 'rgba(15, 23, 42, 0.65)';
    ctx.beginPath();
    ctx.moveTo(0, 480);
    ctx.lineTo(200, 360);
    ctx.lineTo(380, 440);
    ctx.lineTo(540, 330);
    ctx.lineTo(720, 420);
    ctx.lineTo(920, 310);
    ctx.lineTo(1100, 410);
    ctx.lineTo(1280, 350);
    ctx.lineTo(1280, this.height);
    ctx.lineTo(0, this.height);
    ctx.fill();

    // Floating Clouds
    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    for (const c of this.clouds) {
      this.drawCloud(ctx, c.x, c.y, c.scale);
    }

    // Distant Floating Islands
    this.drawFloatingIslet(ctx, 160, 260, 90, '#1a2238');
    this.drawFloatingIslet(ctx, 1080, 240, 110, '#1a2238');
  }

  drawCloud(ctx, x, y, scale) {
    ctx.beginPath();
    ctx.arc(x, y, 35 * scale, 0, Math.PI * 2);
    ctx.arc(x + 35 * scale, y - 10 * scale, 45 * scale, 0, Math.PI * 2);
    ctx.arc(x + 75 * scale, y, 35 * scale, 0, Math.PI * 2);
    ctx.arc(x + 40 * scale, y + 15 * scale, 30 * scale, 0, Math.PI * 2);
    ctx.fill();
  }

  drawFloatingIslet(ctx, x, y, w, color) {
    ctx.save();
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(x, y, w, 22, 0, 0, Math.PI * 2);
    ctx.fill();

    // Roots dangling underneath
    ctx.beginPath();
    ctx.moveTo(x - w * 0.7, y);
    ctx.lineTo(x, y + 55);
    ctx.lineTo(x + w * 0.7, y);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  renderStage(ctx) {
    const mp = this.mainPlatform;

    // Draw Main Island Base (Rock underside)
    ctx.save();
    const rockGrad = ctx.createLinearGradient(mp.x, mp.y, mp.x, mp.y + mp.h);
    rockGrad.addColorStop(0, '#2d3748');
    rockGrad.addColorStop(0.3, '#1a202c');
    rockGrad.addColorStop(1, '#0f172a');

    ctx.fillStyle = rockGrad;
    ctx.beginPath();
    ctx.moveTo(mp.x, mp.y);
    ctx.lineTo(mp.x + mp.w, mp.y);
    ctx.lineTo(mp.x + mp.w - 40, mp.y + mp.h * 0.6);
    ctx.lineTo(mp.x + mp.w / 2 + 50, mp.y + mp.h);
    ctx.lineTo(mp.x + mp.w / 2 - 30, mp.y + mp.h - 20);
    ctx.lineTo(mp.x + 40, mp.y + mp.h * 0.7);
    ctx.closePath();
    ctx.fill();

    // Side wall trim lines (indicating wall-jump grip surface)
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(mp.x, mp.y + 10);
    ctx.lineTo(mp.x, mp.y + 160);
    ctx.moveTo(mp.x + mp.w, mp.y + 10);
    ctx.lineTo(mp.x + mp.w, mp.y + 160);
    ctx.stroke();

    // Main Stage Top Grass & Stone Slab
    const slabGrad = ctx.createLinearGradient(mp.x, mp.y, mp.x, mp.y + 20);
    slabGrad.addColorStop(0, '#38a169'); // Emerald grass rim
    slabGrad.addColorStop(0.4, '#2f855a');
    slabGrad.addColorStop(1, '#2d3748');

    ctx.fillStyle = slabGrad;
    ctx.fillRect(mp.x, mp.y, mp.w, 18);

    // Glowing Golden Border Trim
    ctx.strokeStyle = mp.rimColor;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(mp.x - 2, mp.y);
    ctx.lineTo(mp.x + mp.w + 2, mp.y);
    ctx.stroke();

    // Soft Platforms
    for (const sp of this.softPlatforms) {
      // Platform stone body
      ctx.fillStyle = 'rgba(30, 41, 59, 0.9)';
      ctx.fillRect(sp.x, sp.y, sp.w, sp.h);

      // Glowing top lip
      ctx.strokeStyle = sp.rimColor;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(sp.x, sp.y);
      ctx.lineTo(sp.x + sp.w, sp.y);
      ctx.stroke();

      // Gem rune in center
      ctx.fillStyle = sp.rimColor;
      ctx.beginPath();
      ctx.arc(sp.x + sp.w / 2, sp.y + sp.h / 2, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  // Check collision of an entity bounding box with platforms
  checkCollisions(entity) {
    const prevY = entity.prevY;
    const currY = entity.y;
    const feetY = entity.y + entity.height / 2;
    const prevFeetY = prevY + entity.height / 2;
    const footX = entity.x;

    let landed = false;

    // Check Main Platform Top Surface
    const mp = this.mainPlatform;
    if (footX >= mp.x - 10 && footX <= mp.x + mp.w + 10) {
      if (prevFeetY <= mp.y + 12 && feetY >= mp.y && entity.vy >= 0) {
        entity.y = mp.y - entity.height / 2;
        entity.vy = 0;
        landed = true;
        entity.isGrounded = true;
      }
    }

    // Check Wall Cling on Left & Right vertical walls of main platform
    entity.isWallClinging = false;
    entity.wallSide = 0; // -1 left wall, +1 right wall

    if (!entity.isGrounded && feetY > mp.y + 10 && currY < mp.y + mp.h * 0.75) {
      const leftEdgeDist = Math.abs((entity.x + entity.width / 2) - mp.x);
      const rightEdgeDist = Math.abs((entity.x - entity.width / 2) - (mp.x + mp.w));

      if (leftEdgeDist < 12 && entity.vx >= -1) {
        entity.isWallClinging = true;
        entity.wallSide = -1;
        entity.x = mp.x - entity.width / 2;
      } else if (rightEdgeDist < 12 && entity.vx <= 1) {
        entity.isWallClinging = true;
        entity.wallSide = 1;
        entity.x = mp.x + mp.w + entity.width / 2;
      }
    }

    // Check Soft Platforms (if not passing through by holding down)
    if (!landed && !entity.dropThrough) {
      for (const sp of this.softPlatforms) {
        if (footX >= sp.x - 8 && footX <= sp.x + sp.w + 8) {
          if (prevFeetY <= sp.y + 8 && feetY >= sp.y && entity.vy >= 0) {
            entity.y = sp.y - entity.height / 2;
            entity.vy = 0;
            landed = true;
            entity.isGrounded = true;
            break;
          }
        }
      }
    }

    if (!landed && !entity.isWallClinging) {
      entity.isGrounded = false;
    }
  }

  isOutOfBounds(x, y) {
    return (
      x < this.blastZones.left ||
      x > this.blastZones.right ||
      y < this.blastZones.top ||
      y > this.blastZones.bottom
    );
  }
}
