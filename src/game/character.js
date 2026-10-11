/**
 * Articulated Vector-Skeletal Character Engine for Brawlhalla Web.
 * Recreates authentic platform fighter physics: dash dancing, jump squat,
 * apex float, fast fall, squash & stretch, input buffering, chase dodge,
 * true weapon combos, and multi-joint skeletal animation with secondary cape physics.
 */

import { sound } from '../engine/audio.js';
import { particles } from '../engine/particles.js';
import { getWeaponAttacks } from './characterData.js';

export const STATES = {
  IDLE: 'IDLE',
  RUN: 'RUN',
  DASH: 'DASH',
  DASH_PIVOT: 'DASH_PIVOT',
  JUMP_SQUAT: 'JUMP_SQUAT',
  JUMP: 'JUMP',
  FALL: 'FALL',
  WALL_SLIDE: 'WALL_SLIDE',
  DODGE: 'DODGE',
  CHASE_DODGE: 'CHASE_DODGE',
  ATTACK_STARTUP: 'ATTACK_STARTUP',
  ATTACK_ACTIVE: 'ATTACK_ACTIVE',
  ATTACK_RECOVERY: 'ATTACK_RECOVERY',
  STUNNED: 'STUNNED',
  RESPAWN: 'RESPAWN'
};

export class Character {
  constructor(config, x, y, isFacingRight = true, playerNum = 1) {
    this.config = config;
    this.playerNum = playerNum;
    this.weaponAttacks = getWeaponAttacks(config.weaponType);

    this.x = x;
    this.y = y;
    this.prevX = x;
    this.prevY = y;
    this.vx = 0;
    this.vy = 0;
    this.width = 44;
    this.height = 74;
    this.isFacingRight = isFacingRight;

    // Movement & Physics Feel
    this.isGrounded = false;
    this.isWallClinging = false;
    this.wallSide = 0;
    this.maxJumps = 3; // 1 ground + 2 aerial
    this.jumpsRemaining = this.maxJumps;
    this.wallJumpsRemaining = 4;
    this.dropThrough = false;
    this.isFastFalling = false;

    // Combat State & Damage Percentage
    this.damage = 0;
    this.stocks = 3;
    this.state = STATES.IDLE;
    this.stateTimer = 0;

    // Dash & Dodge Mechanics
    this.dashTimer = 0;
    this.dodgeCooldown = 0;
    this.invulnerableTimer = 0;
    this.chaseDodgeWindow = 0; // Granted on successful hit!

    // Attack & Combo State
    this.currentAttack = null;
    this.activeHitbox = null;
    this.hasHitOpponent = false;
    this.inputBuffer = null; // Buffered command for frame-perfect chains
    this.comboCount = 0;
    this.comboResetTimer = 0;

    // Visual Articulation & Squash/Stretch
    this.animTime = 0;
    this.scaleX = 1.0;
    this.scaleY = 1.0;
    this.torsoLean = 0;
    this.capeWave = [0, 0, 0, 0]; // 4-segment trailing cape physics
    this.renderFlash = 0;
    this.targetOpponent = null;

    // Match Stats
    this.statsData = {
      damageDealt: 0,
      kos: 0,
      attacksLanded: 0,
      attacksAttempted: 0
    };
  }

  reset(x, y, isFacingRight = true) {
    this.x = x;
    this.y = y;
    this.prevX = x;
    this.prevY = y;
    this.vx = 0;
    this.vy = 0;
    this.damage = 0;
    this.isGrounded = false;
    this.isWallClinging = false;
    this.isFastFalling = false;
    this.state = STATES.RESPAWN;
    this.stateTimer = 0.9;
    this.invulnerableTimer = 2.0;
    this.isFacingRight = isFacingRight;
    this.jumpsRemaining = this.maxJumps;
    this.currentAttack = null;
    this.activeHitbox = null;
    this.scaleX = 1.0;
    this.scaleY = 1.0;
    this.comboCount = 0;
  }

  update(dt, inputState, opponent) {
    this.targetOpponent = opponent;
    this.prevX = this.x;
    this.prevY = this.y;
    this.animTime += dt;
    this.stateTimer -= dt;

    // Timers
    if (this.dodgeCooldown > 0) this.dodgeCooldown -= dt;
    if (this.invulnerableTimer > 0) this.invulnerableTimer -= dt;
    if (this.chaseDodgeWindow > 0) this.chaseDodgeWindow -= dt;
    if (this.renderFlash > 0) this.renderFlash -= dt;

    // Combo streak decay timer
    if (this.comboResetTimer > 0) {
      this.comboResetTimer -= dt;
      if (this.comboResetTimer <= 0) {
        this.comboCount = 0;
      }
    }

    // Squash & Stretch Spring Decay back to 1.0
    this.scaleX += (1.0 - this.scaleX) * 12 * dt;
    this.scaleY += (1.0 - this.scaleY) * 12 * dt;

    // Secondary Cape Motion Physics Simulation
    this.updateCapePhysics(dt);

    // Buffer attack inputs
    if (inputState.light || inputState.heavy || inputState.dodge) {
      this.inputBuffer = { ...inputState, time: 0.12 };
    }
    if (this.inputBuffer) {
      this.inputBuffer.time -= dt;
      if (this.inputBuffer.time <= 0) this.inputBuffer = null;
    }

    // Dynamic Speed Calculations based on Speed & Dexterity stats
    const spdStat = this.config.stats.spd;
    const dexStat = this.config.stats.dex;
    const runMaxSpeed = 380 + spdStat * 18;
    const dashMaxSpeed = 560 + spdStat * 22;
    const airMaxSpeed = 340 + spdStat * 16;
    const dexFactor = 0.85 + (dexStat / 10) * 0.3;

    // State Machine
    switch (this.state) {
      case STATES.RESPAWN:
        this.vx = 0;
        this.vy = 0;
        if (this.stateTimer <= 0) {
          this.state = STATES.FALL;
        }
        return;

      case STATES.STUNNED:
        this.applyGravity(dt);
        this.x += this.vx * dt;
        this.y += this.vy * dt;
        this.vx *= Math.pow(0.25, dt);
        this.torsoLean = -this.vx * 0.0015;
        if (this.stateTimer <= 0) {
          this.state = this.isGrounded ? STATES.IDLE : STATES.FALL;
        }
        return;

      case STATES.DODGE:
      case STATES.CHASE_DODGE:
        this.updateDodge(dt);
        return;

      case STATES.JUMP_SQUAT:
        // Jump anticipation crouch (3 frames)
        this.scaleX = 1.25;
        this.scaleY = 0.75;
        if (this.stateTimer <= 0) {
          this.executeJumpLaunch();
        }
        return;

      case STATES.DASH:
        this.updateDash(dt, inputState);
        return;

      case STATES.DASH_PIVOT:
        // Turnaround skid
        this.vx *= Math.pow(0.08, dt);
        this.x += this.vx * dt;
        if (this.stateTimer <= 0) {
          this.state = STATES.RUN;
        }
        return;

      case STATES.ATTACK_STARTUP:
      case STATES.ATTACK_ACTIVE:
      case STATES.ATTACK_RECOVERY:
        this.updateAttackPhases(dt, dexFactor);
        return;

      default:
        // Free Movement
        this.handleLocomotion(dt, inputState, runMaxSpeed, dashMaxSpeed, airMaxSpeed);
        this.checkAttackTriggers(inputState);
        break;
    }
  }

  // =========================================================================
  // 1. MOVEMENT SYSTEM: DASH DANCING, APEX FLOAT & FAST FALL
  // =========================================================================
  handleLocomotion(dt, input, runMaxSpd, dashMaxSpd, airMaxSpd) {
    const { left, right, up, down, jump, dodge } = input;
    this.dropThrough = down;

    // Check Dodge or Ground Dash
    if (dodge && this.dodgeCooldown <= 0) {
      if (this.chaseDodgeWindow > 0) {
        this.executeChaseDodge(left, right, up, down);
        return;
      }
      if (this.isGrounded && (left || right)) {
        this.executeGroundDash(right ? 1 : -1, dashMaxSpd);
        return;
      }
      this.executeAirDodge(left, right, up, down);
      return;
    }

    // Horizontal Locomotion with Acceleration & Friction Curves
    const accelRate = 2800;
    const frictionRate = 3400;

    if (this.isGrounded) {
      if (left && !right) {
        if (this.vx > 60) {
          // Dash-dance turnaround skid!
          sound.playSkid();
          particles.emitSkidDust(this.x, this.y, 1);
          this.state = STATES.DASH_PIVOT;
          this.stateTimer = 0.08;
          this.isFacingRight = false;
          return;
        }
        this.vx = Math.max(-runMaxSpd, this.vx - accelRate * dt);
        this.isFacingRight = false;
        this.state = STATES.RUN;
        this.torsoLean = -0.18;
      } else if (right && !left) {
        if (this.vx < -60) {
          sound.playSkid();
          particles.emitSkidDust(this.x, this.y, -1);
          this.state = STATES.DASH_PIVOT;
          this.stateTimer = 0.08;
          this.isFacingRight = true;
          return;
        }
        this.vx = Math.min(runMaxSpd, this.vx + accelRate * dt);
        this.isFacingRight = true;
        this.state = STATES.RUN;
        this.torsoLean = 0.18;
      } else {
        // Friction stop
        if (this.vx > 0) this.vx = Math.max(0, this.vx - frictionRate * dt);
        else if (this.vx < 0) this.vx = Math.min(0, this.vx + frictionRate * dt);
        this.state = STATES.IDLE;
        this.torsoLean = 0;
      }
    } else {
      // Aerial Drift Control
      const airAccel = 2200;
      if (left && !right) {
        this.vx = Math.max(-airMaxSpd, this.vx - airAccel * dt);
        this.isFacingRight = false;
      } else if (right && !left) {
        this.vx = Math.min(airMaxSpd, this.vx + airAccel * dt);
        this.isFacingRight = true;
      } else {
        this.vx *= Math.pow(0.55, dt);
      }
    }

    // Wall Cling & Wall Jump
    if (this.isWallClinging) {
      this.state = STATES.WALL_SLIDE;
      this.vy = Math.min(this.vy, 110); // Controlled wall slide friction
      this.isFastFalling = false;

      if (jump) {
        sound.playJump();
        this.vy = -580;
        this.vx = (this.wallSide < 0 ? 1 : -1) * 380;
        this.isFacingRight = this.vx > 0;
        this.jumpsRemaining = this.maxJumps - 1;
        this.state = STATES.JUMP;
        this.scaleX = 0.8;
        this.scaleY = 1.25;
        this.isWallClinging = false;
        particles.emitJumpDust(this.x, this.y + 20);
        return;
      }
    }

    // Jump Initiation (triggers jump squat)
    if (jump && !this.prevJumpInput) {
      if (this.isGrounded) {
        this.state = STATES.JUMP_SQUAT;
        this.stateTimer = 0.045; // 3 frames squat
        return;
      } else if (this.jumpsRemaining > 0) {
        sound.playJump();
        this.vy = -570;
        this.jumpsRemaining--;
        this.state = STATES.JUMP;
        this.scaleX = 0.82;
        this.scaleY = 1.24;
        this.isFastFalling = false;
        particles.emitJumpDust(this.x, this.y + this.height / 2);
      }
    }
    this.prevJumpInput = jump;

    // Fast-Fall Snap (Tapping down at apex or falling)
    if (!this.isGrounded && down && this.vy > -50 && !this.isFastFalling) {
      this.isFastFalling = true;
      this.vy = Math.max(this.vy, 760);
      particles.addGhostTrail(this.x, this.y, this.width, this.height, this.isFacingRight, '#60a5fa');
    }

    // Gravity & Apex Float
    if (!this.isGrounded) {
      this.applyGravity(dt);
      if (this.state !== STATES.JUMP && !this.isWallClinging) {
        this.state = STATES.FALL;
      }
    } else {
      this.jumpsRemaining = this.maxJumps;
      this.wallJumpsRemaining = 4;
      this.isFastFalling = false;
    }

    this.x += this.vx * dt;
    this.y += this.vy * dt;
  }

  executeJumpLaunch() {
    sound.playJump();
    this.vy = -640;
    this.isGrounded = false;
    this.jumpsRemaining--;
    this.state = STATES.JUMP;
    this.scaleX = 0.8;
    this.scaleY = 1.3;
    particles.emitJumpDust(this.x, this.y + this.height / 2);
  }

  applyGravity(dt) {
    let gravity = 1350;
    // Apex float: lighter gravity near jump peak
    if (Math.abs(this.vy) < 90 && !this.isFastFalling) {
      gravity = 800;
    }
    const maxFall = this.isFastFalling ? 780 : 660;
    this.vy = Math.min(this.vy + gravity * dt, maxFall);
  }

  executeGroundDash(dir, maxSpeed) {
    sound.playDash();
    this.state = STATES.DASH;
    this.stateTimer = 0.22;
    this.dashTimer = 0.22;
    this.dodgeCooldown = 0.8;
    this.vx = dir * maxSpeed;
    this.isFacingRight = dir > 0;
    this.torsoLean = dir * 0.35;
    this.scaleX = 1.25;
    this.scaleY = 0.85;

    particles.emitDashDust(this.x, this.y, this.isFacingRight);
    particles.addGhostTrail(this.x, this.y, this.width, this.height, this.isFacingRight, this.config.primaryColor);
  }

  updateDash(dt, input) {
    this.x += this.vx * dt;
    this.torsoLean = (this.isFacingRight ? 1 : -1) * 0.32;

    // Motion ghost trail
    if (Math.random() < 0.35) {
      particles.addGhostTrail(this.x, this.y, this.width, this.height, this.isFacingRight, this.config.primaryColor);
    }

    // Cancel dash into attack or jump
    if (input.jump) {
      this.state = STATES.JUMP_SQUAT;
      this.stateTimer = 0.04;
      return;
    }
    if (input.light || input.heavy) {
      this.checkAttackTriggers(input);
      return;
    }

    if (this.stateTimer <= 0) {
      this.state = this.isGrounded ? STATES.RUN : STATES.FALL;
    }
  }

  executeAirDodge(left, right, up, down) {
    sound.playDodge();
    this.state = STATES.DODGE;
    this.stateTimer = 0.28;
    this.invulnerableTimer = 0.28;
    this.dodgeCooldown = 1.25;

    let dirX = 0, dirY = 0;
    if (left) dirX -= 1;
    if (right) dirX += 1;
    if (up) dirY -= 1;
    if (down) dirY += 1;

    if (dirX === 0 && dirY === 0) {
      this.vx = 0;
      this.vy = 0;
    } else {
      const len = Math.hypot(dirX, dirY);
      const dashSpeed = 500;
      this.vx = (dirX / len) * dashSpeed;
      this.vy = (dirY / len) * dashSpeed;
    }
    particles.addGhostTrail(this.x, this.y, this.width, this.height, this.isFacingRight, '#ffffff');
  }

  executeChaseDodge(left, right, up, down) {
    sound.playChaseDodge();
    this.state = STATES.CHASE_DODGE;
    this.stateTimer = 0.22;
    this.invulnerableTimer = 0.22;
    this.chaseDodgeWindow = 0; // Consume chase dodge

    let dirX = this.isFacingRight ? 1 : -1;
    let dirY = 0;
    if (left) dirX = -1;
    if (right) dirX = 1;
    if (up) dirY = -1;
    if (down) dirY = 1;

    const len = Math.hypot(dirX, dirY);
    const speed = 640;
    this.vx = (dirX / len) * speed;
    this.vy = (dirY / len) * speed;

    particles.emitHitSpark(this.x, this.y, this.config.secondaryColor, false);
    particles.addGhostTrail(this.x, this.y, this.width, this.height, this.isFacingRight, this.config.secondaryColor);
  }

  updateDodge(dt) {
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.vx *= Math.pow(0.12, dt);
    this.vy *= Math.pow(0.12, dt);

    if (this.stateTimer <= 0) {
      this.state = this.isGrounded ? STATES.IDLE : STATES.FALL;
    }
  }

  // =========================================================================
  // 2. COMBAT & WEAPON ATTACK PHASES (STARTUP, ACTIVE, RECOVERY)
  // =========================================================================
  checkAttackTriggers(input) {
    const buffered = this.inputBuffer || input;
    const { light, heavy, up, down, left, right } = buffered;

    if (heavy) {
      this.inputBuffer = null;
      this.statsData.attacksAttempted++;
      if (!this.isGrounded && up) {
        this.startAttack('recovery');
      } else if (!this.isGrounded && down) {
        this.startAttack('groundPound');
      } else {
        this.startSignature(up, down, left || right);
      }
    } else if (light) {
      this.inputBuffer = null;
      this.statsData.attacksAttempted++;
      if (this.isGrounded) {
        if (down) this.startAttack('dLight');
        else if (up) this.startAttack('nLight');
        else if (left || right) this.startAttack('sLight');
        else this.startAttack('nLight');
      } else {
        // Aerials
        if (down) this.startAttack('dAir');
        else if (up) this.startAttack('nAir');
        else this.startAttack('sAir');
      }
    }
  }

  startAttack(moveKey) {
    const attacks = this.weaponAttacks;
    let attackData = attacks[moveKey];

    // Fallbacks for recovery / ground pound
    if (!attackData) {
      if (moveKey === 'recovery') {
        attackData = {
          name: 'Aerial Recovery',
          startup: 0.1, active: 0.22, recovery: 0.18,
          damage: 16, baseKnockback: 390, scaling: 1.5, angle: -Math.PI / 2,
          hitbox: { x: 0, y: -48, w: 64, h: 72 },
          swoosh: { radius: 56, sweep: Math.PI * 1.6, rot: -Math.PI / 2 },
          sound: this.config.weaponType,
          isHeavy: true,
          lift: -680
        };
      } else if (moveKey === 'groundPound') {
        attackData = {
          name: 'Ground Pound',
          startup: 0.14, active: 0.9, recovery: 0.16,
          damage: 18, baseKnockback: 440, scaling: 1.7, angle: Math.PI / 2,
          hitbox: { x: 0, y: 38, w: 58, h: 54 },
          swoosh: { radius: 50, sweep: Math.PI * 1.0, rot: Math.PI / 2 },
          sound: this.config.weaponType,
          isHeavy: true,
          diveSpeed: 680
        };
      }
    }

    sound.playWeaponSlash(this.config.weaponType);
    this.currentAttack = { ...attackData, key: moveKey };
    this.state = STATES.ATTACK_STARTUP;
    this.stateTimer = attackData.startup;
    this.hasHitOpponent = false;
    this.activeHitbox = null;

    // Forward Step on Light Attacks
    if (attackData.stepForward && this.isGrounded) {
      this.vx = (this.isFacingRight ? 1 : -1) * attackData.stepForward;
    }
  }

  startSignature(isUp, isDown, isSide) {
    sound.playWeaponSlash(this.config.weaponType);
    const forward = this.isFacingRight ? 1 : -1;
    let sigName = this.config.sigNames.side;
    let sigHitbox = { x: 55, y: -8, w: 80, h: 52 };
    let sigAngle = forward > 0 ? -0.22 : -Math.PI + 0.22;
    let sigSwoosh = { radius: 68, sweep: Math.PI * 1.1, rot: 0 };
    let impulseX = forward * 380;
    let impulseY = 0;

    if (isUp) {
      sigName = this.config.sigNames.neutral;
      sigHitbox = { x: 18, y: -62, w: 72, h: 78 };
      sigAngle = -Math.PI / 2.15;
      sigSwoosh = { radius: 65, sweep: Math.PI * 1.5, rot: -Math.PI / 2 };
      impulseX = forward * 90;
      impulseY = -240;
    } else if (isDown) {
      sigName = this.config.sigNames.down;
      sigHitbox = { x: 0, y: 22, w: 120, h: 48 };
      sigAngle = forward > 0 ? -0.32 : -Math.PI + 0.32;
      sigSwoosh = { radius: 72, sweep: Math.PI * 1.8, rot: 0.5 };
      impulseX = 0;
      impulseY = 0;
    }

    const baseDmg = 17 + (this.config.stats.str * 1.4);
    const sigData = {
      name: sigName,
      startup: 0.15, active: 0.24, recovery: 0.24,
      damage: baseDmg, baseKnockback: 420, scaling: 1.85, angle: sigAngle,
      hitbox: sigHitbox,
      swoosh: sigSwoosh,
      sound: this.config.weaponType,
      isHeavy: true,
      impulseX,
      impulseY
    };

    this.currentAttack = sigData;
    this.state = STATES.ATTACK_STARTUP;
    this.stateTimer = sigData.startup;
    this.hasHitOpponent = false;
    this.activeHitbox = null;

    particles.emitSigAura(this.x, this.y, this.config.secondaryColor);
  }

  updateAttackPhases(dt, dexFactor) {
    const atk = this.currentAttack;
    if (!atk) {
      this.state = this.isGrounded ? STATES.IDLE : STATES.FALL;
      return;
    }

    // Active Ground Pound plunge
    if (atk.diveSpeed && this.state === STATES.ATTACK_ACTIVE) {
      this.vy = atk.diveSpeed;
      this.x += this.vx * dt;
      this.y += this.vy * dt;
      if (this.isGrounded) {
        sound.playHeavyHit();
        particles.emitHitSpark(this.x, this.y + this.height / 2, '#f59e0b', true);
        this.state = STATES.ATTACK_RECOVERY;
        this.stateTimer = atk.recovery;
        this.activeHitbox = null;
        return;
      }
    } else {
      this.x += this.vx * dt;
      this.y += this.vy * dt;
      this.vx *= Math.pow(0.4, dt);
      if (!this.isGrounded) this.applyGravity(dt);
    }

    switch (this.state) {
      case STATES.ATTACK_STARTUP:
        if (this.stateTimer <= 0) {
          // Transition into ACTIVE hit frames!
          this.state = STATES.ATTACK_ACTIVE;
          this.stateTimer = atk.active;

          const forward = this.isFacingRight ? 1 : -1;
          const hb = atk.hitbox;
          this.activeHitbox = {
            xOffset: forward * hb.x,
            yOffset: hb.y,
            w: hb.w,
            h: hb.h,
            damage: atk.damage,
            baseKnockback: atk.baseKnockback,
            scaling: atk.scaling,
            angle: atk.angle || (forward > 0 ? -0.25 : -Math.PI + 0.25),
            isHeavy: atk.isHeavy || false,
            isComboStarter: atk.isComboStarter || false
          };

          // Apply Sig / Attack Momentum
          if (atk.impulseX) this.vx = atk.impulseX;
          if (atk.impulseY) this.vy = atk.impulseY;
          if (atk.lift) this.vy = atk.lift;

          // Spawn Weapon Arc Swoosh
          if (atk.swoosh) {
            particles.addSlashSwoosh(
              this.x + forward * hb.x * 0.7,
              this.y + hb.y,
              atk.swoosh.radius,
              atk.swoosh.sweep,
              atk.swoosh.rot,
              this.isFacingRight,
              this.config.secondaryColor
            );
          }
        }
        break;

      case STATES.ATTACK_ACTIVE:
        if (this.stateTimer <= 0) {
          // Transition to Recovery / Endlag
          this.state = STATES.ATTACK_RECOVERY;
          this.stateTimer = atk.recovery / dexFactor; // Faster recovery with higher Dexterity!
          this.activeHitbox = null;
        }
        break;

      case STATES.ATTACK_RECOVERY:
        // Allow input buffering / combo cancel in late endlag
        if (this.inputBuffer && this.stateTimer < 0.08) {
          this.checkAttackTriggers(this.inputBuffer);
          return;
        }
        if (this.stateTimer <= 0) {
          this.state = this.isGrounded ? STATES.IDLE : STATES.FALL;
          this.currentAttack = null;
        }
        break;
    }
  }

  // =========================================================================
  // 3. HIT RECEPTION, KNOCKBACK & CHASE DODGE CONFIRMS
  // =========================================================================
  takeHit(hitbox, attacker) {
    if (this.invulnerableTimer > 0) return false;

    this.damage += hitbox.damage;
    this.renderFlash = 0.14;
    this.invulnerableTimer = 0.08;

    attacker.statsData.damageDealt += hitbox.damage;
    attacker.statsData.attacksLanded++;

    // Increment attacker's combo count
    attacker.comboCount++;
    attacker.comboResetTimer = 1.1; // Window to keep combo going
    attacker.chaseDodgeWindow = 0.32; // Free Chase Dodge unlocked!

    // Floating Combat Damage Text & Combo popup
    particles.addDamageText(this.x, this.y, hitbox.damage, hitbox.isHeavy);
    if (attacker.comboCount >= 2) {
      particles.addComboText(this.x, this.y, attacker.comboCount);
      sound.playComboChime(attacker.comboCount);
    }

    // Authentic Brawlhalla Knockback Formula:
    // v = baseKnockback + (damage * scaling * 0.13) / (1 + def * 0.05)
    const defMultiplier = 1 + (this.config.stats.def * 0.05);
    const knockback = (hitbox.baseKnockback + (this.damage * hitbox.scaling * 0.13)) / defMultiplier;

    this.vx = Math.cos(hitbox.angle) * knockback;
    this.vy = Math.sin(hitbox.angle) * knockback;

    // Calculate Hitstun Duration
    const hitstun = Math.min(0.22 + (knockback / 750) * 0.45, 0.75);
    this.state = STATES.STUNNED;
    this.stateTimer = hitstun;
    this.activeHitbox = null;
    this.currentAttack = null;
    this.isGrounded = false;
    this.isWallClinging = false;
    this.isFastFalling = false;

    // Squash on impact
    this.scaleX = 1.35;
    this.scaleY = 0.75;

    // Audio & Particle FX
    if (hitbox.isHeavy || this.damage > 120) {
      sound.playHeavyHit();
      particles.emitHitSpark(this.x, this.y, attacker.config.secondaryColor, true);
    } else {
      sound.playLightHit();
      particles.emitHitSpark(this.x, this.y, '#ffffff', false);
    }

    return true;
  }

  getHitboxBounds() {
    if (!this.activeHitbox) return null;
    const hb = this.activeHitbox;
    return {
      x: this.x + hb.xOffset - hb.w / 2,
      y: this.y + hb.yOffset - hb.h / 2,
      w: hb.w,
      h: hb.h,
      data: hb
    };
  }

  getHurtboxBounds() {
    return {
      x: this.x - this.width / 2,
      y: this.y - this.height / 2,
      w: this.width,
      h: this.height
    };
  }

  // Secondary Cape Simulation
  updateCapePhysics(dt) {
    const targetBend = -this.vx * 0.04 - (this.isFacingRight ? 1 : -1) * 4;
    for (let i = 0; i < this.capeWave.length; i++) {
      const prev = i === 0 ? targetBend : this.capeWave[i - 1];
      this.capeWave[i] += (prev - this.capeWave[i]) * 15 * dt;
    }
  }

  // =========================================================================
  // 4. ARTICULATED VECTOR-SKELETAL RENDERING
  // =========================================================================
  render(ctx, showHitboxes = false) {
    ctx.save();

    // Invulnerability Blink
    if (this.invulnerableTimer > 0 && Math.floor(this.animTime * 24) % 2 === 0) {
      ctx.globalAlpha = 0.45;
    }

    ctx.translate(this.x, this.y);

    // Squash & Stretch
    ctx.scale(this.scaleX, this.scaleY);

    // Direction Flip
    if (!this.isFacingRight) {
      ctx.scale(-1, 1);
    }

    // Flash white on hit
    if (this.renderFlash > 0) {
      ctx.filter = 'brightness(320%)';
    }

    this.drawArticulatedLegend(ctx);

    ctx.restore();

    // Debug Hitbox / Hurtbox Overlay
    if (showHitboxes) {
      ctx.save();
      const hurt = this.getHurtboxBounds();
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 2;
      ctx.strokeRect(hurt.x, hurt.y, hurt.w, hurt.h);

      const hit = this.getHitboxBounds();
      if (hit) {
        ctx.strokeStyle = '#ef4444';
        ctx.fillStyle = 'rgba(239, 68, 68, 0.35)';
        ctx.lineWidth = 2;
        ctx.fillRect(hit.x, hit.y, hit.w, hit.h);
        ctx.strokeRect(hit.x, hit.y, hit.w, hit.h);
      }
      ctx.restore();
    }
  }

  drawArticulatedLegend(ctx) {
    const cfg = this.config;
    const t = this.animTime;

    // Running Gait & Breathing Calculations
    let bobY = 0;
    let thighAngleL = 0, calfAngleL = 0;
    let thighAngleR = 0, calfAngleR = 0;
    let armAngleBack = 0.2, armAngleFront = -0.2;

    if (this.state === STATES.RUN) {
      const stepFreq = 16;
      bobY = Math.abs(Math.sin(t * stepFreq)) * 5 - 2;
      const legCycle = Math.sin(t * stepFreq);
      thighAngleL = legCycle * 0.7;
      calfAngleL = Math.max(0, -legCycle * 0.8);
      thighAngleR = -legCycle * 0.7;
      calfAngleR = Math.max(0, legCycle * 0.8);
      armAngleBack = -legCycle * 0.6;
      armAngleFront = legCycle * 0.6;
    } else if (this.state === STATES.IDLE) {
      bobY = Math.sin(t * 4.5) * 2;
      thighAngleL = 0.05;
      thighAngleR = -0.05;
    } else if (this.state === STATES.JUMP || this.state === STATES.FALL) {
      thighAngleL = -0.4;
      calfAngleL = 0.5;
      thighAngleR = 0.2;
      calfAngleR = 0.3;
      armAngleFront = -0.8;
      armAngleBack = -0.5;
    } else if (this.state === STATES.WALL_SLIDE) {
      thighAngleL = -0.3;
      thighAngleR = 0.1;
      armAngleFront = 1.2;
    }

    // Shadow on ground
    if (this.isGrounded) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
      ctx.beginPath();
      ctx.ellipse(0, this.height / 2 - 2, 20 * this.scaleX, 5, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // 1. BILLOWING MULTI-SEGMENT CAPE
    ctx.save();
    ctx.fillStyle = cfg.capeColor;
    ctx.beginPath();
    const c0 = this.capeWave[0];
    const c1 = this.capeWave[1];
    const c2 = this.capeWave[2];
    ctx.moveTo(-10, -18 + bobY);
    ctx.quadraticCurveTo(-22 + c0, 0 + bobY, -30 + c1, 22 + bobY);
    ctx.lineTo(-24 + c2, 24 + bobY);
    ctx.quadraticCurveTo(-14 + c0, 6 + bobY, -6, -12 + bobY);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // 2. BACK LEG (THIGH -> CALF -> BOOT)
    this.drawJointedLeg(ctx, -7, 10 + bobY, thighAngleR, calfAngleR, cfg.secondaryColor, '#0f172a');

    // 3. TORSO WITH LEAN
    ctx.save();
    ctx.translate(0, -6 + bobY);
    ctx.rotate(this.torsoLean);

    // Torso Plate
    ctx.fillStyle = cfg.primaryColor;
    ctx.beginPath();
    ctx.roundRect(-14, -14, 28, 28, [6, 6, 3, 3]);
    ctx.fill();

    // Golden Armor Trim
    ctx.strokeStyle = cfg.secondaryColor;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(-7, -8);
    ctx.lineTo(0, 0);
    ctx.lineTo(7, -8);
    ctx.stroke();

    // Belt / Fauld
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-13, 10, 26, 5);

    // 4. BACK ARM & SHOULDER PAD
    ctx.save();
    ctx.translate(-14, -8);
    ctx.rotate(armAngleBack);
    ctx.fillStyle = cfg.primaryColor;
    ctx.fillRect(-4, 0, 8, 18);
    ctx.restore();

    // 5. HEAD, HELMET & ANIMATED EYES
    ctx.save();
    ctx.translate(0, -22);

    // Head Base
    ctx.fillStyle = cfg.skinColor;
    ctx.beginPath();
    ctx.arc(0, 0, 13, 0, Math.PI * 2);
    ctx.fill();

    // Hair / Crown / Helmet
    ctx.fillStyle = cfg.hairColor;
    ctx.beginPath();
    ctx.arc(0, -4, 14, Math.PI, Math.PI * 2);
    ctx.lineTo(14, 2);
    ctx.lineTo(8, 4);
    ctx.lineTo(-8, 4);
    ctx.lineTo(-14, 2);
    ctx.closePath();
    ctx.fill();

    // Expressive Eyes
    ctx.fillStyle = '#0f172a';
    if (this.state === STATES.STUNNED) {
      // Wide stunned eyes
      ctx.beginPath();
      ctx.arc(5, -2, 3, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Focused Battle Gaze
      ctx.fillRect(4, -3, 4, 3.5);
    }

    ctx.restore(); // Head end

    // 6. FRONT ARM & WEAPON ARTICULATION
    this.drawFrontArmAndWeapon(ctx, armAngleFront, bobY);

    ctx.restore(); // Torso end

    // 7. FRONT LEG
    this.drawJointedLeg(ctx, 7, 10 + bobY, thighAngleL, calfAngleL, cfg.secondaryColor, '#0f172a');
  }

  drawJointedLeg(ctx, hipX, hipY, thighAngle, calfAngle, armorColor, bootColor) {
    ctx.save();
    ctx.translate(hipX, hipY);
    ctx.rotate(thighAngle);

    // Thigh
    ctx.fillStyle = armorColor;
    ctx.fillRect(-5, 0, 10, 14);

    // Knee joint to Calf
    ctx.translate(0, 12);
    ctx.rotate(calfAngle);

    // Calf
    ctx.fillStyle = armorColor;
    ctx.fillRect(-4.5, 0, 9, 13);

    // Boot
    ctx.fillStyle = bootColor;
    ctx.beginPath();
    ctx.roundRect(-5, 10, 12, 7, [2, 4, 1, 1]);
    ctx.fill();

    ctx.restore();
  }

  drawFrontArmAndWeapon(ctx, armAngle, bobY) {
    const cfg = this.config;
    const isAttacking = [STATES.ATTACK_STARTUP, STATES.ATTACK_ACTIVE, STATES.ATTACK_RECOVERY].includes(this.state);

    ctx.save();
    ctx.translate(12, -8);

    // Calculate attack arm rotation dynamically
    let poseAngle = armAngle;
    if (isAttacking) {
      if (this.state === STATES.ATTACK_STARTUP) poseAngle = -0.8; // Pull back
      else if (this.state === STATES.ATTACK_ACTIVE) poseAngle = 0.6; // Thrust/Slash forward
      else if (this.state === STATES.ATTACK_RECOVERY) poseAngle = 0.2; // Recoil
    }

    ctx.rotate(poseAngle);

    // Shoulder Pad / Pauldron
    ctx.fillStyle = cfg.secondaryColor;
    ctx.beginPath();
    ctx.ellipse(0, 0, 6, 7, 0, 0, Math.PI * 2);
    ctx.fill();

    // Forearm
    ctx.fillStyle = cfg.primaryColor;
    ctx.fillRect(-3.5, 2, 7, 15);

    // Hand gripping weapon
    ctx.translate(0, 17);
    ctx.fillStyle = cfg.skinColor;
    ctx.beginPath();
    ctx.arc(0, 0, 4, 0, Math.PI * 2);
    ctx.fill();

    // Draw Detailed Weapon Asset
    this.renderWeaponAsset(ctx);

    ctx.restore();
  }

  renderWeaponAsset(ctx) {
    const type = this.config.weaponType;

    switch (type) {
      case 'sword':
        // Double-edged Steel Blade with Crossguard & Pommel
        ctx.fillStyle = '#e2e8f0';
        ctx.beginPath();
        ctx.moveTo(-3, 0);
        ctx.lineTo(-3.5, 38);
        ctx.lineTo(0, 46);
        ctx.lineTo(3.5, 38);
        ctx.lineTo(3, 0);
        ctx.closePath();
        ctx.fill();
        // Fuller groove
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(0, 4);
        ctx.lineTo(0, 34);
        ctx.stroke();
        // Golden Crossguard
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(-8, -2, 16, 5);
        break;

      case 'blasters':
        // Heavy Mag Blaster
        ctx.fillStyle = '#334155';
        ctx.fillRect(-3, -2, 7, 16);
        ctx.fillStyle = '#ea580c';
        ctx.fillRect(-5, 8, 11, 7);
        // Energy Muzzle
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(-2, 14, 5, 4);
        break;

      case 'lance':
        // Rocket Lance with Flame Core & Thruster Cone
        ctx.fillStyle = '#0284c7';
        ctx.beginPath();
        ctx.moveTo(-6, -4);
        ctx.lineTo(-7, 24);
        ctx.lineTo(0, 52);
        ctx.lineTo(7, 24);
        ctx.lineTo(6, -4);
        ctx.closePath();
        ctx.fill();
        // Core Ring
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(-9, 10, 18, 5);
        break;

      case 'katars':
        // Curved Serrated Katar Blade
        ctx.fillStyle = '#a855f7';
        ctx.beginPath();
        ctx.moveTo(-4, -2);
        ctx.quadraticCurveTo(12, 14, 0, 32);
        ctx.quadraticCurveTo(-6, 16, -4, -2);
        ctx.closePath();
        ctx.fill();
        break;

      case 'spear':
        // Long Steel Spear Polearm & Energy Tip
        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.moveTo(0, -18);
        ctx.lineTo(0, 52);
        ctx.stroke();
        // Emerald Spearhead
        ctx.fillStyle = '#14b8a6';
        ctx.beginPath();
        ctx.moveTo(-6, 42);
        ctx.lineTo(0, 62);
        ctx.lineTo(6, 42);
        ctx.closePath();
        ctx.fill();
        break;
    }
  }
}
