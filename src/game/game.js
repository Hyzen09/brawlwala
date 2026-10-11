/**
 * Main Match Director managing camera framing, screen shake, hitstop,
 * collision resolution, stock tracking, and victory conditions.
 */

import { Character } from './character.js';
import { Stage } from './stage.js';
import { FighterAI } from './ai.js';
import { sound } from '../engine/audio.js';
import { input } from '../engine/input.js';
import { particles } from '../engine/particles.js';

export class GameDirector {
  constructor(canvas, uiHooks) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.uiHooks = uiHooks;

    this.width = canvas.width;
    this.height = canvas.height;

    this.stage = new Stage(this.width, this.height);
    this.ai = new FighterAI('normal');

    this.p1 = null;
    this.p2 = null;

    this.mode = 'vs_ai'; // 'vs_ai', 'pvp', 'training'
    this.difficulty = 'normal';
    this.maxStocks = 3;
    this.matchDuration = 180; // 3 minutes in seconds
    this.timer = this.matchDuration;

    this.isRunning = false;
    this.isPaused = false;
    this.showHitboxes = false;

    // Camera & Screen Shake
    this.camX = this.width / 2;
    this.camY = this.height / 2;
    this.camZoom = 1.0;
    this.screenShake = 0;
    this.hitstopTimer = 0;

    // Keyboard Shortcuts (Debug hitboxes & Pause)
    window.addEventListener('keydown', (e) => {
      if (e.key === 'h' || e.key === 'H') {
        this.showHitboxes = !this.showHitboxes;
      }
      if (e.key === 'Escape') {
        this.togglePause();
      }
    });
  }

  startMatch(p1Config, p2Config, mode = 'vs_ai', difficulty = 'normal', stocks = 3) {
    this.mode = mode;
    this.difficulty = difficulty;
    this.maxStocks = parseInt(stocks, 10);
    this.timer = this.matchDuration;
    this.isPaused = false;
    this.isRunning = true;

    this.ai.setDifficulty(difficulty);

    // Spawn Locations
    const spawnY = this.stage.mainPlatform.y - 120;
    const spawnP1X = this.stage.mainPlatform.x + 120;
    const spawnP2X = this.stage.mainPlatform.x + this.stage.mainPlatform.w - 120;

    this.p1 = new Character(p1Config, spawnP1X, spawnY, true, 1);
    this.p2 = new Character(p2Config, spawnP2X, spawnY, false, 2);

    this.p1.stocks = this.maxStocks;
    this.p2.stocks = this.maxStocks;

    sound.playMatchStart();
    sound.startMusic();

    this.uiHooks.onMatchStart({
      p1: this.p1,
      p2: this.p2,
      maxStocks: this.maxStocks
    });
  }

  togglePause() {
    if (!this.isRunning) return;
    this.isPaused = !this.isPaused;
    this.uiHooks.onPauseChange(this.isPaused);
  }

  update(dt) {
    if (!this.isRunning || this.isPaused) return;

    // Handle Hitstop (freeze-frame on big impact)
    if (this.hitstopTimer > 0) {
      this.hitstopTimer -= dt;
      return;
    }

    // Match Timer Countdown
    if (this.mode !== 'training') {
      this.timer -= dt;
      if (this.timer <= 0) {
        this.timer = 0;
        this.handleTimeout();
        return;
      }
    }

    input.update();

    // 1. Process Inputs
    const p1Input = input.getState('p1');
    let p2Input;
    if (this.mode === 'pvp') {
      p2Input = input.getState('p2');
    } else if (this.mode === 'training') {
      // Training dummy stands still
      p2Input = { left: false, right: false, up: false, down: false, jump: false, light: false, heavy: false, dodge: false };
    } else {
      // Intelligent AI Bot
      p2Input = this.ai.update(this.p2, this.p1, this.stage, dt);
    }

    // 2. Update Fighters
    this.p1.update(dt, p1Input, this.p2);
    this.p2.update(dt, p2Input, this.p1);

    // 3. Platform & Stage Collisions
    this.stage.checkCollisions(this.p1);
    this.stage.checkCollisions(this.p2);
    this.stage.update(dt);

    // 4. Hitbox Combat Collision Check
    this.checkCombatHits();

    // 5. Blast Zone KO Detection
    this.checkBlastZones();

    // 6. Update Particles
    particles.update(dt);

    // 7. Update Dynamic Camera Framing
    this.updateCamera(dt);

    // 8. Screen Shake Decay
    if (this.screenShake > 0) {
      this.screenShake = Math.max(0, this.screenShake - dt * 28);
    }

    // 9. Update UI HUD
    this.uiHooks.onHudUpdate({
      p1: this.p1,
      p2: this.p2,
      timer: this.timer
    });
  }

  checkCombatHits() {
    // Check P1 striking P2
    const hb1 = this.p1.getHitboxBounds();
    const hurt2 = this.p2.getHurtboxBounds();
    if (hb1 && !this.p1.hasHitOpponent && this.intersects(hb1, hurt2)) {
      const hitConnected = this.p2.takeHit(hb1.data, this.p1);
      if (hitConnected) {
        this.p1.hasHitOpponent = true;
        this.screenShake = hb1.data.isHeavy ? 14 : 6;
        this.hitstopTimer = hb1.data.isHeavy ? 0.08 : 0.04;
      }
    }

    // Check P2 striking P1
    const hb2 = this.p2.getHitboxBounds();
    const hurt1 = this.p1.getHurtboxBounds();
    if (hb2 && !this.p2.hasHitOpponent && this.intersects(hb2, hurt1)) {
      const hitConnected = this.p1.takeHit(hb2.data, this.p2);
      if (hitConnected) {
        this.p2.hasHitOpponent = true;
        this.screenShake = hb2.data.isHeavy ? 14 : 6;
        this.hitstopTimer = hb2.data.isHeavy ? 0.08 : 0.04;
      }
    }
  }

  intersects(r1, r2) {
    return !(
      r2.x > r1.x + r1.w ||
      r2.x + r2.w < r1.x ||
      r2.y > r1.y + r1.h ||
      r2.y + r2.h < r1.y
    );
  }

  checkBlastZones() {
    // P1 Ring Out
    if (this.stage.isOutOfBounds(this.p1.x, this.p1.y)) {
      this.handleKO(this.p1, this.p2);
    }

    // P2 Ring Out
    if (this.stage.isOutOfBounds(this.p2.x, this.p2.y)) {
      this.handleKO(this.p2, this.p1);
    }
  }

  handleKO(victim, killer) {
    sound.playKO();
    particles.emitKOExplosion(victim.x, victim.y, victim.config.primaryColor);
    this.screenShake = 24;

    killer.statsData.kos++;
    victim.stocks--;

    if (this.mode !== 'training' && victim.stocks <= 0) {
      this.handleVictory(killer, victim);
      return;
    }

    // Respawn on heavenly platform high above stage
    const respawnX = this.stage.mainPlatform.x + this.stage.mainPlatform.w / 2;
    const respawnY = this.stage.mainPlatform.y - 180;
    victim.reset(respawnX, respawnY, killer.x > respawnX);
  }

  handleTimeout() {
    // Determine winner by higher stocks or lower damage
    let winner = this.p1;
    let loser = this.p2;
    if (this.p2.stocks > this.p1.stocks || (this.p2.stocks === this.p1.stocks && this.p2.damage < this.p1.damage)) {
      winner = this.p2;
      loser = this.p1;
    }
    this.handleVictory(winner, loser);
  }

  handleVictory(winner, loser) {
    this.isRunning = false;
    sound.stopMusic();
    sound.playVictory();

    this.uiHooks.onMatchEnd({
      winner,
      loser,
      stats: {
        winnerDamage: Math.round(winner.statsData.damageDealt),
        winnerKOs: winner.statsData.kos,
        winnerAccuracy: winner.statsData.attacksAttempted > 0
          ? Math.round((winner.statsData.attacksLanded / winner.statsData.attacksAttempted) * 100)
          : 0,
        loserDamage: Math.round(loser.statsData.damageDealt)
      }
    });
  }

  updateCamera(dt) {
    if (!this.p1 || !this.p2) return;

    // Center point between players
    const targetX = (this.p1.x + this.p2.x) / 2;
    const targetY = (this.p1.y + this.p2.y) / 2 - 40;

    // Distance between players
    const dx = Math.abs(this.p1.x - this.p2.x);
    const dy = Math.abs(this.p1.y - this.p2.y);
    const maxDist = Math.max(dx, dy);

    // Target Zoom (1.1 close, 0.75 far)
    const targetZoom = Math.max(0.75, Math.min(1.15, 780 / (maxDist + 350)));

    // Smooth Lerp
    this.camX += (targetX - this.camX) * 4 * dt;
    this.camY += (targetY - this.camY) * 4 * dt;
    this.camZoom += (targetZoom - this.camZoom) * 3 * dt;
  }

  render() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);

    ctx.save();

    // Screen Shake
    if (this.screenShake > 0) {
      const shakeAmt = this.screenShake;
      const offsetX = (Math.random() - 0.5) * shakeAmt * 2;
      const offsetY = (Math.random() - 0.5) * shakeAmt * 2;
      ctx.translate(offsetX, offsetY);
    }

    // Camera Transform (Pivot around screen center)
    ctx.translate(this.width / 2, this.height / 2);
    ctx.scale(this.camZoom, this.camZoom);
    ctx.translate(-this.camX, -this.camY);

    // 1. Render Sky & Background
    this.stage.renderBackground(ctx);

    // 2. Render Stage Islands & Platforms
    this.stage.renderStage(ctx);

    // 3. Render Particles
    particles.render(ctx);

    // 4. Render Characters
    if (this.p1) this.p1.render(ctx, this.showHitboxes);
    if (this.p2) this.p2.render(ctx, this.showHitboxes);

    ctx.restore();
  }
}
