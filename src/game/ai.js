/**
 * Intelligent Platform Fighter AI implementing competitive spacing,
 * off-stage aerial recovery, wall jumping, true combo extensions,
 * dash dancing, and chase dodge follow-ups.
 */

export class FighterAI {
  constructor(difficulty = 'normal') {
    this.difficulty = difficulty;
    this.reactionTimer = 0;
    this.lastDecision = {};
  }

  setDifficulty(diff) {
    this.difficulty = diff;
  }

  update(bot, target, stage, dt) {
    this.reactionTimer -= dt;

    // Simulate human reaction times based on difficulty
    const reactionDelay = this.difficulty === 'hard' ? 0.04 : (this.difficulty === 'normal' ? 0.11 : 0.25);
    if (this.reactionTimer > 0) {
      return this.lastDecision;
    }
    this.reactionTimer = reactionDelay;

    const inputState = {
      left: false,
      right: false,
      up: false,
      down: false,
      jump: false,
      light: false,
      heavy: false,
      dodge: false
    };

    const dx = target.x - bot.x;
    const dy = target.y - bot.y;
    const dist = Math.hypot(dx, dy);

    const stageCenter = stage.mainPlatform.x + stage.mainPlatform.w / 2;
    const stageLeft = stage.mainPlatform.x;
    const stageRight = stage.mainPlatform.x + stage.mainPlatform.w;
    const stageTop = stage.mainPlatform.y;

    const isOffstage = bot.x < stageLeft - 30 || bot.x > stageRight + 30 || bot.y > stageTop + 50;

    // ==========================================
    // 1. RECOVERY BEHAVIOR (HIGHEST PRIORITY)
    // ==========================================
    if (isOffstage) {
      // Aim back towards the stage center
      if (bot.x < stageCenter) {
        inputState.right = true;
      } else {
        inputState.left = true;
      }

      // Wall Cling handling
      if (bot.isWallClinging) {
        inputState.jump = true; // Wall jump
        this.lastDecision = inputState;
        return inputState;
      }

      // If falling below stage edge, jump or use Recovery
      if (bot.y > stageTop) {
        if (bot.jumpsRemaining > 0) {
          inputState.jump = true;
        } else if (bot.vy > 0 && bot.stateTimer <= 0) {
          // Aerial Recovery (Up + Heavy)
          inputState.up = true;
          inputState.heavy = true;
        }
      }

      this.lastDecision = inputState;
      return inputState;
    }

    // ==========================================
    // 2. CHASE DODGE FOLLOW-UP
    // ==========================================
    if (bot.chaseDodgeWindow > 0 && this.difficulty !== 'easy') {
      inputState.dodge = true;
      if (dx > 0) inputState.right = true;
      else inputState.left = true;
      if (dy < -20) inputState.up = true;
      this.lastDecision = inputState;
      return inputState;
    }

    // ==========================================
    // 3. DEFENSIVE / DODGE LOGIC
    // ==========================================
    const opponentIsAttacking = target.activeHitbox !== null;
    const dodgeChance = this.difficulty === 'hard' ? 0.75 : (this.difficulty === 'normal' ? 0.42 : 0.15);

    if (opponentIsAttacking && dist < 125 && Math.random() < dodgeChance && bot.dodgeCooldown <= 0) {
      inputState.dodge = true;
      // Dash away or spot dodge
      if (dx > 0) inputState.left = true;
      else inputState.right = true;

      this.lastDecision = inputState;
      return inputState;
    }

    // ==========================================
    // 4. EDGE-GUARDING WITH GROUND POUND
    // ==========================================
    if (Math.abs(dx) < 45 && dy > 60 && !bot.isGrounded && this.difficulty !== 'easy') {
      inputState.down = true;
      inputState.heavy = true;
      this.lastDecision = inputState;
      return inputState;
    }

    // ==========================================
    // 5. TRUE COMBOS & ATTACK EXECUTION
    // ==========================================
    // If target is airborne right above us (e.g. after DLight pop-up): Follow up with SAir or Recovery!
    if (Math.abs(dx) < 65 && dy < -30 && dy > -120) {
      inputState.jump = true;
      inputState.light = true;
      if (dx > 0) inputState.right = true;
      else inputState.left = true;
      this.lastDecision = inputState;
      return inputState;
    }

    // In Strike Range (< 85px)
    if (dist < 85) {
      if (dx > 0) inputState.right = true;
      else inputState.left = true;

      // Finish with Signature if opponent has high damage (> 90%)
      if (target.damage > 90 && Math.random() < 0.6) {
        inputState.heavy = true;
        if (Math.abs(dy) > 30) {
          inputState.up = dy < 0;
          inputState.down = dy > 0;
        }
      } else {
        // Fast Light Attack strings (DLight combo starter preferred on ground)
        inputState.light = true;
        if (bot.isGrounded && Math.random() < 0.65) {
          inputState.down = true; // DLight combo starter!
        } else if (dy < -20) {
          inputState.up = true;
        } else if (dy > 20) {
          inputState.down = true;
        }
      }

      this.lastDecision = inputState;
      return inputState;
    }

    // ==========================================
    // 6. NEUTRAL APPROACH, DASH DANCING & POSITIONING
    // ==========================================
    // Ground Dash approach if far away
    if (dist > 180 && bot.isGrounded && bot.dodgeCooldown <= 0 && Math.random() < 0.35) {
      inputState.dodge = true;
      if (dx > 0) inputState.right = true;
      else inputState.left = true;
      this.lastDecision = inputState;
      return inputState;
    }

    // Move towards target
    if (dx > 25) {
      inputState.right = true;
    } else if (dx < -25) {
      inputState.left = true;
    }

    // Jump onto platforms if target is above
    if (dy < -60) {
      if (bot.isGrounded || (bot.jumpsRemaining > 0 && Math.random() < 0.25)) {
        inputState.jump = true;
      }
    }

    // Drop through soft platform if target is below
    if (dy > 80 && bot.isGrounded) {
      inputState.down = true;
    }

    this.lastDecision = inputState;
    return inputState;
  }
}
